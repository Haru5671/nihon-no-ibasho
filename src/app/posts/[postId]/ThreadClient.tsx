"use client";

import { useState, useEffect } from "react";
import ShareButtons from "@/components/ShareButtons";
import { timeAgo } from "@/lib/utils";

interface Reply {
  id: string;
  name: string;
  body: string;
  created_at: string;
}

interface ThreadClientProps {
  postId: string;
  body: string;
}

const NICKNAME_KEY = "ibasho_nickname";

export default function ThreadClient({ postId, body }: ThreadClientProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyInput, setReplyInput] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(NICKNAME_KEY) ?? "" : "";
    setNickname(saved);
  }, []);

  useEffect(() => {
    fetch(`/api/posts/${postId}/replies`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReplies(data); })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleReply = async () => {
    const text = replyInput.trim();
    if (!text) return;
    setReplyError(null);
    const res = await fetch(`/api/posts/${postId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text, name: nickname.trim() || "にんげんさん" }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setReplyError(json.error ?? '返信に失敗しました。');
      return;
    }
    const newReply: Reply = await res.json();
    setReplies((prev) => [...prev, newReply]);
    setReplyInput("");
  };

  return (
    <>
      {/* Share */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <ShareButtons postId={Number(postId)} body={body} />
      </div>

      {/* Replies */}
      {!loading && replies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[12px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            返信 {replies.length}件
          </h3>
          <div className="space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className="bg-white rounded-xl p-4 border border-gray-200 ml-4 border-l-2 border-l-teal-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold shrink-0">
                    {reply.name[0]}
                  </div>
                  <span className="text-[12px] text-gray-600 font-semibold">{reply.name}</span>
                  <span className="text-[10px] text-gray-400">{timeAgo(reply.created_at)}</span>
                </div>
                <p className="text-gray-600 text-[13px] leading-relaxed ml-8">{reply.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm mb-6">読み込み中...</div>
      )}

      {/* Reply form */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <input
          type="text"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (typeof window !== "undefined") localStorage.setItem(NICKNAME_KEY, e.target.value);
          }}
          placeholder="ニックネーム（省略可 → にんげんさん）"
          maxLength={20}
          className="w-full bg-gray-50 text-gray-700 placeholder-gray-300 outline-none text-[12px] rounded-lg px-3 py-2 mb-3"
        />
        <textarea
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
          placeholder="返信を書く..."
          className="w-full bg-transparent text-gray-700 placeholder-gray-300 resize-none outline-none text-[13px] leading-relaxed"
          rows={3}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply(); }}
        />
        {replyError && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-600">
            {replyError}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">⌘+Enter で送信</span>
          <button
            onClick={handleReply}
            disabled={!replyInput.trim()}
            className="px-4 py-1.5 text-[13px] font-semibold rounded-lg bg-gray-900 hover:bg-gray-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            返信する
          </button>
        </div>
      </div>
    </>
  );
}
