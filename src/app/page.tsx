"use client";

import { useState, useMemo, useCallback } from "react";
import {
  categories,
  type Location,
  type CategoryId,
} from "@/lib/data";
import { useLocations } from "@/hooks/use-locations";
import { useAnnouncements } from "@/hooks/use-announcements";
import { EventMap } from "@/components/event-map";
import { Announcements } from "@/components/announcements";
import { SearchFilter } from "@/components/search-filter";
import { DetailPanel } from "@/components/detail-panel";

export default function Home() {
  // --------------- Firestore データ ---------------
  const { locations: allLocations, loading: locLoading, error: locError } = useLocations();
  const { announcements, loading: annLoading, error: annError } = useAnnouncements();

  const loading = locLoading || annLoading;
  const error = locError || annError;

  // --------------- 状態管理 ---------------
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<CategoryId[]>([]);

  // --------------- フィルタ ---------------
  const filteredLocations = useMemo(() => {
    return allLocations.filter((loc) => {
      // カテゴリ
      if (
        activeCategories.length > 0 &&
        !activeCategories.includes(loc.category)
      )
        return false;
      // 検索
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
          <p className="text-sm text-gray-500">地点データを読み込み中...</p>
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          高専祭 2026
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          教室・受付・出し物情報を地図から確認できます
        </p>
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
        {/* 地図 */}
        <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
          <EventMap
            locations={filteredLocations}
            selectedId={selectedLocation?.id ?? null}
            onSelectLocation={handleSelectLocation}
          />
        </div>

        {/* 詳細パネル */}
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