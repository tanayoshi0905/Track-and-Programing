"use client";

import { type Location, type CategoryId } from "@/lib/data";
import { type Building, type OcrResult } from "@/lib/types";
import { useCallback, useRef, useState, useEffect } from "react";

// --------------- カテゴリごとの色 ---------------
const categoryColors: Record<CategoryId, string> = {
  reception: "#6366f1", // indigo
  food: "#f59e0b",      // amber
  exhibition: "#10b981", // emerald
  experience: "#3b82f6", // blue
  facility: "#8b5cf6",  // violet
  restroom: "#64748b",  // slate
};

// --------------- Props ---------------
interface EventMapProps {
  locations: Location[];
  buildings: Building[];
  ocrResult: OcrResult | null;
  selectedId: string | null;
  onSelectLocation: (loc: Location) => void;
  onSelectBuilding?: (buildingId: string) => void;
  selectedBuildingId?: string | null;
}

export function EventMap({
  locations,
  buildings,
  ocrResult,
  selectedId,
  onSelectLocation,
  onSelectBuilding,
  selectedBuildingId,
}: EventMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // ---- ズーム・パン state ----
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  // ---- ホイールズーム ----
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => Math.min(3, Math.max(0.5, prev - e.deltaY * 0.001)));
  }, []);

  // ---- ピンチズーム (マルチタッチ) ----
  const lastTouchDistance = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const delta = distance - lastTouchDistance.current;

      // 拡大縮小の感度調整 (0.015)
      setScale((prev) => Math.min(3, Math.max(0.5, prev + delta * 0.015)));
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastTouchDistance.current = null;
    }
  }, []);

  // ---- ドラッグ ----
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as Element;
      // ピンやボタンをクリックした場合はドラッグ開始しない
      if (target.closest(".map-pin") || target.closest("button")) return;

      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...offset };
      target.setPointerCapture?.(e.pointerId);
    },
    [offset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // ピンチズーム中はパンしない
      if (!dragging || lastTouchDistance.current !== null) return;

      let newX = offsetStart.current.x + (e.clientX - dragStart.current.x);
      let newY = offsetStart.current.y + (e.clientY - dragStart.current.y);

      // マップが画面外に消えないようにスクロール可能範囲を制限
      // 拡大率に応じてスクロールできる幅を確保
      const limitX = 150 + (scale - 1) * 200;
      const limitY = 150 + (scale - 1) * 200;

      newX = Math.max(-limitX, Math.min(limitX, newX));
      newY = Math.max(-limitY, Math.min(limitY, newY));

      setOffset({ x: newX, y: newY });
    },
    [dragging, scale]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  // ---- リセットボタン ----
  const handleReset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // prevent passive wheel
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 touch-none overscroll-none select-none cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* ズームコントロール */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-100 cursor-pointer"
          aria-label="ズームイン"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-100 cursor-pointer"
          aria-label="ズームアウト"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-[10px] font-medium text-gray-500 shadow-sm transition-colors hover:bg-gray-100 cursor-pointer"
          aria-label="リセット"
        >
          ↺
        </button>
      </div>

      {/* SVG マップ */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 90"
        className="h-full w-full"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* グリッド線 */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="90" fill="url(#grid)" />

        {/* 通路 */}
        <line x1="24" y1="35" x2="24" y2="40" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="50" x2="42" y2="50" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="50" x2="64" y2="50" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />

        {/* OCRに基づく部屋/教室の描画 */}
        {ocrResult && ocrResult.roomCandidates.map((room, idx) => (
          <g key={`ocr-${idx}`}>
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              rx="0.5"
              fill="white"
              stroke="#cbd5e1"
              strokeWidth="0.2"
              className="opacity-80"
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none select-none fill-gray-500"
              fontSize="2"
              fontWeight="500"
            >
              {room.name}
            </text>
          </g>
        ))}

        {/* OCRがない場合は建物の箱（ダミー位置またはリスト）を表示 */}
        {!ocrResult && buildings.map((b, idx) => {
          // モックデータの座標を暫定的に維持するか、動的に生成する
          // ここでは元のモック位置を維持するロジック（建物名が一致する場合のみ）
          const mockPos = [
            { name: "1号館", x: 8, y: 15, w: 16, h: 20 },
            { name: "2号館", x: 20, y: 40, w: 18, h: 28 },
            { name: "3号館", x: 42, y: 35, w: 18, h: 22 },
            { name: "体育館", x: 64, y: 42, w: 22, h: 24 },
            { name: "本館", x: 8, y: 15, w: 16, h: 20 },
            { name: "実習工場", x: 42, y: 35, w: 18, h: 22 },
            { name: "別館", x: 20, y: 40, w: 18, h: 28 },
          ].find(m => m.name === b.name);

          if (!mockPos) return null;

          const isSelected = selectedBuildingId === b.id;

          return (
            <g
              key={b.id}
              className="cursor-pointer group"
              onClick={() => onSelectBuilding?.(b.id)}
            >
              <rect
                x={mockPos.x}
                y={mockPos.y}
                width={mockPos.w}
                height={mockPos.h}
                rx="1.2"
                fill={isSelected ? "#f0fdf4" : "white"}
                stroke={isSelected ? "#10b981" : "#cbd5e1"}
                strokeWidth={isSelected ? "0.8" : "0.4"}
                className="transition-all group-hover:stroke-emerald-400"
              />
              <text
                x={mockPos.x + mockPos.w / 2}
                y={mockPos.y + mockPos.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={`pointer-events-none select-none transition-colors ${isSelected ? "fill-emerald-700 font-bold" : "fill-gray-400"}`}
                fontSize="2.6"
                fontWeight="500"
              >
                {b.name}
              </text>
            </g>
          );
        })}

        {/* 地点ピン */}
        {locations.map((loc) => {
          const isSelected = loc.id === selectedId;
          const color = categoryColors[loc.category];
          return (
            <g
              key={loc.id}
              className="map-pin cursor-pointer"
              onClick={() => onSelectLocation(loc)}
              role="button"
              tabIndex={0}
              aria-label={loc.name}
            >
              {/* ピン影 */}
              <circle
                cx={loc.position.x}
                cy={loc.position.y + 0.3}
                r={isSelected ? 2.8 : 2.2}
                fill="rgba(0,0,0,0.08)"
              />
              {/* 外円 */}
              <circle
                cx={loc.position.x}
                cy={loc.position.y}
                r={isSelected ? 2.8 : 2.2}
                fill={color}
                stroke="white"
                strokeWidth={isSelected ? 0.7 : 0.4}
                className="transition-all duration-200"
              />
              {/* ラベル */}
              <text
                x={loc.position.x}
                y={loc.position.y + 5}
                textAnchor="middle"
                fontSize="1.8"
                fontWeight="600"
                className="pointer-events-none select-none"
                fill="#374151"
              >
                {loc.shortName}
              </text>
              {/* 選択リング */}
              {isSelected && (
                <circle
                  cx={loc.position.x}
                  cy={loc.position.y}
                  r="3.6"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.35"
                  opacity="0.5"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
