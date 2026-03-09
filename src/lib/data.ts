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

// --------------- モック地点データ ---------------

export const locations: Location[] = [
  {
    id: "loc-01",
    name: "総合受付",
    shortName: "受付",
    category: "reception",
    description:
      "パンフレット配布・迷子案内・落とし物受付を行っています。お困りの際はこちらへお越しください。",
    hours: "9:00 – 16:00",
    notes: "車椅子の貸出あり",
    position: { x: 18, y: 25 },
  },
  {
    id: "loc-02",
    name: "模擬店エリア A（焼きそば・たこ焼き）",
    shortName: "模擬A",
    category: "food",
    description:
      "焼きそば・たこ焼き・フランクフルトなど定番メニューを販売しています。",
    hours: "10:00 – 15:30",
    notes: "現金のみ対応",
    changeInfo: "たこ焼きは 12:00 から販売開始に変更になりました",
    position: { x: 40, y: 18 },
  },
  {
    id: "loc-03",
    name: "模擬店エリア B（クレープ・ドリンク）",
    shortName: "模擬B",
    category: "food",
    description: "クレープ・ジュース・かき氷などスイーツ系を販売しています。",
    hours: "10:00 – 15:00",
    notes: "売り切れ次第終了",
    position: { x: 58, y: 18 },
  },
  {
    id: "loc-04",
    name: "ロボット展示（2号館 1F）",
    shortName: "ロボ展",
    category: "exhibition",
    description:
      "機械工学科・情報工学科の学生が制作したロボットを展示しています。実演もあります。",
    hours: "9:30 – 15:30",
    notes: "展示物には触れないでください",
    position: { x: 28, y: 48 },
  },
  {
    id: "loc-05",
    name: "プログラミング体験（2号館 2F）",
    shortName: "プロ体験",
    category: "experience",
    description:
      "小中学生向けのプログラミング体験コーナーです。Scratchでゲームを作ってみよう！",
    hours: "10:00 – 14:00（最終受付 13:30）",
    notes: "各回定員10名・整理券制",
    changeInfo: "午後の部は 13:00 開始に変更",
    position: { x: 28, y: 60 },
  },
  {
    id: "loc-06",
    name: "サイエンスショー（体育館）",
    shortName: "サイエンス",
    category: "experience",
    description:
      "液体窒素実験やドローン飛行デモなど、見て楽しい科学ショーを開催します。",
    hours: "11:00 / 13:00 / 14:30（各回30分）",
    notes: "立ち見可・席に限りあり",
    position: { x: 72, y: 55 },
  },
  {
    id: "loc-07",
    name: "写真・美術作品展示（3号館 1F）",
    shortName: "美術展",
    category: "exhibition",
    description: "写真部・美術部の作品を展示しています。",
    hours: "9:00 – 16:00",
    notes: "撮影 OK（フラッシュ不可）",
    position: { x: 50, y: 45 },
  },
  {
    id: "loc-08",
    name: "救護室",
    shortName: "救護",
    category: "facility",
    description: "体調不良・けがの際はこちらへお越しください。看護師が常駐しています。",
    hours: "9:00 – 16:00",
    notes: "AED設置あり",
    position: { x: 82, y: 30 },
  },
  {
    id: "loc-09",
    name: "トイレ（1号館横）",
    shortName: "トイレ1",
    category: "restroom",
    description: "1号館横の屋外トイレです。多目的トイレも併設しています。",
    hours: "終日利用可",
    notes: "多目的トイレあり",
    position: { x: 15, y: 70 },
  },
  {
    id: "loc-10",
    name: "トイレ（体育館横）",
    shortName: "トイレ2",
    category: "restroom",
    description: "体育館横のトイレです。",
    hours: "終日利用可",
    notes: "",
    position: { x: 82, y: 70 },
  },
];

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
