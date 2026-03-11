// ============================================================
// GET /api/locations — Firestore から Location データを取得
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Location } from "@/lib/data";

export async function GET() {
  try {
    const snapshot = await db.collection("locations").get();

    const locations: Location[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name ?? "",
        shortName: d.shortName ?? "",
        category: d.category ?? "facility",
        description: d.description ?? "",
        hours: d.hours ?? "",
        notes: d.notes ?? "",
        changeInfo: d.changeInfo ?? undefined,
        position: {
          x: d.position?.x ?? 50,
          y: d.position?.y ?? 50,
        },
      } satisfies Location;
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Firestore 読み込みエラー:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
