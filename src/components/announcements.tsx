"use client";

import { type Announcement } from "@/lib/data";

const typeStyles: Record<
  Announcement["type"],
  { bg: string; label: string; weight: string }
> = {
  重要: {
    bg: "bg-gray-100 border-l-4 border-l-gray-800",
    label: "font-bold text-gray-900",
    weight: "font-semibold",
  },
  変更: {
    bg: "bg-gray-50 border-l-4 border-l-gray-500",
    label: "font-semibold text-gray-700",
    weight: "font-medium",
  },
  案内: {
    bg: "bg-white border-l-4 border-l-gray-300",
    label: "font-medium text-gray-500",
    weight: "font-normal",
  },
};

interface AnnouncementsProps {
  announcements: Announcement[];
}

export function Announcements({ announcements }: AnnouncementsProps) {
  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2">
      {announcements.map((ann) => {
        const style = typeStyles[ann.type];
        return (
          <div
            key={ann.id}
            className={`rounded-lg px-4 py-3 ${style.bg} transition-colors`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-md bg-gray-200/60 px-2 py-0.5 text-xs ${style.label}`}
              >
                {ann.type}
              </span>
              <span className={`text-sm ${style.weight} text-gray-800`}>
                {ann.title}
              </span>
              <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                {ann.timestamp}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {ann.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
