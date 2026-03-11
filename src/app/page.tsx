"use client";

import { useState, useMemo, useCallback } from "react";
import {
  categories,
  type Location,
  type CategoryId,
} from "@/lib/data";
import { useEvent } from "@/hooks/use-event";
import { useLocations } from "@/hooks/use-locations";
import { useAnnouncements } from "@/hooks/use-announcements";
import { EventMap } from "@/components/event-map";
import { Announcements } from "@/components/announcements";
import { SearchFilter } from "@/components/search-filter";
import { DetailPanel } from "@/components/detail-panel";

export default function Home() {
  // --------------- Firestore: 公開イベント取得 ---------------
  const { eventId, loading: evLoading, error: evError } = useEvent();

  // --------------- Firestore: リアルタイムデータ ---------------
  const {
    locations: allLocations,
    loading: locLoading,
    error: locError,
    lastUpdated: locUpdated,
  } = useLocations(eventId);
  const {
    announcements,
    loading: annLoading,
    error: annError,
    lastUpdated: annUpdated,
  } = useAnnouncements(eventId);

  const loading = evLoading || locLoading || annLoading;
  const error = evError || locError || annError;

  // 最新の更新時刻
  const lastUpdated = useMemo(() => {
    if (!locUpdated && !annUpdated) return null;
    if (!locUpdated) return annUpdated;
    if (!annUpdated) return locUpdated;
    return locUpdated > annUpdated ? locUpdated : annUpdated;
  }, [locUpdated, annUpdated]);

  // --------------- 状態管理 ---------------
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<CategoryId[]>([]);

  // --------------- フィルタ ---------------
  const filteredLocations = useMemo(() => {
    return allLocations.filter((loc) => {
      if (
        activeCategories.length > 0 &&
        !activeCategories.includes(loc.category)
      )
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.shortName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allLocations, searchQuery, activeCategories]);

  // --------------- コールバック ---------------
  const handleToggleCategory = useCallback((id: CategoryId) => {
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const handleSelectLocation = useCallback((loc: Location) => {
    setSelectedLocation((prev) => (prev?.id === loc.id ? null : loc));
  }, []);

  // --------------- ローディング / エラー ---------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <p className="text-sm text-gray-500">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-red-600 underline"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ============ ヘッダー ============ */}
      <header className="mb-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              高専祭 2026
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              教室・受付・出し物情報を地図から確認できます
            </p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>
                最終更新{" "}
                {lastUpdated.toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ============ お知らせ ============ */}
      <section className="mb-5" aria-label="お知らせ">
        <Announcements announcements={announcements} />
      </section>

      {/* ============ 検索・絞り込み ============ */}
      <section className="mb-5" aria-label="検索・絞り込み">
        <SearchFilter
          query={searchQuery}
          onQueryChange={setSearchQuery}
          categories={categories}
          activeCategories={activeCategories}
          onToggleCategory={handleToggleCategory}
        />
      </section>

      {/* ============ メイン: 地図 + 詳細 ============ */}
      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]" aria-label="地図と詳細">
        <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
          <EventMap
            locations={filteredLocations}
            selectedId={selectedLocation?.id ?? null}
            onSelectLocation={handleSelectLocation}
          />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <DetailPanel location={selectedLocation} />
        </div>
      </section>

      {/* ============ フッター ============ */}
      <footer className="mt-8 border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
        © 2026 高専祭実行委員会 — マップ型情報共有システム
      </footer>
    </div>
  );
}