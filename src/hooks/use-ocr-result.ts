
import { useState, useEffect } from "react";
import { clientDb as db } from "@/lib/firebase-client";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import type { OcrResult } from "@/lib/types";

export function useOcrResult(floorMapId: string | null) {
    const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!floorMapId) {
            setOcrResult(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "ocrResults"),
            where("sourceFloorMapId", "==", floorMapId),
            where("isPublished", "==", true),
            limit(1)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    setOcrResult({
                        id: doc.id,
                        ...doc.data(),
                    } as OcrResult);
                } else {
                    setOcrResult(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching OCR result:", err);
                setError("OCR結果の読み込みに失敗しました");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [floorMapId]);

    return { ocrResult, loading, error };
}
