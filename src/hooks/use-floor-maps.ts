
import { useState, useEffect } from "react";
import { clientDb as db } from "@/lib/firebase-client";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import type { FloorMap } from "@/lib/types";

export function useFloorMaps(buildingId: string | null) {
    const [floorMaps, setFloorMaps] = useState<FloorMap[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!buildingId) {
            setFloorMaps([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "floorMaps"),
            where("buildingId", "==", buildingId),
            where("isPublished", "==", true)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const maps = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as FloorMap[];

                // 階数順にソート
                setFloorMaps(maps.sort((a, b) => a.floorNumber - b.floorNumber));
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching floor maps:", err);
                setError("フロアマップの読み込みに失敗しました");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [buildingId]);

    return { floorMaps, loading, error };
}
