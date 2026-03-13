"use client";

import React, { useState, useEffect } from "react";
import { AiExtractedLabel, AiLabelType, AdoptedStatus } from "@/types/ai-map";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, X, Edit2, AlertCircle } from "lucide-react";

interface AiLabelDetailPanelProps {
  selectedLabel: AiExtractedLabel | null;
  onUpdate: (label: AiExtractedLabel) => void;
}

const TYPES: AiLabelType[] = [
  "room", "office", "entrance", "restroom", "stairs", 
  "elevator", "reception", "facility", "corridor", "zone", "other"
];

export function AiLabelDetailPanel({ selectedLabel, onUpdate }: AiLabelDetailPanelProps) {
  const [formData, setFormData] = useState<AiExtractedLabel | null>(null);

  useEffect(() => {
    setFormData(selectedLabel);
  }, [selectedLabel]);

  if (!formData) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center bg-gray-50/50">
        <div className="max-w-[200px]">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">マップ上のノードまたはリストの項目を選択して詳細を表示します</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (status: AdoptedStatus) => {
    onUpdate({ ...formData, status });
  };

  const handleChange = (field: keyof AiExtractedLabel | "x" | "y", value: any) => {
    if (field === "x" || field === "y") {
      onUpdate({
        ...formData,
        approxPosition: {
          ...formData.approxPosition,
          [field]: parseFloat(value) || 0,
        },
      });
    } else {
      onUpdate({ ...formData, [field]: value });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l overflow-y-auto">
      <Card className="border-none shadow-none rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            詳細設定
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            ID: {formData.id}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="text">ラベル名称</Label>
            <Input
              id="text"
              value={formData.text}
              onChange={(e) => handleChange("text", e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">カテゴリ</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => handleChange("type", val)}
            >
              <SelectTrigger id="type" className="h-9">
                <SelectValue placeholder="タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pos-x">座標 X (0.0 - 1.0)</Label>
              <Input
                id="pos-x"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.approxPosition.x}
                onChange={(e) => handleChange("x", e.target.value)}
                className="h-9 font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-y">座標 Y (0.0 - 1.0)</Label>
              <Input
                id="pos-y"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.approxPosition.y}
                onChange={(e) => handleChange("y", e.target.value)}
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">AI 抽出メタデータ</div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">確信度</span>
              <span className={cn(
                "font-bold text-lg",
                formData.confidence > 0.9 ? "text-green-600" : formData.confidence > 0.7 ? "text-amber-600" : "text-red-600"
              )}>
                {Math.round(formData.confidence * 100)}%
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-4 border-t">
          {formData.status === "pending" ? (
            <>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => handleStatusChange("adopted")}
              >
                <Check className="w-4 h-4 mr-2" />
                採用する
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={() => handleStatusChange("ignored")}
              >
                <X className="w-4 h-4 mr-2" />
                無視する
              </Button>
            </>
          ) : (
            <div className="w-full space-y-2">
              <div className={cn(
                "p-3 rounded-md text-center text-sm font-medium border flex items-center justify-center gap-2",
                formData.status === "adopted" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-red-50 border-red-200 text-red-700"
              )}>
                {formData.status === "adopted" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {formData.status === "adopted" ? "採用済み" : "無視設定済み"}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-gray-400 hover:text-gray-600"
                onClick={() => handleStatusChange("pending")}
              >
                ステータスを戻す
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-auto p-4 bg-amber-50 rounded-t-xl border-t border-amber-100">
        <p className="text-[11px] text-amber-700 leading-relaxed italic">
          確定した項目は、後でイベント地点データ (Locations) として正式にエクスポートできます。
        </p>
      </div>
    </div>
  );
}
