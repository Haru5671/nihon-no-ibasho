"use client";

import { useState, useEffect } from "react";
import { TOPICS, type Topic } from "@/data/posts";
import TopicIcon from "@/components/TopicIcon";

const NICKNAME_KEY = "ibasho_nickname";

interface PostFormProps {
  onPosted?: (post: { id: string; body: string; topic: Topic }) => void;
  dark?: boolean;
}

export default function PostForm({ onPosted, dark = false }: PostFormProps) {
  const [input, setInput] = useState("");
  const [nickname, setNickname] = useState("");
  const [postTopic, setPostTopic] = useState<Topic>("なんでも");
  const [focused, setFocused] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(NICKNAME_KEY) ?? "" : "";
    setNickname(saved);
  }, []);

  const handleNicknameChange = (v: string) => {
    setNickname(v);
    if (typeof window !== "undefined") localStorage.setItem(NICKNAME_KEY, v);
  };

  const handlePost = async () => {
    const text = input.trim();
    if (!text || posting) return;
    setError(null);
    setPosting(true);
    const name = nickname.trim() || "にんげんさん";
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, topic: postTopic, name }),
    });
    setPosting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "投稿に失敗しました。");
      return;
    }
    const newPost = await res.json();
    setInput("");
    setFocused(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
    onPosted?.(newPost);
  };

  const bg      = dark ? "bg-white text-on-surface placeholder-outline focus:ring-2 focus:ring-primary/30" : "bg-surface-container text-on-surface placeholder-outline focus:bg-surface-container-high";
  const inputBg = dark ? "bg-white text-on-surface placeholder-outline/60" : "bg-surface-container text-on-surface placeholder-outline";
  const chipOn  = dark ? "bg-white text-primary" : "bg-primary text-on-primary";
  const chipOff = dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim";
  const metaClr = dark ? "text-white/60" : "text-outline";
  const errBg   = dark ? "bg-red-900/40 text-red-200" : "bg-error-container text-on-error-container";

  return (
    <div className="space-y-3">
      {/* Topic chips */}
      <div className="flex gap-1.5 flex-wrap sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-none sm:pb-0.5">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setPostTopic(t.id); setFocused(true); }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              postTopic === t.id ? chipOn : chipOff
            }`}
          >
            <TopicIcon topic={t.id} size={11} />
            {t.id}
          </button>
        ))}
      </div>

      {/* Nickname */}
      <input
        type="text"
        value={nickname}
        onChange={(e) => handleNicknameChange(e.target.value)}
        placeholder="ニックネーム（任意・省略で「にんげんさん」）"
        maxLength={20}
        className={`w-full outline-none text-[12px] rounded-xl px-4 py-2 transition-all ${inputBg}`}
      />

      {/* Textarea */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="気持ちや悩みを話してみてください。長文でも大丈夫です。"
        className={`w-full resize-y outline-none text-[14px] leading-relaxed rounded-xl p-4 transition-all ${bg}`}
        rows={focused ? 5 : 2}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
      />

      {error && (
        <div className={`px-3 py-2 rounded-lg text-[12px] ${errBg}`}>{error}</div>
      )}

      {done && (
        <div className={`px-3 py-2 rounded-lg text-[12px] ${dark ? "bg-white/20 text-white" : "bg-primary/10 text-primary"} font-semibold`}>
          ✓ 投稿しました。広場に表示されます。
        </div>
      )}

      <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg ${dark ? "bg-white/15 text-white/80" : "bg-amber-50 text-amber-700"}`}>
        唯一のルール：悪口禁止。
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-[11px] ${metaClr}`}>⌘+Enter で投稿 · 匿名</span>
        <button
          onClick={handlePost}
          disabled={!input.trim() || posting}
          className={`px-6 py-2.5 text-[13px] font-bold rounded-full transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
            dark
              ? "bg-white text-primary hover:bg-white/90 shadow-mindful"
              : "bg-primary text-on-primary hover:bg-primary/90 shadow-card"
          }`}
        >
          {posting ? "投稿中..." : "投稿する"}
        </button>
      </div>
    </div>
  );
}
