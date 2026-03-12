// ============================================================
// マップ型情報共有システム — データ型・モックデータ
// ============================================================

// --------------- 型定義 ---------------

export type AnnouncementType = "重要" | "変更" | "案内";

export type CategoryId =
  | "reception"
  | "food"
  | "exhibition"
  | "experience"
  | "facility"
  | "restroom";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface Location {
  id: string;
  name: string;
  shortName: string;
  category: CategoryId;
  description: string;
  hours: string;
  notes: string;
  changeInfo?: string;
  /** SVG座標 (0–100 の正規化座標) */
  position: { x: number; y: number };
}

export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  body: string;
  timestamp: string;
}

// --------------- カテゴリ一覧 ---------------

export const categories: Category[] = [
  { id: "reception", label: "受付" },
  { id: "food", label: "飲食" },
  { id: "exhibition", label: "展示" },
  { id: "experience", label: "体験" },
  { id: "facility", label: "設備" },
  { id: "restroom", label: "トイレ" },
];

export function getCategoryLabel(id: CategoryId): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}

// --------------- 地点データは Firestore から取得 ---------------
// useLocations() フック (src/hooks/use-locations.ts) 経由で
// /api/locations API から取得してください。

// --------------- お知らせデータは Firestore から取得 ---------------
// useAnnouncements() フック (src/hooks/use-announcements.ts) 経由で
// /api/announcements API から取得してください。

