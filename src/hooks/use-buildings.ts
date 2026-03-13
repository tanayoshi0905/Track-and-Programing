"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";

export interface Building {
    id: string;
    name: string;
    totalFloors?: number;
    createdAt?: any;
}

interface UseBuildingsResult {
    buildings: Building[];
    loading: boolean;
    error: string | null;
}

export function useBuildings(): UseBuildingsResult {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(clientDb, "buildings"));

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

                // createdAtの古い順（登録順）などでソートする場合はここで行う
                // results.sort((a, b) => ...);

                setBuildings(results);
                setError(null);
                setLoading(false);
            },
            (err) => {
                console.error("建物一覧取得エラー:", err);
                setError("建物一覧の読み込みに失敗しました");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { buildings, loading, error };
}
