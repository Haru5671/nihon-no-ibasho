"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        <Link href="/" className="text-gray-900 font-bold text-[15px] tracking-tight shrink-0">
          にほんのいばしょ
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <a href="#hiroba" className="text-[13px] text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            広場
          </a>
          <a href="#kobeya" className="text-[13px] text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            小部屋
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-[11px] text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full">
            登録不要・無料
          </span>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="メニュー"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          <a href="#hiroba" onClick={() => setOpen(false)} className="text-[13px] text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            広場
          </a>
          <a href="#kobeya" onClick={() => setOpen(false)} className="text-[13px] text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            小部屋
          </a>
          <span className="text-[11px] text-gray-400 px-3 py-1">登録不要・完全無料</span>
        </div>
      )}
    </header>
  );
}
