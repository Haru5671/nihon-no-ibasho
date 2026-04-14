"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOPICS, type Topic } from "@/data/posts";
import TopicIcon from "@/components/TopicIcon";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  searchQuery?: string;
  onSearch?: (q: string) => void;
  onTopicSelect?: (topic: Topic) => void;
}

export default function Header({ searchQuery = "", onSearch = () => {}, onTopicSelect }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    if (window.location.pathname === "/") {
      document.getElementById("hiroba")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#hiroba");
    }
  };

  const handleTopicClick = (topic: Topic | null, e: React.MouseEvent) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      if (topic !== null) onTopicSelect?.(topic);
      document.getElementById("hiroba")?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav shadow-glass h-20 flex flex-col justify-end">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-8 h-14">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => onSearch("")}
          className="font-headline font-bold text-[22px] tracking-tighter text-primary shrink-0"
        >
          <span className="text-primary-container">に</span>ほんのいばしょ
        </Link>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-6">
          <div className={`w-full flex items-center rounded-full bg-surface-container-high h-9 overflow-hidden transition-all ${
            focused ? "ring-2 ring-primary" : ""
          }`}>
            <svg className="w-4 h-4 text-outline ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="AI失業・失業手当・再就職..."
              className="flex-1 text-[13px] px-2.5 outline-none bg-transparent text-on-surface placeholder-outline"
            />
            {searchQuery && (
              <button type="button" onClick={() => { onSearch(""); inputRef.current?.focus(); }} className="text-outline hover:text-on-surface px-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
            <button type="submit" className="bg-primary hover:bg-primary/90 text-on-primary text-[12px] px-4 h-full font-semibold transition-colors shrink-0">
              検索
            </button>
          </div>
        </form>

        {/* Right actions — desktop */}
        <div className="hidden md:flex items-center gap-5 text-[12px] text-outline">
          <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] px-2.5 py-0.5 rounded-full font-semibold">登録不要・無料</span>
          <Link href="/mypage" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            マイページ
            <span
              className={`w-2 h-2 rounded-full ${loggedIn ? "bg-primary-container" : "bg-outline-variant"}`}
              title={loggedIn ? "ログイン中" : "未ログイン"}
            />
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-8 h-8 flex items-center justify-center text-outline"
          aria-label="メニュー"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Topic nav strip */}
      <div className="border-t border-outline-variant/20">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 h-8 flex items-center overflow-x-auto scrollbar-none">
          <a
            href="/#hiroba"
            onClick={(e) => { onSearch(""); handleTopicClick(null, e); }}
            className="shrink-0 text-[11px] font-medium text-on-surface-variant hover:text-primary px-3 h-full flex items-center transition-colors"
          >
            すべて
          </a>
          {TOPICS.map((t) => (
            <a
              key={t.id}
              href="/#hiroba"
              onClick={(e) => handleTopicClick(t.id, e)}
              className="shrink-0 text-[11px] font-medium text-on-surface-variant hover:text-primary px-3 h-full flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <TopicIcon topic={t.id} size={11} />
              {t.id}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface-container-lowest shadow-float p-4 flex flex-col gap-2">
          <form onSubmit={handleSearch} className="flex items-center rounded-full bg-surface-container-high overflow-hidden h-10 mb-2">
            <svg className="w-4 h-4 text-outline ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="キーワードで検索..."
              className="flex-1 text-[13px] px-2.5 outline-none bg-transparent text-on-surface"
            />
            <button type="submit" className="bg-primary text-on-primary text-[12px] px-4 h-full font-semibold">検索</button>
          </form>
          <a href="/#hiroba" onClick={() => setMobileOpen(false)} className="text-[13px] text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container transition-colors">広場</a>
          <a href="/#kobeya" onClick={() => setMobileOpen(false)} className="text-[13px] text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container transition-colors">小部屋</a>
          <Link href="/mypage" onClick={() => setMobileOpen(false)} className="text-[13px] text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2">
            マイページ
            <span className={`w-2 h-2 rounded-full ${loggedIn ? "bg-primary-container" : "bg-outline-variant"}`} />
          </Link>
        </div>
      )}
    </header>
  );
}
