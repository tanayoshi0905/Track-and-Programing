/**
 * AIが抽出したラベルの種別案
 */
export type AiLabelType =
  | "room"
  | "office"
  | "entrance"
  | "restroom"
  | "stairs"
  | "elevator"
  | "reception"
  | "facility"
  | "corridor"
  | "zone"
  | "other";

/**
 * 採用ステータス
 */
export type AdoptedStatus = "pending" | "adopted" | "ignored";

/**
 * 座標データ (0〜1 の相対座標)
 */
export interface AiPosition {
  x: number;
  y: number;
}

/**
 * AIが抽出した個別のラベルデータ
 */
export interface AiExtractedLabel {
  id: string;
  text: string;
  type: AiLabelType;
  confidence: number;
  approxPosition: AiPosition;
  width?: number; // 0〜1 の相対幅
  height?: number; // 0〜1 の相対高さ
  status: AdoptedStatus;
  floorNumber?: number;
}

/**
 * Gemini API レスポンスのシミュレーション
 */
export interface AiExtractedMapResponse {
  labels: AiExtractedLabel[];
}
