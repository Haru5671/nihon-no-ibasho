"use client";

import { useState } from "react";
import Hiroba from "./Hiroba";
import Kobeya from "./Kobeya";
import KobeyaRoom, { type Room } from "./KobeyaRoom";
import type { Topic } from "@/data/posts";
import { TOPICS } from "@/data/posts";
import TopicIcon from "./TopicIcon";
import WeatherWidget from "./WeatherWidget";
import NewsWidget from "./NewsWidget";
import BaseballWidget from "./BaseballWidget";
import TrendingWidget from "./TrendingWidget";
import AdSenseUnit from "./AdSenseUnit";

const tabs = [
  { id: "hiroba", label: "広場", desc: "みんなの声" },
  { id: "kobeya", label: "小部屋", desc: "テーマ別" },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface AppTabsProps {
  initialTopic?: Topic;
  onTopicSelect?: (topic: Topic) => void;
}

export default function AppTabs({ initialTopic, onTopicSelect }: AppTabsProps) {
  const [active, setActive] = useState<TabId>("hiroba");
  const [hirohaTopic, setHirohaTopic] = useState<Topic | undefined>(initialTopic);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const handleEnterRoom = (room: Room) => {
    setActiveRoom(room);
    setActive("kobeya");
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
  };

  const handleTopicClick = (topic: Topic) => {
    setHirohaTopic(topic);
    setActive("hiroba");
    onTopicSelect?.(topic);
  };

  return (
    <section className="bg-[#f4f4f2] min-h-screen" id="hiroba">
      {/* Tab bar */}
      <div className="sticky top-[76px] z-40 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActive(tab.id); if (tab.id !== "kobeya") setActiveRoom(null); }}
                className={`py-3 px-3 sm:px-4 text-[13px] font-semibold transition-colors relative border-b-2 ${
                  active === tab.id
                    ? "text-teal-600 border-teal-600"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                {tab.label}
                <span className="hidden sm:inline text-[11px] font-normal ml-1 opacity-60">— {tab.desc}</span>
              </button>
            ))}
          </div>
          <span className="text-[11px] text-gray-400 hidden sm:block">悪口禁止 · 匿名</span>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex gap-4 items-start">

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile widget bar */}
          <div className="lg:hidden mb-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <div className="shrink-0 w-[260px]"><TrendingWidget /></div>
            <div className="shrink-0 w-[200px]"><WeatherWidget /></div>
            <div className="shrink-0 w-[220px]"><BaseballWidget /></div>
          </div>
          {active === "hiroba" && <Hiroba defaultTopic={hirohaTopic} />}
          {active === "kobeya" && !activeRoom && <Kobeya onEnterRoom={handleEnterRoom} />}
          {active === "kobeya" && activeRoom && (
            <KobeyaRoom room={activeRoom} onLeave={handleLeaveRoom} />
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-[240px] shrink-0 space-y-3">

          {/* Trending keywords */}
          <TrendingWidget />

          {/* Weather */}
          <WeatherWidget />

          {/* Baseball */}
          <BaseballWidget />

          {/* Ad unit */}
          <AdSenseUnit className="overflow-hidden rounded border border-gray-200" />

          {/* Topics */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-[12px] font-bold text-gray-700">トピックから探す</span>
            </div>
            <div className="divide-y divide-gray-100">
              <button
                onClick={() => { setHirohaTopic(undefined); setActive("hiroba"); }}
                className="w-full text-left px-3 py-2 text-[12px] text-teal-600 hover:bg-gray-50 font-semibold transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" />
                  <rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" />
                </svg>
                すべて表示
              </button>
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTopicClick(t.id)}
                  className={`w-full text-left px-3 py-2 text-[12px] hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2 ${
                    hirohaTopic === t.id && active === 'hiroba' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <TopicIcon topic={t.id} size={14} />
                  {t.id}
                </button>
              ))}
            </div>
          </div>

          {/* News */}
          <NewsWidget />

          {/* About */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <p className="text-[11px] font-bold text-gray-700 mb-1.5">にほんのいばしょとは</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              AI失業・失業手当・再就職・クビ・有休消化など、誰にも相談できない悩みを匿名で話せる場所。登録不要・完全無料。
            </p>
          </div>

        </aside>
      </div>
    </section>
  );
}
