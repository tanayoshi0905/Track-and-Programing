"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import type { Building } from "./use-buildings";

interface UseBuildingResult {
    building: Building | null;
    loading: boolean;
    error: string | null;
}

export function useBuilding(buildingId: string | null): UseBuildingResult {
    const [building, setBuilding] = useState<Building | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!buildingId) {
            return;
        }

        setLoading(true);

        const docRef = doc(clientDb, "buildings", buildingId);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const d = snapshot.data();
                    setBuilding({
                        id: snapshot.id,
                        name: d.name ?? "名称未設定",
                        totalFloors: d.totalFloors,
                        createdAt: d.createdAt,
                    });
                    setError(null);
                } else {
                    setBuilding(null);
                    setError("指定された建物が見つかりません");
                }
                setLoading(false);
            },
            (err) => {
                console.error("Firestore 建物リアルタイム監視エラー:", err);
                setError(`建物の読み込みに失敗しました: ${err.message}`);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [buildingId]);

    return { building, loading, error };
}
