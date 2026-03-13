"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Building2,
  Upload,
  Scan,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileImage,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type {
  Building,
  FloorMap,
  OcrResult,
  OcrStatus,
} from "@/lib/types";
import {
  createBuilding,
  uploadFloorMap,
  fetchFloorMaps,
  deleteFloorMap,
  runOcr,
  fetchOcrResult,
} from "@/lib/floor-map-actions";

// ============================================================
// ユーティリティ
// ============================================================

function statusLabel(status: OcrStatus): string {
  switch (status) {
    case "none":
      return "未アップロード";
    case "uploaded":
      return "アップロード済み";
    case "processing":
      return "OCR解析中";
    case "done":
      return "完了";
    case "error":
      return "エラー";
  }
}

function statusIcon(status: OcrStatus) {
  switch (status) {
    case "none":
      return <FileImage className="size-4 text-gray-400" />;
    case "uploaded":
      return <Upload className="size-4 text-blue-500" />;
    case "processing":
      return <Loader2 className="size-4 text-amber-500 animate-spin" />;
    case "done":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "error":
      return <AlertCircle className="size-4 text-red-500" />;
  }
}

function statusBadgeVariant(
  status: OcrStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "done":
      return "default";
    case "processing":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
  }
}

// ============================================================
// Props
// ============================================================

interface FloorMapDashboardProps {
  initialBuildings: Building[];
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function FloorMapDashboard({
  initialBuildings,
}: FloorMapDashboardProps) {
  // ---- State ----
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    initialBuildings.length > 0 ? initialBuildings[0].id : null
  );

  // Building form
  const [newBuildingName, setNewBuildingName] = useState("");
  const [newBuildingFloors, setNewBuildingFloors] = useState("3");
  const [creatingBuilding, setCreatingBuilding] = useState(false);

  // Floor maps
  const [floorMaps, setFloorMaps] = useState<FloorMap[]>([]);
  const [ocrResults, setOcrResults] = useState<Record<string, OcrResult>>({});
  const [activeFloor, setActiveFloor] = useState("1");
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [runningOcr, setRunningOcr] = useState<Record<string, boolean>>({});

  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // ---- Derived ----
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const totalFloors = selectedBuilding?.totalFloors ?? 0;

