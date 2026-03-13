"use client";

import React, { useState, useMemo } from "react";
import { AiExtractedLabel, AiLabelType } from "@/types/ai-map";
import { AiMapNode } from "./ai-map-node";
import { AiLabelList } from "./ai-label-list";
import { AiLabelDetailPanel } from "./ai-label-detail-panel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface AiGeneratedMapPreviewProps {
  initialLabels: AiExtractedLabel[];
}

export default function AiGeneratedMapPreview({ initialLabels }: AiGeneratedMapPreviewProps) {
  const [labels, setLabels] = useState<AiExtractedLabel[]>(initialLabels);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [showOnlyAdopted, setShowOnlyAdopted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");

  // 利用可能な階層リストを取得
  const availableFloors = useMemo(() => {
    const floors = new Set(labels.map(l => (l as any).floorNumber).filter(f => f !== undefined));
    return Array.from(floors).sort((a, b) => (a as number) - (b as number)) as number[];
  }, [labels]);

  // フィルタリング処理
  const filteredLabels = useMemo(() => {
    return labels.filter((l) => {
      // 階層フィルタ
      if (selectedFloor !== "all" && (l as any).floorNumber !== selectedFloor) return false;
      // タイプフィルタ
      if (activeTab !== "all" && l.type !== activeTab) return false;
      // 確信度フィルタ
      if (l.confidence < minConfidence) return false;
      // 採用済みフィルタ
      if (showOnlyAdopted && l.status !== "adopted") return false;
      // 検索フィルタ
      if (searchQuery && !l.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [labels, selectedFloor, activeTab, minConfidence, showOnlyAdopted, searchQuery]);

  const selectedLabel = useMemo(() => 
    labels.find(l => l.id === selectedId) || null
  , [labels, selectedId]);

  const handleUpdateLabel = (updatedLabel: AiExtractedLabel) => {
    setLabels(prev => prev.map(l => l.id === updatedLabel.id ? updatedLabel : l));
  };

  const stats = useMemo(() => {
    const total = labels.length;
    const adopted = labels.filter(l => l.status === "adopted").length;
    const ignored = labels.filter(l => l.status === "ignored").length;
    const pending = total - adopted - ignored;
    return { total, adopted, ignored, pending, progress: (adopted / (total - ignored || 1)) * 100 };
  }, [labels]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* フィルター・操作エリア */}
      <div className="bg-white p-4 border rounded-xl mb-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs defaultValue="all" className="w-auto" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="room">部屋</TabsTrigger>
              <TabsTrigger value="corridor">廊下</TabsTrigger>
              <TabsTrigger value="entrance">入口</TabsTrigger>
              <TabsTrigger value="restroom">トイレ</TabsTrigger>
              <TabsTrigger value="facility">設備</TabsTrigger>
              <TabsTrigger value="zone">エリア</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="only-adopted" 
                checked={showOnlyAdopted} 
                onCheckedChange={setShowOnlyAdopted} 
              />
              <Label htmlFor="only-adopted" className="text-sm font-medium">採用済みのみ</Label>
            </div>

            <div className="flex items-center gap-3 min-w-[150px]">
              <Label className="text-xs text-gray-500 whitespace-nowrap">階層</Label>
              <Select 
                value={selectedFloor.toString()} 
                onValueChange={(v) => setSelectedFloor(v === "all" ? "all" : parseInt(v))}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {availableFloors.map(f => (
                    <SelectItem key={f} value={f.toString()}>{f}F</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 min-w-[200px]">
              <Label className="text-xs text-gray-500 whitespace-nowrap">確信度 {Math.round(minConfidence * 100)}%+</Label>
              <Select 
                value={minConfidence.toString()} 
                onValueChange={(v) => setMinConfidence(parseFloat(v))}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="0.5">50%</SelectItem>
                  <SelectItem value="0.7">70%</SelectItem>
                  <SelectItem value="0.9">90%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">進捗: {Math.round(stats.progress)}%</span>
            <Progress value={stats.progress} className="h-2 flex-1 max-w-[300px]" />
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-blue-600 font-semibold">採用: {stats.adopted}</span>
            <span className="text-red-600 font-semibold">無視: {stats.ignored}</span>
            <span className="text-gray-400">未判定: {stats.pending}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden border rounded-2xl shadow-xl bg-gray-50/30">
        {/* 左: ラベルリスト */}
        <div className="w-80 flex-shrink-0">
          <AiLabelList
            labels={filteredLabels}
            selectedId={selectedId}
            onSelect={setSelectedId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* 中央: 簡易マップ */}
        <div className="flex-1 relative overflow-auto p-12 bg-pattern custom-bg-grid">
          <div className="relative mx-auto w-full max-w-4xl aspect-[16/10] bg-white border shadow-inner rounded-xl overflow-hidden overflow-visible">
            {/* 背景のグリッド（装飾） */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            {filteredLabels.map((label) => (
              <AiMapNode
                key={label.id}
                label={label}
                isSelected={selectedId === label.id}
                onClick={() => setSelectedId(label.id)}
              />
            ))}

            {filteredLabels.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                表示対象のラベルがありません
              </div>
            )}
          </div>
        </div>

        {/* 右: 詳細パネル */}
        <div className="w-96 flex-shrink-0">
          <AiLabelDetailPanel
            selectedLabel={selectedLabel}
            onUpdate={handleUpdateLabel}
          />
        </div>
      </div>
    </div>
  );
}
