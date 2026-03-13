"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export function FirstViewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 初回訪問かどうかを判定
    const hasSeenMapOnboarding = localStorage.getItem("hasSeenMapOnboarding");
    if (!hasSeenMapOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleStart = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenMapOnboarding", "true");
  };

  if (!isMounted) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-300">
      <div 
        className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl relative overflow-hidden flex flex-col items-center animate-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center gap-2 mt-4 mb-6">
          <svg className="w-[1.375rem] h-[1.375rem] shrink-0 text-[#ea4335]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <h2 id="modal-title" className="text-[1.35rem] font-bold text-gray-900 tracking-tight">
            高専祭マップへようこそ
          </h2>
        </div>

        <div className="text-center space-y-1.5 mb-8">
          <p className="text-[0.95rem] text-gray-800">地図のピンをタップすると</p>
          <p className="text-[0.95rem] text-gray-800">イベントの詳細を見ることができます</p>
        </div>

        {/* Mock Map Graphic */}
        <div className="relative w-full h-44 mb-6 flex items-center justify-center">
          <div className="relative w-full max-w-[220px] h-full opacity-60">
            {/* grid lines */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}></div>
            
            {/* Mock Buildings */}
            <div className="absolute top-10 left-2 w-12 h-16 bg-white border border-slate-100 rounded-[4px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="text-[10px] text-slate-300 font-medium">1号館</span>
            </div>
            <div className="absolute top-6 left-[5rem] w-14 h-10 bg-white border border-slate-100 rounded-[4px] flex flex-col items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="text-[8px] text-slate-300 translate-y-2 mt-0.5">中庭</span>
              <span className="text-[6px] text-slate-300 translate-y-2">受付</span>
            </div>
            <div className="absolute top-[4.5rem] left-[6.5rem] w-14 h-16 bg-white border border-slate-100 rounded-[4px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="text-[10px] text-slate-300 font-medium">3号館</span>
            </div>
            <div className="absolute top-[5.5rem] left-[2.5rem] w-12 h-16 bg-white border border-slate-100 rounded-[4px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="text-[10px] text-slate-300 font-medium">2号館</span>
            </div>
            <div className="absolute top-[5rem] right-0 w-16 h-14 bg-white border border-slate-100 rounded-[4px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="text-[10px] text-slate-300 font-medium">体育館</span>
            </div>

            {/* Path lines */}
            <div className="absolute top-[4rem] left-[3.25rem] w-1 h-6 bg-slate-100/80"></div>
            <div className="absolute top-[6.5rem] left-[5.5rem] w-4 h-2 bg-slate-100/80"></div>
            <div className="absolute top-[6.5rem] left-[10rem] w-4 h-2 bg-slate-100/80"></div>

            {/* Mock Pins */}
            <div className="absolute top-8 left-[6.5rem] w-4 h-4 bg-indigo-500 rounded-full border-[2.5px] border-white shadow-sm"></div>
            <div className="absolute top-[4.2rem] left-[5rem] w-4 h-4 bg-blue-500 rounded-full border-[2.5px] border-white shadow-sm"></div>
            <div className="absolute top-[3.8rem] left-[7.5rem] w-4 h-4 bg-amber-400 rounded-full border-[2.5px] border-white shadow-sm"></div>
            
            {/* Outline Circle (Current Location mock) */}
            <div className="absolute top-8 right-[2rem] w-[1.375rem] h-[1.375rem] bg-indigo-50 rounded-full border border-indigo-200 flex items-center justify-center">
              <div className="w-[0.55rem] h-[0.55rem] bg-indigo-500 rounded-full"></div>
            </div>
            
            {/* Top-right UI controls mock */}
            <div className="absolute top-2 right-[-0.5rem] w-6 h-10 bg-white border border-slate-100 rounded-md shadow-sm flex flex-col items-center justify-center gap-1 opacity-70">
              <span className="text-[12px] text-slate-400 font-bold leading-none">+</span>
              <div className="w-3 h-[1px] bg-slate-100"></div>
              <span className="text-[14px] text-slate-400 font-bold leading-none">-</span>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        <div className="flex items-center gap-2 mb-8 text-gray-800 relative z-10">
          <Search className="w-[1.2rem] h-[1.2rem] text-gray-700" strokeWidth={1.5} />
          <p className="text-[0.95rem]">検索やカテゴリからも場所を探せます</p>
        </div>

        <button
          onClick={handleStart}
          className="w-full max-w-[240px] bg-[#4285f4] hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-2"
        >
          はじめる
        </button>
      </div>
    </div>
  );
}
