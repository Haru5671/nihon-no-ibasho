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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, name: nickname.trim() || "にんげんさん" }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setReplyError(json.error ?? "返信に失敗しました。");
      return;
    }
    const newReply: Reply = await res.json();
    setReplies((prev) => [...prev, newReply]);
    setReplyInput("");
  };

  return (
    <>
      {/* Share */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
        <ShareButtons postId={postId} body={body} />
      </div>

      {/* Replies */}
      {!loading && replies.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wide">
            返信 {replies.length}件
          </h2>
          <div className="space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-card ml-4 border-l-2 border-l-primary/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {reply.name?.[0] ?? "に"}
                  </div>
                  <span className="text-sm text-on-surface font-semibold">{reply.name}</span>
                  <span className="text-xs text-on-surface-variant">{timeAgo(reply.created_at)}</span>
                </div>
                <p className="text-on-surface text-[15px] leading-loose ml-9">{reply.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {loading && (
        <div className="text-center py-8 text-on-surface-variant text-sm mb-6">読み込み中...</div>
      )}

      {/* Reply form */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-card">
        <label htmlFor="reply-nickname" className="sr-only">ニックネーム</label>
        <input
          id="reply-nickname"
          type="text"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (typeof window !== "undefined") localStorage.setItem(NICKNAME_KEY, e.target.value);
          }}
          placeholder="ニックネーム（省略可 → にんげんさん）"
          maxLength={20}
          className="w-full bg-surface-container text-on-surface placeholder-outline outline-none text-sm rounded-xl px-3 py-2.5 mb-3 focus-visible:ring-2 focus-visible:ring-primary transition-all"
        />
        <label htmlFor="reply-body" className="sr-only">返信内容</label>
        <textarea
          id="reply-body"
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
          placeholder="返信を書く..."
          className="w-full bg-surface-container text-on-surface placeholder-outline resize-y outline-none text-[15px] leading-loose rounded-xl p-3 focus-visible:ring-2 focus-visible:ring-primary transition-all"
          rows={3}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply(); }}
        />
        {replyError && (
          <div role="alert" className="mt-2 px-3 py-2 rounded-lg bg-error-container text-on-error-container text-sm">
            {replyError}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/30">
          <span className="text-xs text-on-surface-variant">⌘+Enter で送信</span>
          <button
            onClick={handleReply}
            disabled={!replyInput.trim()}
            className="px-5 min-h-[44px] text-sm font-bold rounded-full bg-primary hover:bg-primary/90 text-on-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            返信する
          </button>
        </div>
      </div>
    </>
  );
}
