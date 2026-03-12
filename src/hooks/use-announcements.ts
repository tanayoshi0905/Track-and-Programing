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
      setLoading(false);
      return;
    }

    const q = query(
      collection(clientDb, "notices"),
      where("eventId", "==", eventId),
      // createdAt 降順で最新のお知らせが上に来るようにする
      // ※インデックスが必要になる場合があります
      // orderBy("createdAt", "desc") // (※現在は自動で並び替えやクライアントでのソートで対応)
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

        // createdAt の降順（新しい順）に並び替える
        anns.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setAnnouncements(anns);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore notices リアルタイム監視エラー:", err);
        setError("お知らせの読み込みに失敗しました");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  return { announcements, loading, error, lastUpdated };
}
