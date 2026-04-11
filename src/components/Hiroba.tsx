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

export default function Hiroba({ defaultTopic, searchQuery = "" }: { defaultTopic?: Topic; searchQuery?: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [input, setInput] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | "すべて">(defaultTopic ?? "すべて");
  const [postTopic, setPostTopic] = useState<Topic>("なんでも");
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);

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
    setFocused(false);
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

  const submitReply = async (postId: string) => {
    const text = (replyInputs[postId] ?? '').trim();
    if (!text) return;
    setReplySubmitting(postId);
    const res = await fetch(`/api/posts/${postId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    });
    if (res.ok) {
      setPosts(posts.map((p) =>
        p.id === postId
          ? { ...p, replies: [{ count: (p.replies?.[0]?.count ?? 0) + 1 }] }
          : p
      ));
      setReplyInputs((prev) => ({ ...prev, [postId]: '' }));
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
    <div>

      {/* Post form */}
      <div className={`bg-white border-2 rounded-lg mb-4 p-4 shadow-sm transition-all ${focused ? 'border-teal-400 shadow-md' : 'border-gray-200 hover:border-teal-300'}`}>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[13px] font-bold text-gray-700">いま感じていることを話してみる</span>
          <span className="text-[11px] text-gray-400 ml-auto">匿名・登録不要</span>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setPostTopic(t.id); setFocused(true); }}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                postTopic === t.id ? `${t.color} font-bold` : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
              }`}
            >
              <TopicIcon topic={t.id} size={11} />
              {t.id}
            </button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="AIに仕事を奪われた、失業手当がわからない、クビになった、誰にも話せない気持ち…なんでも書いてみてください。"
          className="w-full bg-gray-50 text-gray-700 placeholder-gray-400 resize-none outline-none text-[13px] leading-relaxed rounded p-2.5 border border-gray-200 focus:border-teal-300 focus:bg-white transition-colors"
          rows={focused ? 4 : 2}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
        />
        {postError && (
          <div className="mt-2 px-2 py-1.5 rounded bg-red-50 border border-red-200 text-[11px] text-red-600">{postError}</div>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-gray-400">Cmd+Enter で投稿</span>
          <button
            onClick={handlePost}
            disabled={!input.trim()}
            className="px-5 py-2 text-[13px] font-bold rounded-full bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            投稿する
          </button>
        </div>
      </div>

      {/* Search result banner */}
      {searchQuery && (
        <div className="mb-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded text-[12px] text-teal-700 flex items-center justify-between">
          <span>「{searchQuery}」の検索結果 — {filtered.length}件</span>
          <span className="text-teal-500 text-[10px]">絞り込み中</span>
        </div>
      )}

      {/* Topic filter tabs */}
      <div className="flex overflow-x-auto mb-2 bg-white border border-gray-200 rounded" style={{ scrollbarWidth: 'none', flexWrap: 'nowrap' }}>
        <button
          onClick={() => setSelectedTopic("すべて")}
          className={`shrink-0 px-3 py-2 h-9 flex items-center text-[12px] font-semibold border-r border-gray-100 transition-colors whitespace-nowrap ${
            selectedTopic === "すべて" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          すべて
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`shrink-0 px-3 py-2 h-9 flex items-center gap-1 text-[12px] font-semibold border-r border-gray-100 transition-colors whitespace-nowrap ${
              selectedTopic === t.id ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <TopicIcon topic={t.id} size={12} />
            {t.id}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        {loading && (
          <div className="text-center py-10 text-gray-400 text-[13px]">読み込み中...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-[13px]">
            {searchQuery ? '該当する投稿が見つかりませんでした' : 'まだ投稿がありません'}
          </div>
        )}
        {filtered.map((post, index) => {
          const m = getTopicMeta(post.topic);
          const replyCount = post.replies?.[0]?.count ?? 0;
          const isReplyOpen = replyOpenId === post.id;
          return (
            <div key={post.id}>
              {index > 0 && index % 8 === 0 && (
                <div className="border-t border-gray-100">
                  <AdSenseUnit slot="feed-inline" className="overflow-hidden" />
                </div>
              )}
              <div className={`border-b border-gray-100 last:border-b-0 transition-colors ${newPostIds.has(post.id) ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                <Link href={`/posts/${post.id}`} className="block px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border flex items-center gap-1 ${m.color}`}>
                      <TopicIcon topic={post.topic} size={10} />
                      {post.topic}
                    </span>
                    {newPostIds.has(post.id) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-bold">NEW</span>
                    )}
                    <span className="text-[11px] text-gray-400 ml-auto">{timeAgo(post.created_at)}</span>
                  </div>
                  <p className="text-[13px] text-gray-800 leading-relaxed line-clamp-2">{post.body}</p>
                </Link>

                {/* Action row */}
                <div className="flex items-center gap-2 px-4 pb-2">
                  {/* Like button — prominent */}
                  <button
                    onClick={(e) => toggleLike(post.id, e)}
                    className={`flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full font-semibold border transition-all ${
                      post.liked
                        ? "text-rose-500 bg-rose-50 border-rose-200 scale-105"
                        : "text-gray-400 bg-gray-50 border-gray-200 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                    }`}
                  >
                    <span className="text-[14px] leading-none">{post.liked ? "♥" : "♡"}</span>
                    <span>{post.likes}</span>
                  </button>

                  {/* Reply button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setReplyOpenId(isReplyOpen ? null : post.id);
                    }}
                    className={`flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full font-semibold border transition-all ${
                      isReplyOpen
                        ? "text-teal-600 bg-teal-50 border-teal-200"
                        : "text-gray-400 bg-gray-50 border-gray-200 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {replyCount > 0 ? replyCount : '返信'}
                  </button>

                  <div className="ml-auto flex items-center gap-1">
                    <SaveButton postId={post.id} />
                    <ShareButtons postId={Number(post.id)} body={post.body} />
                  </div>
                </div>

                {/* Inline reply form */}
                {isReplyOpen && (
                  <div className="px-4 pb-3 border-t border-gray-100 pt-3 bg-gray-50" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 items-end">
                      <textarea
                        value={replyInputs[post.id] ?? ''}
                        onChange={(e) => setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="返信を書く..."
                        className="flex-1 bg-white text-gray-700 placeholder-gray-400 resize-none outline-none text-[13px] leading-relaxed rounded p-2 border border-gray-200 focus:border-teal-300 transition-colors"
                        rows={2}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitReply(post.id);
                        }}
                      />
                      <button
                        onClick={() => submitReply(post.id)}
                        disabled={!replyInputs[post.id]?.trim() || replySubmitting === post.id}
                        className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-bold rounded-lg transition-colors disabled:opacity-30 shrink-0"
                      >
                        {replySubmitting === post.id ? '送信中' : '送信'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-gray-400">Cmd+Enter で送信</span>
                      <Link href={`/posts/${post.id}`} className="text-[10px] text-teal-500 hover:underline">
                        全返信を見る →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
