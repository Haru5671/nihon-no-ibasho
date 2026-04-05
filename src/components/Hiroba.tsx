"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TOPICS, type Topic } from "@/data/posts";
import ShareButtons from "@/components/ShareButtons";
import AdSenseUnit from "@/components/AdSenseUnit";
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

export default function Hiroba({ defaultTopic }: { defaultTopic?: Topic }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [input, setInput] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | "すべて">(defaultTopic ?? "すべて");
  const [postTopic, setPostTopic] = useState<Topic>("なんでも");
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (defaultTopic) setSelectedTopic(defaultTopic);
  }, [defaultTopic]);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data.map((p: Post) => ({ ...p, liked: false })));
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    const text = input.trim();
    if (!text) return;
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text, topic: postTopic }),
    });
    if (!res.ok) return;
    const newPost: Post = await res.json();
    newPost.liked = false;
    newPost.replies = [{ count: 0 }];
    setPosts((prev) => [newPost, ...prev]);
    setNewPostIds((prev) => new Set(prev).add(newPost.id));
    setInput("");
  };

  useEffect(() => {
    if (newPostIds.size === 0) return;
    const timer = setTimeout(() => setNewPostIds(new Set()), 600);
    return () => clearTimeout(timer);
  }, [newPostIds]);

  const toggleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    if (!post.liked) {
      fetch(`/api/posts/${id}/like`, { method: 'POST' });
    }
    setPosts(posts.map((p) =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const filtered = selectedTopic === "すべて" ? posts : posts.filter((p) => p.topic === selectedTopic);
  const getTopicMeta = (topic: Topic) => TOPICS.find((t) => t.id === topic) ?? TOPICS[TOPICS.length - 1];

  return (
    <div className="max-w-2xl mx-auto">

      {/* Topic filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setSelectedTopic("すべて")}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
            selectedTopic === "すべて"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
          }`}
        >
          すべて
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
              selectedTopic === t.id
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {t.emoji} {t.id}
          </button>
        ))}
      </div>

      {/* Rule */}
      <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-100">
        <span className="text-[11px] font-semibold text-teal-700">唯一のルール</span>
        <span className="text-[13px] font-bold text-teal-900">悪口禁止</span>
        <span className="text-[11px] text-teal-500 ml-auto hidden sm:block">同調と対話の場です</span>
      </div>

      {/* Post form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        {/* Topic select */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setPostTopic(t.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                postTopic === t.id
                  ? `${t.color} font-bold`
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
              }`}
            >
              {t.emoji} {t.id}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="いま感じていることを書いてみる..."
          className="w-full bg-transparent text-gray-700 placeholder-gray-300 resize-none outline-none text-sm leading-relaxed"
          rows={3}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">投稿名: にんげんさん（匿名）</span>
          <button
            onClick={handlePost}
            disabled={!input.trim()}
            className="px-4 py-1.5 text-[13px] font-semibold rounded-lg bg-gray-900 hover:bg-gray-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            投稿する
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">読み込み中...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            まだ投稿がありません。最初に話してみませんか？
          </div>
        )}
        {filtered.map((post, index) => {
          const m = getTopicMeta(post.topic);
          const replyCount = post.replies?.[0]?.count ?? 0;
          return (
            <div key={post.id}>
            {index > 0 && index % 5 === 0 && (
              <AdSenseUnit slot="feed-inline" className="mb-3 rounded-xl overflow-hidden" />
            )}
            <div
              className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${
                newPostIds.has(post.id) ? "border-teal-300 shadow-teal-100" : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-xs font-bold shrink-0">
                  人
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-semibold text-gray-700">{post.name}</span>
                  <span className="text-[11px] text-gray-400 ml-2">{timeAgo(post.created_at)}</span>
                </div>
                <span className={`shrink-0 text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${m.color}`}>
                  {m.emoji} {post.topic}
                </span>
              </div>

              {/* Body */}
              <Link href={`/posts/${post.id}`} className="block px-4 pb-4">
                <p className="text-gray-700 text-[14px] leading-relaxed">{post.body}</p>
              </Link>

              {/* Footer */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-100">
                <button
                  onClick={(e) => toggleLike(post.id, e)}
                  className={`flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-md transition-colors ${
                    post.liked ? "text-rose-500 bg-rose-50" : "text-gray-400 hover:text-rose-400 hover:bg-rose-50"
                  }`}
                >
                  <span>{post.liked ? "♥" : "♡"}</span>
                  <span>{post.likes}</span>
                </button>

                {replyCount > 0 && (
                  <Link
                    href={`/posts/${post.id}`}
                    className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-teal-600 px-2 py-1 rounded-md hover:bg-teal-50 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {replyCount}
                  </Link>
                )}

                <div className="ml-auto flex items-center gap-0.5">
                  <ShareButtons postId={Number(post.id)} body={post.body} />
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
