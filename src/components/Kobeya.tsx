"use client";

import { TOPICS, type Topic } from "@/data/posts";
import type { Room } from "@/components/KobeyaRoom";

export const rooms: Room[] = [
  { id: 1, topic: "眠れない・不安", name: "夜更かしの会",       desc: "眠れない夜に、ゆるくつながる部屋。",         members: 128 },
  { id: 2, topic: "体・こころ",     name: "HSPのひといき",      desc: "繊細さを持つ人同士で、安心して話せる場。",   members: 95  },
  { id: 3, topic: "孤独・さみしさ", name: "在宅ワーカーの雑談", desc: "リモートワークの孤独を分かち合う。",         members: 74  },
  { id: 4, topic: "なんでも",       name: "読書と内省",         desc: "本を通じて自分を見つめ直す部屋。",           members: 56  },
  { id: 5, topic: "なんでも",       name: "散歩部",             desc: "今日歩いた道、見つけた景色をシェア。",       members: 112 },
  { id: 6, topic: "なんでも",       name: "なんとなく話したい", desc: "テーマなし。ただ誰かと話したいときに。",     members: 203 },
  { id: 7, topic: "仕事・AI",       name: "AIと仕事を語る",     desc: "AIへの不安や変化を、ここで吐き出してみて。", members: 167 },
  { id: 8, topic: "家族・人間関係", name: "家族のこと",         desc: "家族には言えない家族の話をする場所。",       members: 89  },
];

interface KobeyaProps {
  onEnterRoom: (room: Room) => void;
}

export default function Kobeya({ onEnterRoom }: KobeyaProps) {
  const getTopicMeta = (topic: Topic) => TOPICS.find((t) => t.id === topic) ?? TOPICS[TOPICS.length - 1];

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-[13px] text-gray-400 mb-6 text-center leading-relaxed">
        テーマごとの小部屋です。入室するとその話題に集中した会話ができます。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rooms.map((room) => {
          const m = getTopicMeta(room.topic);
          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onEnterRoom(room)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${m.color}`}>
                  {m.emoji} {room.topic}
                </span>
              </div>
              <h3 className="text-gray-900 font-bold text-[14px] mb-1">{room.name}</h3>
              <p className="text-gray-500 text-[12px] mb-4 flex-1 leading-relaxed">{room.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  <span className="text-green-500 mr-1">●</span>
                  {room.members.toLocaleString()} 人が話している
                </span>
                <button
                  className="px-3.5 py-1.5 text-[12px] font-semibold rounded-lg bg-gray-900 group-hover:bg-teal-600 text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); onEnterRoom(room); }}
                >
                  入る
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
