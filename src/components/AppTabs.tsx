"use client";

import { useState } from "react";
import Hiroba from "./Hiroba";
import Kobeya from "./Kobeya";
import KobeyaRoom, { type Room } from "./KobeyaRoom";
import type { Topic } from "@/data/posts";

const tabs = [
  { id: "hiroba", label: "広場",   desc: "みんなの声" },
  { id: "kobeya", label: "小部屋", desc: "テーマ別の部屋" },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface AppTabsProps {
  initialTopic?: Topic;
}

export default function AppTabs({ initialTopic }: AppTabsProps) {
  const [active, setActive] = useState<TabId>("hiroba");
  const [hirohaTopic] = useState<Topic | undefined>(initialTopic);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const handleEnterRoom = (room: Room) => {
    setActiveRoom(room);
    setActive("kobeya");
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
  };

  return (
    <section className="bg-[#f7f7f5] min-h-screen" id="hiroba">
      {/* Tab bar */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActive(tab.id); if (tab.id !== "kobeya") setActiveRoom(null); }}
              className={`py-3.5 px-5 text-[13px] font-semibold transition-colors relative border-b-2 ${
                active === tab.id
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {tab.label}
              <span className="hidden sm:inline text-[11px] font-normal ml-1 opacity-60">
                {tab.id === "kobeya" && activeRoom ? `— ${activeRoom.name}` : `— ${tab.desc}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {active === "hiroba" && <Hiroba defaultTopic={hirohaTopic} />}
        {active === "kobeya" && !activeRoom && <Kobeya onEnterRoom={handleEnterRoom} />}
        {active === "kobeya" && activeRoom && (
          <KobeyaRoom room={activeRoom} onLeave={handleLeaveRoom} />
        )}
      </div>
    </section>
  );
}
