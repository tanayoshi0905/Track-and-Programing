"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { type Building } from "@/lib/types";

interface UseBuildingsResult {
    buildings: Building[];
    loading: boolean;
    error: string | null;
}

export function useBuildings(eventId: string | null): UseBuildingsResult {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!eventId) {
            // eventIdがまだない間はloadingをtrueのままにする（またはuseEvent側のloadingを見る）
            // ただし、完全にイベントが見つからないことが確定した場合はfalseにする
            return;
        }

        setLoading(true);

        const q = query(
            collection(clientDb, "buildings"),
            where("eventId", "==", eventId),
            where("isPublished", "==", true)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const results: Building[] = snapshot.docs.map((doc) => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        name: d.name ?? "名称未設定",
                        totalFloors: d.totalFloors,
                        createdAt: d.createdAt,
                    };
                });

                // 最新の建物を上に持ってくる（createdAt降順）
                results.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                    return timeB - timeA;
                });

                setBuildings(results);
                setError(null);
                setLoading(false);
            },
            (err) => {
                console.error("建物一覧取得エラー:", err);
                setError(`読み込みに失敗しました: ${err.message}`);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [eventId]);

    return { buildings, loading, error };
}
