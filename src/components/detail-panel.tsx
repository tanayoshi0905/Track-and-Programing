"use client";

import { type Location, getCategoryLabel } from "@/lib/data";
import { MapPin, Clock, AlertTriangle, Info } from "lucide-react";

interface DetailPanelProps {
  location: Location | null;
}

export function DetailPanel({ location }: DetailPanelProps) {
  if (!location) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 text-center">
        <MapPin className="mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-400">
          地図上の地点を選ぶと
          <br />
          詳細が表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* 変更情報バナー */}
      {location.changeInfo && (
        <div className="flex items-start gap-2 rounded-t-xl border-b border-gray-100 bg-gray-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
          <div>
            <p className="text-xs font-semibold text-gray-700">変更あり</p>
            <p className="text-xs leading-relaxed text-gray-600">
              {location.changeInfo}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 p-5">
        {/* 名前 + カテゴリ */}
        <div>
          <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {getCategoryLabel(location.category)}
          </span>
          <h3 className="mt-1.5 text-base font-bold leading-snug text-gray-900">
            {location.name}
          </h3>
        </div>

        {/* 説明 */}
        <p className="text-sm leading-relaxed text-gray-600">
          {location.description}
        </p>

        {/* 開催時間 */}
        {location.hours && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{location.hours}</span>
          </div>
        )}

        {/* 注意事項 */}
        {location.notes && (
          <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <span>{location.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
