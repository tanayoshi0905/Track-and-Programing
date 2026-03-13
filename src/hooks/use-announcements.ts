"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
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
  if (raw instanceof Timestamp) {
    return raw.toDate().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  }
  if (typeof raw === "string") return raw;
  return String(raw);
}

interface UseAnnouncementsResult {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useAnnouncements(eventId: string | null): UseAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    setLoading(true);

    const q = query(
      collection(clientDb, "notices"),
      where("eventId", "==", eventId),
      where("isPublished", "==", true),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const anns: Announcement[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            type: toAnnouncementType(d.type),
            title: d.title ?? "",
            body: d.body ?? "",
            createdAt: d.createdAt, // ソート用に保持
            timestamp: formatTimestamp(d.createdAt),
          };
        });

        // 1. "重要"を先頭にする
        // 2. その後は createdAt の降順（新しい順）
        anns.sort((a, b) => {
          const isAImportant = a.type === "重要";
          const isBImportant = b.type === "重要";

          if (isAImportant && !isBImportant) return -1;
          if (!isAImportant && isBImportant) return 1;

          // createdAt を数値(ms)に変換して比較
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);

          return timeB - timeA;
        });

        setAnnouncements(anns);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore notices リアルタイム監視エラー:", err);
        setError(`お知らせの読み込みに失敗しました: ${err.message}`);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  return { announcements, loading, error, lastUpdated };
}
