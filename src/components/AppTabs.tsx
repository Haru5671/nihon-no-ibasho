"use client";

import { useState, useEffect } from "react";
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
  onTopicClear?: () => void;
  searchQuery?: string;
}

export default function AppTabs({ initialTopic, onTopicSelect, onTopicClear, searchQuery = "" }: AppTabsProps) {
  const [active, setActive] = useState<TabId>("hiroba");
  const [hirohaTopic, setHirohaTopic] = useState<Topic | undefined>(initialTopic);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (initialTopic !== undefined) {
      setHirohaTopic(initialTopic);
      setActive("hiroba");
      setActiveRoom(null);
    }
  }, [initialTopic]);

  const handleEnterRoom = (room: Room) => {
    setActiveRoom(room);
    setActive("kobeya");
  };

  const handleLeaveRoom = () => setActiveRoom(null);

  const handleTopicClick = (topic: Topic) => {
    setHirohaTopic(topic);
    setActive("hiroba");
    onTopicSelect?.(topic);
  };

  return (
    <section className="bg-surface-container min-h-screen" id="hiroba">
      {/* Sticky tab bar */}
      <div className="sticky top-[80px] z-40 glass-nav border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActive(tab.id); if (tab.id !== "kobeya") setActiveRoom(null); }}
                className={`py-3 px-4 sm:px-5 text-[13px] font-semibold transition-colors relative border-b-2 ${
                  active === tab.id
                    ? "text-primary border-primary"
                    : "text-outline border-transparent hover:text-on-surface"
                }`}
              >
                <span className="font-headline">{tab.label}</span>
                <span className="hidden sm:inline text-[11px] font-normal ml-1 opacity-60">— {tab.desc}</span>
              </button>
            ))}
          </div>
          <span className="text-[11px] text-outline hidden sm:block">悪口禁止・匿名</span>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex gap-6 items-start">

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile widget compact bar */}
          <div className="lg:hidden mb-3 bg-surface-container-lowest rounded-xl shadow-card overflow-hidden divide-y divide-outline-variant/15">
            <TrendingWidget compact />
            <div className="flex divide-x divide-outline-variant/15">
              <div className="flex-1 min-w-0"><WeatherWidget compact /></div>
              <div className="flex-1 min-w-0"><BaseballWidget compact /></div>
            </div>
          </div>

          {active === "hiroba" && <Hiroba defaultTopic={hirohaTopic} searchQuery={searchQuery} />}
          {active === "kobeya" && !activeRoom && <Kobeya onEnterRoom={handleEnterRoom} />}
          {active === "kobeya" && activeRoom && (
            <KobeyaRoom room={activeRoom} onLeave={handleLeaveRoom} />
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 gap-4">

          {/* Trending */}
          <TrendingWidget />

          {/* Weather + Baseball side by side */}
          <WeatherWidget />
          <BaseballWidget />

          {/* Ad */}
          <AdSenseUnit className="overflow-hidden rounded-2xl" />

          {/* Topic filter */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 bg-surface-container-low">
              <span className="text-[12px] font-bold text-primary font-headline">トピックから探す</span>
            </div>
            <div className="py-2">
              <button
                onClick={() => { setHirohaTopic(undefined); setActive("hiroba"); onTopicClear?.(); }}
                className="w-full text-left px-5 py-2.5 text-[12px] text-primary hover:bg-surface-container-low font-semibold transition-colors flex items-center gap-2"
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" />
                  <rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" />
                </svg>
                すべて表示
              </button>
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTopicClick(t.id)}
                  className={`w-full text-left px-5 py-2.5 text-[12px] transition-colors flex items-center gap-2 ${
                    hirohaTopic === t.id && active === "hiroba"
                      ? "bg-primary/8 text-primary font-semibold"
                      : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <TopicIcon topic={t.id} size={13} />
                  {t.id}
                </button>
              ))}
            </div>
          </div>

          {/* News */}
          <NewsWidget />

          {/* About */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-card p-5">
            <p className="text-[12px] font-bold text-primary mb-2 font-headline">にほんのいばしょとは</p>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              AI失業・失業手当・再就職・クビ・有休消化など、誰にも相談できない悩みを匿名で話せる場所。登録不要・完全無料。
            </p>
          </div>

        </aside>
      </div>
    </section>
  );
}
