import { Announcement, EventInfo, MapPin } from "./types";

// ============================================================
// ダミーデータ — 初期表示用
// ============================================================

export const INITIAL_EVENT: EventInfo = {
  id: "mock-event",
  name: "第15回 青空祭",
  date: "2026-05-17",
  subtitle: "〜みんなで作る、最高の一日〜",
  isPublished: false,
  mapImageUrl: "",
};

export const INITIAL_PINS: MapPin[] = [
  {
    id: "pin-1",
    eventId: "mock-event",
    x: 25,
    y: 30,
    name: "総合受付",
    shortName: "受付",
    category: "受付",
    description: "来場者の受付を行います。パンフレットを配布します。",
    openTime: "9:00〜16:00",
    notes: "混雑時は列が長くなります。",
  },
  {
    id: "pin-2",
    eventId: "mock-event",
    x: 60,
    y: 45,
    name: "模擬店エリア",
    shortName: "模擬店",
    category: "飲食",
    description: "各クラスの模擬店が集まるエリアです。",
    openTime: "10:00〜15:00",
    notes: "アレルギー表示あり。現金のみ。",
  },
  {
    id: "pin-3",
    eventId: "mock-event",
    x: 40,
    y: 70,
    name: "体育館ステージ",
    shortName: "ステージ",
    category: "体験",
    description: "バンド演奏やダンス発表を行います。",
    openTime: "11:00〜14:00",
    notes: "撮影は指定エリアからお願いします。",
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    eventId: "mock-event",
    type: "重要",
    title: "雨天時の対応について",
    body: "雨天の場合、屋外ブースは体育館に移動します。詳細は当日朝に掲示します。",
  },
  {
    id: "ann-2",
    eventId: "mock-event",
    type: "案内",
    title: "駐車場のご案内",
    body: "来場者用駐車場は校庭北側です。台数に限りがありますので、公共交通機関をご利用ください。",
  },
];
