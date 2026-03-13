"use client";

import React from "react";
import { AiExtractedLabel } from "@/types/ai-map";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AiLabelListProps {
  labels: AiExtractedLabel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const STATUS_LABELS = {
  pending: { text: "未採用", className: "bg-gray-100 text-gray-600" },
  adopted: { text: "採用済み", className: "bg-blue-100 text-blue-700" },
  ignored: { text: "無視", className: "bg-red-100 text-red-700" },
};

export function AiLabelList({ labels, selectedId, onSelect, searchQuery, setSearchQuery }: AiLabelListProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3 text-sm">ラベル候補一覧</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="項目を検索..."
            className="pl-9 text-sm h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => onSelect(label.id)}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all duration-150 group",
              selectedId === label.id
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-transparent hover:bg-gray-50 hover:border-gray-200"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-sm text-gray-900">{label.text}</span>
              <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5", STATUS_LABELS[label.status].className)}>
                {STATUS_LABELS[label.status].text}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="capitalize">{label.type}</span>
              <span className="flex items-center gap-1">
                確信度: 
                <span className={cn(
                  "font-semibold",
                  label.confidence > 0.9 ? "text-green-600" : label.confidence > 0.7 ? "text-amber-600" : "text-red-600"
                )}>
                  {Math.round(label.confidence * 100)}%
                </span>
              </span>
            </div>
          </button>
        ))}
        
        {labels.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400 italic">
            該当するラベルが見つかりません
          </div>
        )}
      </div>
    </div>
  );
}