  // ---- Hydration Safe Guard ----
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);

  // ---- Load floor maps when building changes ----
  const loadFloorMaps = useCallback(async (buildingId: string) => {
    const maps = await fetchFloorMaps(buildingId);
    setFloorMaps(maps);

    // Load OCR results for done maps
    const results: Record<string, OcrResult> = {};
    for (const m of maps) {
      if (m.ocrStatus === "done") {
        const r = await fetchOcrResult(m.id);
        if (r) results[m.id] = r;
      }
    }
    setOcrResults(results);
  }, []);

  const handleSelectBuilding = useCallback(
    async (buildingId: string) => {
      setSelectedBuildingId(buildingId);
      setActiveFloor("1");
      await loadFloorMaps(buildingId);
    },
    [loadFloorMaps]
  );

  // Auto-load on first render if building exists
  React.useEffect(() => {
    if (selectedBuildingId) {
      loadFloorMaps(selectedBuildingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Handlers: Building ----
  const handleCreateBuilding = async () => {
    const name = newBuildingName.trim();
    if (!name) return;
    setCreatingBuilding(true);
    try {
      const id = await createBuilding(name, parseInt(newBuildingFloors, 10));
      const building: Building = {
        id,
        name,
        totalFloors: parseInt(newBuildingFloors, 10),
        createdAt: new Date().toISOString(),
      };
      setBuildings((prev) => [building, ...prev]);
      setSelectedBuildingId(id);
      setFloorMaps([]);
      setOcrResults({});
      setActiveFloor("1");
      setNewBuildingName("");
    } catch (err) {
      console.error("建物作成エラー:", err);
    } finally {
      setCreatingBuilding(false);
    }
  };

  // ---- Handlers: Upload ----
  const handleFileUpload = useCallback(
    async (floorNumber: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedBuildingId) return;
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading((prev) => ({ ...prev, [floorNumber]: true }));

      try {
        // Convert to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const id = await uploadFloorMap(
          selectedBuildingId,
          floorNumber,
          base64,
          file.name,
          file.type
        );

        // Re-load floor maps
        await loadFloorMaps(selectedBuildingId);
        void id;
      } catch (err) {
        console.error("アップロードエラー:", err);
      } finally {
        setUploading((prev) => ({ ...prev, [floorNumber]: false }));
        // Reset file input
        const ref = fileInputRefs.current[floorNumber];
        if (ref) ref.value = "";
      }
    },
    [selectedBuildingId, loadFloorMaps]
  );

  // ---- Handlers: OCR ----
  const handleRunOcr = useCallback(
    async (floorMapId: string) => {
      setRunningOcr((prev) => ({ ...prev, [floorMapId]: true }));

      // Update local state optimistically
      setFloorMaps((prev) =>
        prev.map((m) =>
          m.id === floorMapId ? { ...m, ocrStatus: "processing" as OcrStatus } : m
        )
      );

      try {
        const result = await runOcr(floorMapId);
        if (result) {
          setOcrResults((prev) => ({ ...prev, [floorMapId]: result }));
        }
        // Re-load floor maps to get updated status
        if (selectedBuildingId) {
          await loadFloorMaps(selectedBuildingId);
        }
      } catch (err) {
        console.error("OCR実行エラー:", err);
      } finally {
        setRunningOcr((prev) => ({ ...prev, [floorMapId]: false }));
      }
    },
    [selectedBuildingId, loadFloorMaps]
  );

  // ---- Handlers: Delete ----
  const handleDeleteFloorMap = useCallback(
    async (floorMapId: string) => {
      try {
        await deleteFloorMap(floorMapId);
        setFloorMaps((prev) => prev.filter((m) => m.id !== floorMapId));
        setOcrResults((prev) => {
          const next = { ...prev };
          delete next[floorMapId];
          return next;
        });
      } catch (err) {
        console.error("削除エラー:", err);
      }
    },
    []
  );

  // ---- Helper: get floor map for a given floor ----
  const getFloorMap = (floor: number) =>
    floorMaps.find((m) => m.floorNumber === floor);

  // ============================================================
  // Render
  // ============================================================
  if (!mounted) {
    return null; // または適当なローディングスケルトン
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Header */}
      <header className="border-b bg-white px-6 py-5 md:px-10">
        <div className="max-w-7xl">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              階層別マップ管理
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 ml-8">
            建物の各階ごとにフロアマップをアップロードし、OCR 解析を実行
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* ===== 左パネル ===== */}
          <div className="space-y-6">
            {/* 建物設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="size-4 text-primary" />
                  建物設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 既存建物選択 */}
                {buildings.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      建物を選択
                    </Label>
                    <Select
                      value={selectedBuildingId ?? ""}
                      onValueChange={handleSelectBuilding}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="建物を選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}（{b.totalFloors}階）
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                {/* 新規建物作成 */}
                <div className="space-y-3">
                  <Label className="text-xs text-gray-500 font-semibold">
                    新規建物作成
                  </Label>
                  <div className="space-y-1.5">
                    <Label htmlFor="building-name" className="text-xs">
                      建物名
                    </Label>
                    <Input
                      id="building-name"
                      value={newBuildingName}
                      onChange={(e) => setNewBuildingName(e.target.value)}
                      placeholder="例: 本館"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="building-floors" className="text-xs">
                      階数
                    </Label>
                    <Select
                      value={newBuildingFloors}
                      onValueChange={setNewBuildingFloors}
                    >
                      <SelectTrigger id="building-floors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}階
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCreateBuilding}
                    disabled={!newBuildingName.trim() || creatingBuilding}
                    className="w-full"
                    size="sm"
                  >
                    {creatingBuilding ? (
                      <Loader2 className="size-4 mr-1 animate-spin" />
                    ) : (
                      <Building2 className="size-4 mr-1" />
                    )}
                    建物を作成
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 各階アップロード状況 */}
            {selectedBuilding && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Upload className="size-4 text-primary" />
                    各階のアップロード状況
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from(
                    { length: totalFloors },
                    (_, i) => i + 1
                  ).map((floor) => {
                    const fm = getFloorMap(floor);
                    const status: OcrStatus = fm?.ocrStatus ?? "none";
                    const isUploading = uploading[floor] ?? false;

                    return (
                      <button
                        key={floor}
                        type="button"
                        onClick={() => setActiveFloor(String(floor))}
                        className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          activeFloor === String(floor)
                            ? "border-primary/40 bg-primary/5"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-semibold text-gray-700 w-8">
                          {floor}F
                        </span>
                        {isUploading ? (
                          <Loader2 className="size-4 text-blue-500 animate-spin" />
                        ) : (
                          statusIcon(status)
                        )}
                        <span className="text-gray-600 flex-1 truncate">
                          {isUploading
                            ? "アップロード中..."
                            : fm?.fileName || statusLabel(status)}
                        </span>
                        <Badge
                          variant={statusBadgeVariant(status)}
                          className="text-[10px] shrink-0"
                        >
                          {statusLabel(status)}
                        </Badge>
                      </button>
                    );
                  })}

                  {/* 進捗バー */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>全体進捗</span>
                      <span>
                        {floorMaps.filter((m) => m.ocrStatus === "done").length}
                        /{totalFloors} 完了
                      </span>
                    </div>
                    <Progress
                      value={
                        totalFloors > 0
                          ? (floorMaps.filter((m) => m.ocrStatus === "done")
                              .length /
                              totalFloors) *
                            100
                          : 0
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ===== 右パネル ===== */}
          <div>
            {!selectedBuilding ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Building2 className="size-12 mb-3" />
                  <p className="text-sm">
                    左パネルから建物を選択または作成してください
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs
                value={activeFloor}
                onValueChange={setActiveFloor}
              >
                <TabsList className="mb-4">
                  {Array.from(
                    { length: totalFloors },
                    (_, i) => i + 1
                  ).map((floor) => {
                    const fm = getFloorMap(floor);
                    return (
                      <TabsTrigger
                        key={floor}
                        value={String(floor)}
                        className="gap-1.5"
                      >
                        {fm && statusIcon(fm.ocrStatus)}
                        {floor}F
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {Array.from(
                  { length: totalFloors },
                  (_, i) => i + 1
                ).map((floor) => {
                  const fm = getFloorMap(floor);
                  const ocrResult = fm ? ocrResults[fm.id] : null;
                  const isUploading = uploading[floor] ?? false;
                  const isRunningOcr = fm
                    ? runningOcr[fm.id] ?? false
                    : false;

                  return (
                    <TabsContent key={floor} value={String(floor)}>
                      <div className="space-y-6">
                        {/* アップロードエリア */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <FileImage className="size-4 text-primary" />
                                {floor}F フロアマップ
                              </span>
                              {fm && (
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={statusBadgeVariant(
                                      fm.ocrStatus
                                    )}
                                  >
                                    {statusLabel(fm.ocrStatus)}
                                  </Badge>
                                </div>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <input
                              ref={(el) => {
                                fileInputRefs.current[floor] = el;
                              }}
                              type="file"
                              accept="image/png,image/jpeg,application/pdf"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(floor, e)
                              }
                            />

                            {!fm ? (
                              /* 未アップロード */
                              <button
                                type="button"
                                onClick={() =>
                                  fileInputRefs.current[floor]?.click()
                                }
                                disabled={isUploading}
                                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-16 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                              >
                                {isUploading ? (
                                  <Loader2 className="size-10 text-primary animate-spin" />
                                ) : (
                                  <Upload className="size-10 text-gray-300" />
                                )}
                                <span className="text-sm text-gray-500">
                                  {isUploading
                                    ? "アップロード中..."
                                    : "クリックしてフロアマップをアップロード"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  対応形式: JPG / PNG / PDF
                                </span>
                              </button>
                            ) : (
                              /* アップロード済み */
                              <div className="space-y-4">
                                {/* 画像プレビュー + OCR ラベル */}
                                <div className="relative overflow-hidden rounded-xl border bg-gray-100">
                                  {fm.fileType.startsWith("image/") ? (
                                    <div className="relative">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={fm.downloadUrl}
                                        alt={`${floor}F フロアマップ`}
                                        className="w-full object-contain"
                                      />
                                      {/* OCR ラベル重ね表示 */}
                                      {ocrResult &&
                                        ocrResult.roomCandidates.map(
                                          (room, idx) => (
                                            <div
                                              key={idx}
                                              className="absolute border border-emerald-400/60 bg-emerald-50/40 rounded-sm flex items-center justify-center"
                                              style={{
                                                left: `${room.x}%`,
                                                top: `${room.y}%`,
                                                width: `${Math.max(room.width, 3)}%`,
                                                height: `${Math.max(room.height, 2)}%`,
                                                minWidth: 30,
                                                minHeight: 16,
                                              }}
                                              title={`${room.name} (${Math.round(room.confidence * 100)}%)`}
                                            >
                                              <span className="text-[9px] text-emerald-800 font-medium truncate px-0.5 leading-none">
                                                {room.name}
                                              </span>
                                            </div>
                                          )
                                        )}
                                    </div>
                                  ) : (
                                    /* PDF 表示（プレビューなし） */
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                      <FileImage className="size-12 mb-2" />
                                      <span className="text-sm font-medium">
                                        {fm.fileName}
                                      </span>
                                      <span className="text-xs">
                                        PDF ファイル
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* アクションボタン */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      fileInputRefs.current[floor]?.click()
                                    }
                                    disabled={isUploading}
                                  >
                                    <Upload className="size-3.5 mr-1" />
                                    画像を変更
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRunOcr(fm.id)}
                                    disabled={
                                      isRunningOcr ||
                                      fm.ocrStatus === "processing"
                                    }
                                  >
                                    {isRunningOcr ||
                                    fm.ocrStatus === "processing" ? (
                                      <Loader2 className="size-3.5 mr-1 animate-spin" />
                                    ) : (
                                      <Scan className="size-3.5 mr-1" />
                                    )}
                                    {fm.ocrStatus === "done"
                                      ? "OCR 再実行"
                                      : "OCR 実行"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive ml-auto"
                                    onClick={() =>
                                      handleDeleteFloorMap(fm.id)
                                    }
                                  >
                                    <Trash2 className="size-3.5 mr-1" />
                                    削除
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* OCR 結果 */}
                        {ocrResult && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Scan className="size-4 text-primary" />
                                OCR 結果
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* 抽出テキスト */}
                              <div>
                                <Label className="text-xs text-gray-500 mb-2 block">
                                  抽出テキスト（
                                  {ocrResult.extractedTexts.length}行）
                                </Label>
                                <div className="max-h-40 overflow-y-auto rounded-lg border bg-gray-50 p-3 text-xs text-gray-700 font-mono space-y-0.5">
                                  {ocrResult.extractedTexts.length > 0 ? (
                                    ocrResult.extractedTexts.map(
                                      (text, idx) => (
                                        <div key={idx}>{text}</div>
                                      )
                                    )
                                  ) : (
                                    <span className="text-gray-400">
                                      テキストが検出されませんでした
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* 部屋名候補 */}
                              <div>
                                <Label className="text-xs text-gray-500 mb-2 block">
                                  部屋名候補（
                                  {ocrResult.roomCandidates.length}件）
                                </Label>
                                {ocrResult.roomCandidates.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {ocrResult.roomCandidates
                                      .sort(
                                        (a, b) =>
                                          b.confidence - a.confidence
                                      )
                                      .map((room, idx) => (
                                        <Badge
                                          key={idx}
                                          variant={
                                            room.confidence > 0.7
                                              ? "default"
                                              : room.confidence > 0.4
                                              ? "secondary"
                                              : "outline"
                                          }
                                          className="text-xs"
                                        >
                                          {room.name}
                                          <span className="ml-1 opacity-60">
                                            {Math.round(
                                              room.confidence * 100
                                            )}
                                            %
                                          </span>
                                        </Badge>
                                      ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    部屋名候補が検出されませんでした
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* OCR 処理中 */}
                        {fm?.ocrStatus === "processing" && (
                          <Card>
                            <CardContent className="flex items-center gap-3 py-8 justify-center text-amber-600">
                              <Loader2 className="size-5 animate-spin" />
                              <span className="text-sm font-medium">
                                OCR 解析中です...しばらくお待ちください
                              </span>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
