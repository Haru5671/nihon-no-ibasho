"use client";

import { useState } from "react";
import { initialPosts, TOPICS, type Topic } from "@/data/posts";

export interface Room {
  id: number;
  topic: Topic;
  name: string;
  desc: string;
  members: number;
}

interface KobeyaRoomProps {
  room: Room;
  onLeave: () => void;
}

export default function KobeyaRoom({ room, onLeave }: KobeyaRoomProps) {
  const topicMeta = TOPICS.find((t) => t.id === room.topic) ?? TOPICS[TOPICS.length - 1];

  const seed = initialPosts.filter((p) => p.topic === room.topic);
  const [messages, setMessages] = useState(
    seed.map((p) => ({ id: p.id, name: p.name, body: p.body, time: p.time, likes: p.likes, liked: p.liked }))
  );
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(9000);

  const handlePost = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId, name: "にんげんさん", body: text, time: "たった今", likes: 0, liked: false },
    ]);
    setNextId((n) => n + 1);
    setInput("");
  };

  const toggleLike = (id: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 } : m
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Room header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onLeave}
            className="shrink-0 mt-0.5 flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            部屋一覧
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${topicMeta.color}`}>
                {topicMeta.emoji} {room.topic}
              </span>
              <h2 className="text-[15px] font-bold text-gray-900">{room.name}</h2>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">{room.desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[11px] text-gray-400 block">{room.members.toLocaleString()} 人</span>
            <span className="text-[10px] text-green-500">● 話し中</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            まだ誰も話していません。最初に話しかけてみませんか？
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.name === "にんげんさん" && msg.time === "たった今";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isMe ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500"
              }`}>
                {msg.name[0]}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isMe && (
                  <span className="text-[11px] text-gray-400 px-1">{msg.name} · {msg.time}</span>
                )}
                <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  isMe
                    ? "bg-teal-600 text-white rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.body}
                </div>
                {/* Like */}
                <button
                  onClick={() => toggleLike(msg.id)}
                  className={`flex items-center gap-1 text-[11px] px-1.5 transition-colors ${
                    msg.liked ? "text-rose-500" : "text-gray-300 hover:text-rose-400"
                  }`}
                >
                  <span>{msg.liked ? "♥" : "♡"}</span>
                  {msg.likes > 0 && <span>{msg.likes}</span>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="sticky bottom-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-3 flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${room.name}に話しかける...`}
            className="flex-1 bg-transparent text-gray-700 placeholder-gray-300 resize-none outline-none text-[13px] leading-relaxed"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
            }}
          />
          <button
            onClick={handlePost}
            disabled={!input.trim()}
            className="shrink-0 w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-1.5">⌘+Enter で送信</p>
      </div>
    </div>
  );
}
