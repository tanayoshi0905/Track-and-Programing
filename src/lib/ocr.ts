"use server";

// ============================================================
// OCR ラッパー — Tesseract.js (Node.js)
// 将来的に Google Cloud Vision 等に差し替え可能な設計
// ============================================================

import type { RoomCandidate } from "@/lib/types";

interface OcrOutput {
  extractedTexts: string[];
  roomCandidates: RoomCandidate[];
}

/** Page 内の全 Word を抽出 */
function extractWordsFromPage(page: any): Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number }; confidence: number }> {
  const words: Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number }; confidence: number }> = [];
  if (!page.blocks) return words;
  for (const block of page.blocks) {
    if (!block.paragraphs) continue;
    for (const para of block.paragraphs) {
      if (!para.lines) continue;
      for (const line of para.lines) {
        if (!line.words) continue;
        for (const word of line.words) {
          words.push({
            text: word.text,
            bbox: word.bbox,
            confidence: word.confidence,
          });
        }
      }
    }
  }
  return words;
}

/**
 * 画像バッファを受け取り OCR を実行する
 * MVP では Tesseract.js を使用（日本語 + 英語）
 */
export async function performOcr(imageBuffer: Buffer): Promise<OcrOutput> {
  const Tesseract = await import("tesseract.js");

  const result = await Tesseract.recognize(imageBuffer, "eng", {
    logger: () => {},
  });

  const page = result.data;

  // テキスト行を抽出
  const extractedTexts = page.text
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  // 各 word を RoomCandidate に変換
  const allWords = extractWordsFromPage(page);
  const roomCandidates: RoomCandidate[] = [];

  if (allWords.length > 0) {
    // 画像の推定サイズ（最大の座標から推定）
    let maxX = 1;
    let maxY = 1;
    for (const w of allWords) {
      if (w.bbox.x1 > maxX) maxX = w.bbox.x1;
      if (w.bbox.y1 > maxY) maxY = w.bbox.y1;
    }

    for (const w of allWords) {
      const wordText = w.text.trim();
      if (wordText.length < 2) continue; // 1文字のノイズをスキップ

      roomCandidates.push({
        name: wordText,
        x: (w.bbox.x0 / maxX) * 100,
        y: (w.bbox.y0 / maxY) * 100,
        width: ((w.bbox.x1 - w.bbox.x0) / maxX) * 100,
        height: ((w.bbox.y1 - w.bbox.y0) / maxY) * 100,
        confidence: w.confidence / 100,
      });
    }
  }

  return { extractedTexts, roomCandidates };
}
