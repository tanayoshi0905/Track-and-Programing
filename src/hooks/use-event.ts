"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";

/**
 * 公開中のイベントIDを取得するフック。
 * events コレクションから isPublished == true の最初のイベントを返す。
 */
interface UseEventResult {
  eventId: string | null;
  loading: boolean;
  error: string | null;
}

export function useEvent(): UseEventResult {
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(clientDb, "events"),
      where("isPublished", "==", true),
      limit(1),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setEventId(null);
          setError("公開中のイベントが見つかりません");
        } else {
          setEventId(snapshot.docs[0].id);
          setError(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("イベント取得エラー:", err);
        setError("イベント情報の読み込みに失敗しました");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { eventId, loading, error };
}
