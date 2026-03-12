// ============================================================
// GET /api/locations — Firestore から Location データを取得
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Location, CategoryId } from "@/lib/data";

// Firestore の日本語カテゴリラベル → CategoryId 変換マップ
const labelToCategoryId: Record<string, CategoryId> = {
  受付: "reception",
  飲食: "food",
  展示: "exhibition",
  体験: "experience",
  設備: "facility",
  トイレ: "restroom",
  // 英語IDがそのまま入っている場合も対応
  reception: "reception",
  food: "food",
  exhibition: "exhibition",
  experience: "experience",
  facility: "facility",
  restroom: "restroom",
};

function toCategoryId(raw: string | undefined): CategoryId {
  if (!raw) return "facility";
  return labelToCategoryId[raw] ?? "facility";
}

export async function GET() {
  try {
    const snapshot = await db.collection("locations").get();

    const locations: Location[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name ?? "",
        shortName: d.shortName ?? "",
        category: toCategoryId(d.category),
        description: d.description ?? "",
        hours: d.openTime ?? d.hours ?? "",
        notes: d.notes ?? "",
        changeInfo: d.changeInfo ?? undefined,
        position: {
          x: d.x ?? 50,
          y: d.y ?? 50,
        },
      } satisfies Location;
    });

    return NextResponse.json(locations);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Firestore 読み込みエラー:", msg);
    return NextResponse.json(
      {
        error: "データの取得に失敗しました",
        detail: msg,
        envCheck: {
          FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
          FIREBASE_SERVICE_ACCOUNT_PATH: !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        },
      },
      { status: 500 },
    );
  }
}

