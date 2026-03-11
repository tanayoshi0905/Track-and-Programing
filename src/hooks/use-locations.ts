"use client";

import { useState, useEffect } from "react";
import type { Location } from "@/lib/data";

interface UseLocationsResult {
  locations: Location[];
  loading: boolean;
  error: string | null;
}

export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: Location[] = await res.json();
        if (!cancelled) {
          setLocations(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("地点データの取得に失敗:", err);
          setError("地点データの読み込みに失敗しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  return { locations, loading, error };
}
