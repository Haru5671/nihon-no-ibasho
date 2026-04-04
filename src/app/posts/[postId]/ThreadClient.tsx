"use client";

import { useState } from "react";
import type { Reply } from "@/data/posts";
import ShareButtons from "@/components/ShareButtons";

interface ThreadClientProps {
  postId: number;
  body: string;
  initialReplies: Reply[];
}

export default function ThreadClient({ postId, body, initialReplies }: ThreadClientProps) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies);
  const [replyInput, setReplyInput] = useState("");
  const [nextReplyId, setNextReplyId] = useState(
    Math.max(...initialReplies.map((r) => r.id), postId * 100) + 1
  );

  const handleReply = () => {
    const text = replyInput.trim();
    if (!text) return;
    const newReply: Reply = { id: nextReplyId, name: "にんげんさん", body: text, time: "たった今" };
    setReplies((prev) => [...prev, newReply]);
    setNextReplyId(nextReplyId + 1);
    setReplyInput("");
  };

  return (
    <>
      {/* Share */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <ShareButtons postId={postId} body={body} />
      </div>

      {/* Replies */}
      {replies.length > 0 && (
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
                  <span className="text-[10px] text-gray-400">{reply.time}</span>
                </div>
                <p className="text-gray-600 text-[13px] leading-relaxed ml-8">{reply.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply form */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <textarea
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
          placeholder="返信を書く..."
          className="w-full bg-transparent text-gray-700 placeholder-gray-300 resize-none outline-none text-[13px] leading-relaxed"
          rows={3}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply(); }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">投稿名: にんげんさん</span>
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
