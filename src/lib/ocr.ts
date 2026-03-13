"use server";

// ============================================================
// OCR ラッパー — Google Gemini Vision API
// Python + Tesseract から Gemini の高精度マルチモーダルへと完全移行
// ============================================================

import type { RoomCandidate } from "@/lib/types";
import { GoogleGenAI } from "@google/genai";

interface OcrOutput {
  extractedTexts: string[];
  roomCandidates: RoomCandidate[];
}

const SYSTEM_PROMPT = `
あなたは、学校施設やイベント会場の平面図・フロアマップを解析し、
Webアプリ上で見やすい簡易地図UIを生成するための構造化データを作るアシスタントです。

入力される画像は、学校や施設のフロアマップ、配置図、平面図です。
この画像を見て、単なるOCR結果ではなく、
「部屋」「廊下」「ゾーン」「設備」を含む簡易地図構造を JSON で返してください。

重要:
このJSONは、元画像をそのまま表示するのではなく、
アプリ側で新しい簡易地図UIを生成するために使います。
そのため、元図面を厳密に再現する必要はありません。
重要なのは、利用者や管理者が見て「フロアの構成」が理解できることです。

特に重要:
corridors は簡易地図UIの構造理解に必須です。
図面中に「廊下」という文字が明示されていなくても、
複数の部屋の前後や間に存在する細長い移動空間を推定して、
必ず 1 件以上の corridor を返してください。
corridors が 0 件になることは避けてください。

【抽出してほしい構造】
1. rooms: 教室, 事務室, 特別教室など (type: room, office, facility)
2. corridors: 廊下, 主要通路 (roomsが複数ある場合は、少なくとも1件以上返してください)
3. zones: 棟やエリアのまとまり (明確な名前がなくても推定で作ってよい)
4. facilities: 入口, トイレ, 階段, エレベーター等 (type: entrance, restroom, stairs, elevator, reception, other)

【重要な判断ルール】
- OCRのように全文字を拾うのではなく、意味のある空間要素を優先する
- room は点ではなく、できるだけ「おおよその部屋領域 (approxArea)」として返す
- corridor は「帯状のエリア (approxArea)」として返す。空間構造から推定して返すこと。
- 複数の rooms が横または縦に並んでいる場合、それらに接続する主要通路を corridor として返す
- facilities は点 (approxPosition) として返す
- 座標は画像左上を (0,0)、右下を (1,1) とした相対座標で返す

【返してほしいJSON形式】
必ず JSON のみを返してください。 Markdown などの装飾は不要です。

{
  "rooms": [
    {
      "id": "room-1",
      "text": "101教室",
      "type": "room",
      "confidence": 0.94,
      "approxArea": { "x": 0.12, "y": 0.20, "w": 0.16, "h": 0.10 },
      "zoneId": "zone-1",
      "connectedCorridorIds": ["corridor-1"]
    }
  ],
  "corridors": [
    {
      "id": "corridor-1",
      "text": "廊下",
      "confidence": 0.78,
      "approxArea": { "x": 0.08, "y": 0.42, "w": 0.78, "h": 0.08 }
    }
  ],
  "facilities": [
    {
      "id": "facility-1",
      "text": "学生昇降口",
      "type": "entrance",
      "confidence": 0.91,
      "approxPosition": { "x": 0.74, "y": 0.15 },
      "zoneId": "zone-1",
      "connectedCorridorIds": ["corridor-1"]
    }
  ]
}
`;

/**
 * 画像バッファを受け取り OCR を実行する
 * （Gemini API を使用した構造化抽出）
 */
export async function performOcr(imageBuffer: Buffer): Promise<OcrOutput> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 環境変数が設定されていません。");
    }

    const ai = new GoogleGenAI({ apiKey });

    // 画像を Base64 にエンコード
    const base64Image = imageBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                data: base64Image,
                mimeType: "image/png",
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    if (!responseText) {
      throw new Error("Gemini API から空の応答が返されました。");
    }

    // JSON のパース
    const result = JSON.parse(responseText);
    const rooms = result.rooms || [];
    const corridors = result.corridors || [];
    const facilities = result.facilities || [];

    const extractedTexts: string[] = [];
    const roomCandidates: RoomCandidate[] = [];

    // Rooms の処理
    rooms.forEach((r: any) => {
      extractedTexts.push(r.text);
      roomCandidates.push({
        name: r.text,
        x: (r.approxArea?.x || 0) * 100,
        y: (r.approxArea?.y || 0) * 100,
        width: (r.approxArea?.w || 0.1) * 100,
        height: (r.approxArea?.h || 0.05) * 100,
        confidence: r.confidence || 0.8,
        type: r.type,
        zoneId: r.zoneId,
        connectedCorridorIds: r.connectedCorridorIds,
      });
    });

    // Facilities の処理 (点として扱う)
    facilities.forEach((f: any) => {
      extractedTexts.push(f.text);
      roomCandidates.push({
        name: f.text,
        x: (f.approxPosition?.x || 0) * 100,
        y: (f.approxPosition?.y || 0) * 100,
        width: 4, // ポイントとしての表示サイズ
        height: 4,
        confidence: f.confidence || 0.8,
        type: f.type,
        zoneId: f.zoneId,
        connectedCorridorIds: f.connectedCorridorIds,
      });
    });

    // Corridors の処理
    corridors.forEach((c: any) => {
      extractedTexts.push(c.text || "廊下");
      roomCandidates.push({
        name: c.text || "廊下",
        x: (c.approxArea?.x || 0) * 100,
        y: (c.approxArea?.y || 0) * 100,
        width: (c.approxArea?.w || 0.1) * 100,
        height: (c.approxArea?.h || 0.05) * 100,
        confidence: c.confidence || 0.7,
        type: "corridor",
      });
    });

    return {
      extractedTexts,
      roomCandidates,
    };
  } catch (error: unknown) {
    console.error("Gemini Vision API execution failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to perform OCR (Gemini): ${errorMessage}`);
  }
}
