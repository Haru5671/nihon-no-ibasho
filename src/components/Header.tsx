"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { TOPICS } from "@/data/posts";
import TopicIcon from "@/components/TopicIcon";

interface HeaderProps {
  searchQuery?: string;
  onSearch?: (q: string) => void;
}

export default function Header({ searchQuery = "", onSearch = () => {} }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    document.getElementById("hiroba")?.scrollIntoView({ behavior: "smooth" });
  };

  const clearSearch = () => {
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-11 flex items-center justify-between gap-4">
          <Link href="/" className="text-gray-900 font-black text-[17px] tracking-tight shrink-0" onClick={() => onSearch("")}>
            <span className="text-teal-600">に</span>ほんのいばしょ
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-3 flex-1 max-w-sm">
            <div className={`flex-1 flex items-center border-2 rounded-full bg-white overflow-hidden h-9 shadow-sm transition-colors ${focused ? 'border-teal-500' : 'border-teal-400 hover:border-teal-500'}`}>
              <svg className="w-4 h-4 text-gray-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="AI失業・失業手当・再就職..."
                className="flex-1 text-[13px] px-2.5 outline-none text-gray-700 bg-white placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-300 hover:text-gray-500 px-2 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white text-[12px] px-4 h-full font-bold transition-colors shrink-0"
              >
                検索
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-500">
            <span className="border border-gray-200 px-2 py-0.5 rounded text-[10px]">登録不要・無料</span>
            <Link href="/mypage" className="hover:text-gray-800 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              保存
            </Link>
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
          <a href="#hiroba" onClick={() => onSearch("")} className="shrink-0 text-[12px] text-gray-600 hover:text-teal-600 px-3 h-full flex items-center border-r border-gray-100 hover:bg-gray-50 transition-colors">
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
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex items-center border border-gray-200 rounded-full overflow-hidden mb-2 h-9">
            <svg className="w-4 h-4 text-gray-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="キーワードで検索..."
              className="flex-1 text-[13px] px-2.5 outline-none text-gray-700 bg-white"
            />
            <button type="submit" className="bg-teal-600 text-white text-[12px] px-4 h-full font-bold">検索</button>
          </form>
          <a href="#hiroba" onClick={() => setOpen(false)} className="text-[13px] text-gray-600 px-3 py-2 rounded hover:bg-gray-100">広場</a>
          <a href="#kobeya" onClick={() => setOpen(false)} className="text-[13px] text-gray-600 px-3 py-2 rounded hover:bg-gray-100">小部屋</a>
        </div>
      )}
    </header>
  );
}
