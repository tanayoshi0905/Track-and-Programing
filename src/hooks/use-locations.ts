"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import type { Location, CategoryId } from "@/lib/data";

// Firestore の日本語カテゴリラベル → CategoryId 変換マップ
const labelToCategoryId: Record<string, CategoryId> = {
  受付: "reception",
  飲食: "food",
  展示: "exhibition",
  体験: "experience",
  設備: "facility",
  トイレ: "restroom",
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

interface UseLocationsResult {
  locations: Location[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useLocations(eventId: string | null): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(clientDb, "locations"),
      where("eventId", "==", eventId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const locs: Location[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name ?? "",
            shortName: d.shortName ?? "",
            category: toCategoryId(d.category),
            description: d.description ?? "",
            hours: d.hours ?? "",
            notes: d.notes ?? "",
            changeInfo: d.changeInfo ?? undefined,
            position: {
              x: d.x ?? 50,
              y: d.y ?? 50,
            },
          };
        });
        setLocations(locs);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore locations リアルタイム監視エラー:", err);
        setError("地点データの読み込みに失敗しました");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  return { locations, loading, error, lastUpdated };
}
