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

// --------------- モックお知らせ ---------------

export const announcements: Announcement[] = [
  {
    id: "ann-01",
    type: "重要",
    title: "本日の閉場時間は 16:00 です",
    body: "安全確保のため、16:00 以降は会場内に立ち入れません。お早めにお帰りください。",
    timestamp: "2026-10-25 08:00",
  },
  {
    id: "ann-02",
    type: "変更",
    title: "模擬店エリア A の一部メニュー変更",
    body: "たこ焼きの販売開始が 12:00 に変更になりました。ご了承ください。",
    timestamp: "2026-10-25 09:30",
  },
  {
    id: "ann-03",
    type: "案内",
    title: "スタンプラリー開催中！",
    body: "会場内5か所のスタンプを集めると景品がもらえます。台紙は総合受付で配布中。",
    timestamp: "2026-10-25 09:00",
  },
];
