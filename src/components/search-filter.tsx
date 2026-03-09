"use client";

import { type Category, type CategoryId } from "@/lib/data";
import { Search } from "lucide-react";

interface SearchFilterProps {
  query: string;
  onQueryChange: (q: string) => void;
  categories: Category[];
  activeCategories: CategoryId[];
  onToggleCategory: (id: CategoryId) => void;
}

export function SearchFilter({
  query,
  onQueryChange,
  categories,
  activeCategories,
  onToggleCategory,
}: SearchFilterProps) {
  return (
    <div className="space-y-3">
      {/* 検索欄 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="場所を検索（名前・略称）"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-shadow focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* カテゴリチップ */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = activeCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onToggleCategory(cat.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-gray-800 bg-gray-800 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
        {activeCategories.length > 0 && (
          <button
            onClick={() => activeCategories.forEach((id) => onToggleCategory(id))}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            リセット
          </button>
        )}
      </div>
    </div>
  );
}
