"use client";

import { useState } from "react";
import Hiroba from "./Hiroba";
import Kobeya from "./Kobeya";
import KobeyaRoom, { type Room } from "./KobeyaRoom";
import type { Topic } from "@/data/posts";
import { TOPICS } from "@/data/posts";

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
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActive(tab.id); if (tab.id !== "kobeya") setActiveRoom(null); }}
                className={`py-3 px-4 text-[13px] font-semibold transition-colors relative border-b-2 ${
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
      <div className="max-w-5xl mx-auto px-4 py-4 flex gap-4 items-start">

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {active === "hiroba" && <Hiroba defaultTopic={hirohaTopic} />}
          {active === "kobeya" && !activeRoom && <Kobeya onEnterRoom={handleEnterRoom} />}
          {active === "kobeya" && activeRoom && (
            <KobeyaRoom room={activeRoom} onLeave={handleLeaveRoom} />
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-3">

          {/* Topics */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-[12px] font-bold text-gray-700">トピックから探す</span>
            </div>
            <div className="divide-y divide-gray-100">
              <button
                onClick={() => { setHirohaTopic(undefined); setActive("hiroba"); }}
                className="w-full text-left px-3 py-2 text-[12px] text-teal-600 hover:bg-gray-50 font-semibold transition-colors"
              >
                📋 すべて表示
              </button>
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTopicClick(t.id)}
                  className="w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
                >
                  <span>{t.emoji}</span>
                  <span>{t.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <p className="text-[11px] font-bold text-gray-700 mb-1">にほんのいばしょとは</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              AI失業・失業手当・再就職・クビ・有休消化など、誰にも相談できない悩みを匿名で話せるコミュニティです。登録不要・完全無料。
            </p>
          </div>

          {/* Notice */}
          <div className="bg-teal-50 border border-teal-100 rounded p-3">
            <p className="text-[11px] font-bold text-teal-700 mb-1">唯一のルール</p>
            <p className="text-[11px] text-teal-600">悪口禁止。同調と対話の場です。</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
