"use client";

import { type Announcement } from "@/lib/data";

const typeStyles: Record<
  Announcement["type"],
  { bg: string; badge: string; text: string }
> = {
  重要: {
    bg: "bg-red-50 border-l-4 border-l-red-500",
    badge: "bg-red-100 text-red-800",
    text: "font-semibold text-red-950",
  },
  変更: {
    bg: "bg-yellow-50 border-l-4 border-l-yellow-500",
    badge: "bg-yellow-200 text-yellow-800",
    text: "font-medium text-yellow-950",
  },
  案内: {
    bg: "bg-blue-50 border-l-4 border-l-blue-500",
    badge: "bg-blue-100 text-blue-800",
    text: "font-normal text-blue-950",
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
                className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${style.badge}`}
              >
                {ann.type}
              </span>
              <span className={`text-sm ${style.text}`}>
                {ann.title}
              </span>
              <span className="ml-auto text-xs text-gray-500 whitespace-nowrap">
                {ann.timestamp}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">
              {ann.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
