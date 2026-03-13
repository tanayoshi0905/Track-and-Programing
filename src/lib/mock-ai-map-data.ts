import { AiExtractedLabel, AiExtractedMapResponse } from "@/types/ai-map";

export const MOCK_AI_LABELS: AiExtractedLabel[] = [
  {
    id: "label-1",
    text: "事務室",
    type: "office",
    confidence: 0.95,
    approxPosition: { x: 0.25, y: 0.35 },
    status: "pending",
  },
  {
    id: "label-2",
    text: "学生昇降口",
    type: "entrance",
    confidence: 0.98,
    approxPosition: { x: 0.85, y: 0.2 },
    status: "pending",
  },
  {
    id: "label-3",
    text: "多目的トイレ",
    type: "restroom",
    confidence: 0.88,
    approxPosition: { x: 0.1, y: 0.15 },
    status: "pending",
  },
  {
    id: "label-4",
    text: "中央階段",
    type: "stairs",
    confidence: 0.92,
    approxPosition: { x: 0.5, y: 0.4 },
    status: "pending",
  },
  {
    id: "label-5",
    text: "大会議室",
    type: "room",
    confidence: 0.85,
    approxPosition: { x: 0.65, y: 0.6 },
    status: "pending",
  },
  {
    id: "label-6",
    text: "受付カウンター",
    type: "reception",
    confidence: 0.97,
    approxPosition: { x: 0.75, y: 0.3 },
    status: "pending",
  },
  {
    id: "label-7",
    text: "エレベーターA",
    type: "elevator",
    confidence: 0.89,
    approxPosition: { x: 0.45, y: 0.4 },
    status: "pending",
  },
  {
    id: "label-8",
    text: "サーバー室",
    type: "facility",
    confidence: 0.72,
    approxPosition: { x: 0.15, y: 0.75 },
    status: "ignored",
  },
  {
    id: "label-9",
    text: "自習室1",
    type: "room",
    confidence: 0.82,
    approxPosition: { x: 0.3, y: 0.85 },
    status: "adopted",
  },
  {
    id: "label-10",
    text: "北連絡通路",
    type: "corridor",
    confidence: 0.65,
    approxPosition: { x: 0.5, y: 0.9 },
    status: "pending",
  },
];

export const MOCK_AI_MAP_RESPONSE: AiExtractedMapResponse = {
  labels: MOCK_AI_LABELS,
};
