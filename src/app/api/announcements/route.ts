// ============================================================
// GET /api/announcements — Firestore から お知らせデータを取得
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Announcement, AnnouncementType } from "@/lib/data";

const validTypes: AnnouncementType[] = ["重要", "変更", "案内"];

function toAnnouncementType(raw: string | undefined): AnnouncementType {
  if (raw && validTypes.includes(raw as AnnouncementType)) {
    return raw as AnnouncementType;
  }
  return "案内";
}

function formatTimestamp(raw: unknown): string {
  if (!raw) return "";
  // Firestore Timestamp オブジェクト (_seconds, _nanoseconds)
  if (typeof raw === "object" && raw !== null && "toDate" in raw && typeof (raw as { toDate: unknown }).toDate === "function") {
    const date = (raw as { toDate: () => Date }).toDate();
    return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  }
  // 文字列の場合はそのまま
  if (typeof raw === "string") return raw;
  return String(raw);
}

export async function GET() {
  try {
    // Firestore のコレクション名は "notices"
    const snapshot = await db.collection("notices").get();

    const announcements: Announcement[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        type: toAnnouncementType(d.type),
        title: d.title ?? "",
        body: d.body ?? "",
        timestamp: formatTimestamp(d.createdAt),
      } satisfies Announcement;
    });

    return NextResponse.json(announcements);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Firestore お知らせ読み込みエラー:", msg);
    return NextResponse.json(
      { error: "お知らせの取得に失敗しました", detail: msg },
      { status: 500 },
    );
  }
}
