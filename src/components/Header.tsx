"use client";

import { useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/data/posts";
import TopicIcon from "@/components/TopicIcon";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-11 flex items-center justify-between gap-4">
          <Link href="/" className="text-gray-900 font-black text-[17px] tracking-tight shrink-0">
            <span className="text-teal-600">に</span>ほんのいばしょ
          </Link>

          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1 flex items-center border border-gray-300 rounded bg-white overflow-hidden h-7">
              <input
                type="text"
                placeholder="トピックで探す"
                readOnly
                className="flex-1 text-[12px] px-2 outline-none text-gray-500 bg-white"
              />
              <button className="bg-teal-600 text-white text-[11px] px-2.5 h-full font-semibold">検索</button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-500">
            <span className="border border-gray-200 px-2 py-0.5 rounded text-[10px]">登録不要・無料</span>
            <Link href="/admin" className="hover:text-gray-800">管理</Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500"
            aria-label="メニュー"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Topic nav row */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 h-8 flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <a href="#hiroba" className="shrink-0 text-[12px] text-gray-600 hover:text-teal-600 px-3 h-full flex items-center border-r border-gray-100 hover:bg-gray-50 transition-colors">
            すべて
          </a>
          {TOPICS.map((t) => (
            <a
              key={t.id}
              href="#hiroba"
              className="shrink-0 text-[12px] text-gray-600 hover:text-teal-600 px-3 h-full flex items-center gap-1 border-r border-gray-100 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <TopicIcon topic={t.id} size={12} />
              {t.id}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          <a href="#hiroba" onClick={() => setOpen(false)} className="text-[13px] text-gray-600 px-3 py-2 rounded hover:bg-gray-100">広場</a>
          <a href="#kobeya" onClick={() => setOpen(false)} className="text-[13px] text-gray-600 px-3 py-2 rounded hover:bg-gray-100">小部屋</a>
        </div>
      )}
    </header>
  );
}
