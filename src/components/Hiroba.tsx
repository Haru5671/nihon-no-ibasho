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
  const [postError, setPostError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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
    setPostError(null);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text, topic: postTopic }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setPostError(json.error ?? '投稿に失敗しました。');
      return;
    }
    const newPost: Post = await res.json();
    newPost.liked = false;
    newPost.replies = [{ count: 0 }];
    setPosts((prev) => [newPost, ...prev]);
    setNewPostIds((prev) => new Set(prev).add(newPost.id));
    setInput("");
    setFormOpen(false);
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
    <div>

      {/* Post trigger button */}
      {!formOpen && (
        <button
          onClick={() => setFormOpen(true)}
          className="w-full text-left bg-white border border-gray-200 rounded px-3 py-2.5 mb-3 text-[13px] text-gray-400 hover:border-teal-400 transition-colors"
        >
          💬 いま感じていることを書いてみる...
        </button>
      )}

      {/* Post form */}
      {formOpen && (
        <div className="bg-white border border-teal-300 rounded mb-3 p-3 shadow-sm">
          <div className="flex gap-1.5 flex-wrap mb-2">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setPostTopic(t.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
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
            className="w-full bg-transparent text-gray-700 placeholder-gray-300 resize-none outline-none text-[13px] leading-relaxed"
            rows={3}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
          />
          {postError && (
            <div className="mt-1 px-2 py-1.5 rounded bg-red-50 border border-red-200 text-[11px] text-red-600">{postError}</div>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">匿名投稿</span>
            <div className="flex gap-2">
              <button onClick={() => setFormOpen(false)} className="px-3 py-1 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">キャンセル</button>
              <button
                onClick={handlePost}
                disabled={!input.trim()}
                className="px-3 py-1 text-[12px] font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                投稿する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic filter tabs */}
      <div className="flex gap-0 overflow-x-auto mb-2 bg-white border border-gray-200 rounded" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedTopic("すべて")}
          className={`shrink-0 px-3 py-2 text-[12px] font-semibold border-r border-gray-100 transition-colors ${
            selectedTopic === "すべて" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          すべて
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`shrink-0 px-3 py-2 text-[12px] font-semibold border-r border-gray-100 transition-colors whitespace-nowrap ${
              selectedTopic === t.id ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.emoji} {t.id}
          </button>
        ))}
      </div>

      {/* News-style post list */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        {loading && (
          <div className="text-center py-10 text-gray-400 text-[13px]">読み込み中...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-[13px]">まだ投稿がありません</div>
        )}
        {filtered.map((post, index) => {
          const m = getTopicMeta(post.topic);
          const replyCount = post.replies?.[0]?.count ?? 0;
          return (
            <div key={post.id}>
              {index > 0 && index % 8 === 0 && (
                <div className="border-t border-gray-100">
                  <AdSenseUnit slot="feed-inline" className="overflow-hidden" />
                </div>
              )}
              <div className={`border-b border-gray-100 last:border-b-0 transition-colors ${newPostIds.has(post.id) ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                <Link href={`/posts/${post.id}`} className="block px-4 py-3">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${m.color}`}>
                      {m.emoji} {post.topic}
                    </span>
                    {newPostIds.has(post.id) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-bold">NEW</span>
                    )}
                    <span className="text-[11px] text-gray-400 ml-auto">{timeAgo(post.created_at)}</span>
                  </div>
                  {/* Body */}
                  <p className="text-[13px] text-gray-800 leading-relaxed line-clamp-2">{post.body}</p>
                </Link>
                {/* Action row */}
                <div className="flex items-center gap-1 px-4 pb-2">
                  <button
                    onClick={(e) => toggleLike(post.id, e)}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors ${
                      post.liked ? "text-rose-500 bg-rose-50" : "text-gray-400 hover:text-rose-400 hover:bg-rose-50"
                    }`}
                  >
                    <span>{post.liked ? "♥" : "♡"}</span>
                    <span>{post.likes}</span>
                  </button>
                  {replyCount > 0 && (
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-teal-600 px-2 py-0.5 rounded hover:bg-teal-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {replyCount}
                    </Link>
                  )}
                  <div className="ml-auto">
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
