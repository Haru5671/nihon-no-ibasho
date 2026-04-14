"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TOPICS, type Topic } from "@/data/posts";
import ShareButtons from "@/components/ShareButtons";
import SaveButton from "@/components/SaveButton";
import AdSenseUnit from "@/components/AdSenseUnit";
import TopicIcon from "@/components/TopicIcon";
import { timeAgo } from "@/lib/utils";

interface Post {
  id: string;
  name: string;
  body: string;
  topic: Topic;
  likes: number;
  created_at: string;
  replies: { count: number }[];
  liked?: boolean;
}

const NICKNAME_KEY = "ibasho_nickname";

export default function Hiroba({ defaultTopic, searchQuery = "" }: { defaultTopic?: Topic; searchQuery?: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | "すべて">(defaultTopic ?? "すべて");
  const [newPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);
  const [replyNickname, setReplyNickname] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(NICKNAME_KEY) ?? "" : "";
    setReplyNickname(saved);
  }, []);

  useEffect(() => {
    if (defaultTopic) setSelectedTopic(defaultTopic);
    else setSelectedTopic("すべて");
  }, [defaultTopic]);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data.map((p: Post) => ({ ...p, liked: false })));
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    if (!post.liked) fetch(`/api/posts/${id}/like`, { method: "POST" });
    setPosts(posts.map((p) =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const submitReply = async (postId: string) => {
    const text = (replyInputs[postId] ?? "").trim();
    if (!text) return;
    setReplySubmitting(postId);
    const res = await fetch(`/api/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, name: replyNickname.trim() || "にんげんさん" }),
    });
    if (res.ok) {
      setPosts(posts.map((p) =>
        p.id === postId
          ? { ...p, replies: [{ count: (p.replies?.[0]?.count ?? 0) + 1 }] }
          : p
      ));
      setReplyInputs((prev) => ({ ...prev, [postId]: "" }));
      setReplyOpenId(null);
    }
    setReplySubmitting(null);
  };

  const topicFiltered = selectedTopic === "すべて" ? posts : posts.filter((p) => p.topic === selectedTopic);
  const filtered = searchQuery.trim()
    ? topicFiltered.filter((p) => p.body.toLowerCase().includes(searchQuery.toLowerCase()))
    : topicFiltered;

  const getTopicMeta = (topic: Topic) => TOPICS.find((t) => t.id === topic) ?? TOPICS[TOPICS.length - 1];

  return (
    <div className="space-y-4">

      {/* Search result banner */}
      {searchQuery && (
        <div className="px-4 py-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl text-[12px] flex items-center justify-between">
          <span>「{searchQuery}」の検索結果 — {filtered.length}件</span>
          <span className="text-[10px] opacity-60">絞り込み中</span>
        </div>
      )}

      {/* Topic filter tabs */}
      <div className="flex overflow-x-auto scrollbar-none bg-surface-container-lowest rounded-xl shadow-card" style={{ flexWrap: "nowrap" }}>
        <button
          onClick={() => setSelectedTopic("すべて")}
          className={`shrink-0 px-4 py-2.5 h-10 flex items-center text-[12px] font-semibold transition-colors rounded-l-xl whitespace-nowrap ${
            selectedTopic === "すべて" ? "bg-primary text-on-primary" : "text-outline hover:text-on-surface hover:bg-surface-container-low"
          }`}
        >
          すべて
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`shrink-0 px-4 py-2.5 h-10 flex items-center gap-1.5 text-[12px] font-semibold transition-colors whitespace-nowrap last:rounded-r-xl ${
              selectedTopic === t.id ? "bg-primary text-on-primary" : "text-outline hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <TopicIcon topic={t.id} size={12} />
            {t.id}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="space-y-3">
        {loading && (
          <div className="tonal-card p-12 text-center text-outline text-[14px]">読み込み中...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="tonal-card p-12 text-center text-outline text-[14px]">
            {searchQuery ? "該当する投稿が見つかりませんでした" : "まだ投稿がありません"}
          </div>
        )}

        {filtered.map((post, index) => {
          const m = getTopicMeta(post.topic);
          const replyCount = post.replies?.[0]?.count ?? 0;
          const isReplyOpen = replyOpenId === post.id;
          const isNew = newPostIds.has(post.id);

          return (
            <div key={post.id}>
              {index > 0 && index % 8 === 0 && (
                <AdSenseUnit slot="feed-inline" className="overflow-hidden rounded-2xl" />
              )}

              {/* Post card */}
              <article className={`bg-surface-container-lowest rounded-2xl shadow-card transition-all ${isNew ? "ring-2 ring-primary-container" : "hover:shadow-card-hover"}`}>
                <Link href={`/posts/${post.id}`} className="block px-5 pt-5 pb-3">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 mb-3">
                    {/* スマホ: name → topic。PC: topic → name */}
                    <span className="sm:hidden text-[11px] font-semibold text-on-surface-variant shrink-0">{post.name}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${m.color}`}>
                      <TopicIcon topic={post.topic} size={10} />
                      {post.topic}
                    </span>
                    <span className="hidden sm:block text-[11px] font-semibold text-on-surface-variant">{post.name}</span>
                    {isNew && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-bold">NEW</span>
                    )}
                    <span className="text-[11px] text-outline ml-auto">{timeAgo(post.created_at)}</span>
                  </div>

                  {/* Body — supports long text */}
                  <p className="text-[14px] text-on-surface leading-relaxed line-clamp-5 whitespace-pre-line">{post.body}</p>
                </Link>

                {/* Action bar */}
                <div className="flex items-center gap-2 px-5 pb-4">
                  {/* Like */}
                  <button
                    onClick={(e) => toggleLike(post.id, e)}
                    className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-semibold transition-all ${
                      post.liked
                        ? "bg-tertiary-fixed text-tertiary scale-105"
                        : "bg-surface-container text-outline hover:bg-tertiary-fixed hover:text-tertiary"
                    }`}
                  >
                    <span className="text-[13px] leading-none">{post.liked ? "♥" : "♡"}</span>
                    <span>{post.likes}</span>
                  </button>

                  {/* Reply */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setReplyOpenId(isReplyOpen ? null : post.id);
                    }}
                    className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-semibold transition-all ${
                      isReplyOpen
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-container text-outline hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {replyCount > 0 ? replyCount : "返信"}
                  </button>

                  <div className="ml-auto flex items-center gap-1">
                    <SaveButton postId={post.id} />
                    <ShareButtons postId={Number(post.id)} body={post.body} />
                  </div>
                </div>

                {/* Inline reply form */}
                {isReplyOpen && (
                  <div
                    className="px-5 pb-4 pt-3 bg-surface-container-low rounded-b-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={replyNickname}
                      onChange={(e) => {
                        setReplyNickname(e.target.value);
                        if (typeof window !== "undefined") localStorage.setItem(NICKNAME_KEY, e.target.value);
                      }}
                      placeholder="ニックネーム（省略可）"
                      maxLength={20}
                      className="w-full bg-surface-container-lowest text-on-surface placeholder-outline outline-none text-[12px] rounded-xl px-3 py-2 mb-2"
                    />
                    <div className="flex gap-2 items-end">
                      <textarea
                        value={replyInputs[post.id] ?? ""}
                        onChange={(e) => setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="返信を書く..."
                        className="flex-1 bg-surface-container-lowest text-on-surface placeholder-outline resize-none outline-none text-[13px] leading-relaxed rounded-xl p-3 focus:ring-2 focus:ring-primary transition-all"
                        rows={2}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitReply(post.id);
                        }}
                      />
                      <button
                        onClick={() => submitReply(post.id)}
                        disabled={!replyInputs[post.id]?.trim() || replySubmitting === post.id}
                        className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-[12px] font-bold rounded-full transition-all disabled:opacity-30 shrink-0"
                      >
                        {replySubmitting === post.id ? "送信中" : "送信"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-outline">⌘+Enter で送信</span>
                      <Link href={`/posts/${post.id}`} className="text-[10px] text-primary hover:underline">
                        全返信を見る →
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
