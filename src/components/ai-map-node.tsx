"use client";

import React from "react";
import { AiExtractedLabel, AiLabelType } from "@/types/ai-map";
import { cn } from "@/lib/utils";
import { 
  DoorOpen, 
  UserRound, 
  MapPin, 
  Construction, 
  ArrowUpSquare, 
  ArrowDownSquare, 
  Waves,
  Info
} from "lucide-react";

interface AiMapNodeProps {
  label: AiExtractedLabel;
  isSelected: boolean;
  onClick: () => void;
}

const TYPE_CONFIG: Record<AiLabelType, { icon: React.ReactNode; color: string; label: string }> = {
  room: { icon: <DoorOpen className="w-4 h-4" />, color: "bg-blue-50 border-blue-200 text-blue-700", label: "部屋" },
  office: { icon: <UserRound className="w-4 h-4" />, color: "bg-indigo-50 border-indigo-200 text-indigo-700", label: "事務室" },
  entrance: { icon: <MapPin className="w-4 h-4" />, color: "bg-green-50 border-green-200 text-green-700", label: "入口" },
  restroom: { icon: <Waves className="w-4 h-4" />, color: "bg-cyan-50 border-cyan-200 text-cyan-700", label: "トイレ" },
  stairs: { icon: <ArrowUpSquare className="w-4 h-4" />, color: "bg-amber-50 border-amber-200 text-amber-700", label: "階段" },
  elevator: { icon: <ArrowDownSquare className="w-4 h-4" />, color: "bg-orange-50 border-orange-200 text-orange-700", label: "EV" },
  reception: { icon: <Info className="w-4 h-4" />, color: "bg-rose-50 border-rose-200 text-rose-700", label: "受付" },
  facility: { icon: <Construction className="w-4 h-4" />, color: "bg-slate-50 border-slate-200 text-slate-700", label: "設備" },
  corridor: { icon: null, color: "bg-gray-50 border-gray-200 text-gray-500", label: "通路" },
  zone: { icon: null, color: "bg-purple-50 border-purple-200 text-purple-700", label: "エリア" },
  other: { icon: null, color: "bg-gray-50 border-gray-200 text-gray-700", label: "その他" },
};

export function AiMapNode({ label, isSelected, onClick }: AiMapNodeProps) {
  const config = TYPE_CONFIG[label.type] || TYPE_CONFIG.other;
  
  // 透明度を設定（信頼度が低いほど薄く）
  const opacity = label.status === "ignored" ? 0.3 : Math.max(0.4, label.confidence);

  // 矩形サイズ（指定があればそれを使う。なければデフォルト）
  const width = label.width ? `${label.width * 100}%` : "auto";
  const height = label.height ? `${label.height * 100}%` : "auto";

  return (
    <div
      style={{
        left: `${label.approxPosition.x * 100}%`,
        top: `${label.approxPosition.y * 100}%`,
        width,
        height,
        transform: "translate(-50%, -50%)",
        opacity: opacity,
        minWidth: !label.width ? "80px" : undefined,
        minHeight: !label.height ? "40px" : undefined,
      }}
      onClick={onClick}
      className={cn(
        "absolute cursor-pointer transition-all duration-200 overflow-hidden",
        "flex flex-col items-center justify-center p-2 rounded-lg border-2 shadow-sm",
        config.color,
        isSelected ? "ring-4 ring-offset-2 ring-blue-500 z-50 scale-110 shadow-lg" : "z-10 hover:scale-105 hover:z-20",
        label.status === "adopted" && "border-solid border-primary",
        label.status === "pending" && "border-dashed"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1 shrink-0">
        {config.icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{config.label}</span>
      </div>
      <div className="text-xs font-bold truncate w-full text-center px-1">
        {label.text}
      </div>
    </div>
  );
}
