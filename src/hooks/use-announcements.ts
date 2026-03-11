"use client";

import { useState, useEffect } from "react";
import type { Announcement } from "@/lib/data";

interface UseAnnouncementsResult {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

export function useAnnouncements(): UseAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Announcement[] = await res.json();
        if (!cancelled) {
          setAnnouncements(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("お知らせの取得に失敗:", err);
          setError("お知らせの読み込みに失敗しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnnouncements();
    return () => { cancelled = true; };
  }, []);

  return { announcements, loading, error };
}
