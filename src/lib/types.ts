// ============================================================
// マップ型情報共有システム — 型定義
// Firestore のドキュメント構造に合わせた型
// ============================================================

/** ピンのカテゴリ */
export const PIN_CATEGORIES = [
  "受付",
  "飲食",
  "展示",
  "体験",
  "設備",
  "トイレ",
] as const;
export type PinCategory = (typeof PIN_CATEGORIES)[number];

/** お知らせの種別 */
export const ANNOUNCEMENT_TYPES = ["重要", "変更", "案内"] as const;
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

/** イベント基本情報 (Firestore: events コレクション) */
export interface EventInfo {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  subtitle: string;
  isPublished: boolean;
  mapImageUrl: string;
}

/** 地図上のピン (Firestore: locations コレクション) */
export interface MapPin {
  id: string;
  eventId: string;
  x: number; // 画像上の位置 (0–100 %)
  y: number;
  name: string;
  shortName: string;
  category: PinCategory;
  description: string;
  openTime: string;
  notes: string;
}

/** お知らせ (Firestore: notices コレクション) */
export interface Announcement {
  id: string;
  eventId: string;
  type: AnnouncementType;
  title: string;
  body: string;
}

// ============================================================
// 階層別マップ + OCR 機能
// ============================================================

/** フロアマップの OCR ステータス */
export type OcrStatus = "none" | "uploaded" | "processing" | "done" | "error";

/** 建物情報 (Firestore: buildings コレクション) */
export interface Building {
  id: string;
  name: string;
  totalFloors?: number;
  createdAt?: string | Date | any;
  eventId?: string;
  isPublished?: boolean;
}

/** フロアマップ (Firestore: floorMaps コレクション) */
export interface FloorMap {
  id: string;
  buildingId: string;
  floorNumber: number;
  fileName: string;
  fileType: string; // "image/png" | "image/jpeg" | "application/pdf"
  storagePath: string;
  downloadUrl: string;
  ocrStatus: OcrStatus;
  eventId?: string;
  isPublished?: boolean;
}

/** OCR 結果の部屋候補 */
export interface RoomCandidate {
  name: string;
  x: number; // 画像上の位置 (0–100 %)
  y: number;
  width: number;
  height: number;
  confidence: number;
}

/** OCR 結果 (Firestore: ocrResults コレクション) */
export interface OcrResult {
  id: string;
  buildingId: string;
  floorNumber: number;
  sourceFloorMapId: string;
  extractedTexts: string[];
  roomCandidates: RoomCandidate[];
  simplifiedMapData: Record<string, unknown>;
  eventId?: string;
  isPublished?: boolean;
}
