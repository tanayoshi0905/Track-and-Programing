import React from "react";
import AiGeneratedMapPreview from "@/components/ai-generated-map-preview";
import { fetchAllOcrResultsForBuilding } from "@/lib/floor-map-actions";

interface PageProps {
  searchParams: Promise<{ buildingId?: string }>;
}

export default async function AiMapAdminPage({ searchParams }: PageProps) {
  const { buildingId } = await searchParams;
  
  let labels = [];
  if (buildingId) {
    labels = await fetchAllOcrResultsForBuilding(buildingId);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            AI生成マッププレビュー
          </h1>
        </div>
        <p className="mt-2 text-gray-500 font-medium">
          {buildingId 
            ? "Geminiの解析結果（リアルデータ）を表示しています。内容を確認し、採用または編集を行ってください。"
            : "建物が選択されていません。階層別マップ管理からアクセスしてください。"}
        </p>
      </header>

      <AiGeneratedMapPreview initialLabels={labels} />
    </div>
  );
}
