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
あなたは、建物の平面図・校内配置図から「利用者向け案内に使える地点候補」を抽出するアシスタントです。

入力として与えられるのは、日本語を含む建物の平面図画像です。
この画像を見て、図面上に書かれている文字や記号のうち、利用者向けの簡易マップに載せる価値がある地点情報だけを抽出してください。

目的:
- 学校イベントや施設案内で使う簡易マップを生成するため
- OCRのような単なる全文字抽出ではなく、「意味のある地点候補」の抽出を行いたい
- ノイズや読みにくい断片文字列は除外したい

抽出対象:
- 教室名, 部屋番号, 事務室, 受付, 保健室, 図書館, トイレ, 階段, エレベーター, 昇降口, 入口, 出口, ホール, 本部, 特別教室, 利用者が場所を探すときに重要な設備・施設名

除外対象:
- 意味をなさない文字断片, 単独の記号, 線や枠の誤認識, 判読困難で意味が推定できない短い文字列, 同じ場所の重複抽出, 利用者案内に不要な微細な注記

出力条件:
- 必ず JSON のみを返してください
- 説明文は不要です
- Markdown のコードブロック文字(\`\`\`json など)も含めないでください
- 推測しすぎず、読めるものを中心に出してください
- ただし、図面として自然に読める場合は多少の補完をしてよいです
- 各候補には、図面上のおおよその位置（中心座標）も含めてください
- 座標は画像全体を基準に 0.0〜1.0 の相対値で返してください (x は左から右、y は上から下)
- 「width」と「height」も 0.0〜1.0 の相対値で、その文字や部屋が占めるおおよそのサイズを含めてください
- confidence は 0.0〜1.0 の範囲で返してください

返却JSON形式:
{
  "labels": [
    {
      "text": "ICT準備室",
      "type": "room",
      "confidence": 0.93,
      "approxPosition": {
        "x": 0.42,
        "y": 0.31,
        "width": 0.15,
        "height": 0.05
      }
    }
  ]
}

判定ルール:
- 教室名や部屋名=room, 事務室/職員室=office, 受付=reception, トイレ=restroom, 階段=stairs, ELV/EV=elevator, 入口/昇降口=entrance, 出口=exit, ホール=hall, 図書館=library, 保健室=infirmary, その他=facility/other
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
    const labels: any[] = result.labels || [];

    const extractedTexts: string[] = [];
    const roomCandidates: RoomCandidate[] = [];

    labels.forEach((label) => {
      const text = label.text;
      const confidence = label.confidence || 0.8;
      const appx = label.approxPosition || { x: 0, y: 0, width: 0.1, height: 0.05 };

      extractedTexts.push(text);

      // フロントエンドは 0〜100 のパーセンテージを期待しているため変換する
      roomCandidates.push({
        name: text,
        x: appx.x * 100,
        y: appx.y * 100,
        // AIがwidth/heightを返さなかった場合のデフォルトサイズ(10%, 4%)
        width: (appx.width || 0.10) * 100,
        height: (appx.height || 0.04) * 100,
        confidence: confidence,
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
