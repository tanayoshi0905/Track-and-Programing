"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
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

interface UseAnnouncementResult {
    announcement: Announcement | null;
    loading: boolean;
    error: string | null;
}

export function useAnnouncement(announcementId: string | null): UseAnnouncementResult {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!announcementId) {
            setLoading(false);
            return;
        }

        const docRef = doc(clientDb, "notices", announcementId);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const d = snapshot.data();
                    setAnnouncement({
                        id: snapshot.id,
                        type: toAnnouncementType(d.type),
                        title: d.title ?? "",
                        body: d.body ?? "",
                        createdAt: d.createdAt,
                        timestamp: formatTimestamp(d.createdAt),
                    });
                    setError(null);
                } else {
                    setAnnouncement(null);
                    setError("指定されたお知らせが見つかりません");
                }
                setLoading(false);
            },
            (err) => {
                console.error("お知らせ詳細取得エラー:", err);
                setError("お知らせの読み込みに失敗しました");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [announcementId]);

    return { announcement, loading, error };
}
