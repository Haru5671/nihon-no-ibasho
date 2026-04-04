"use client";

import { TOPICS, type Topic } from "@/data/posts";

interface HeroProps {
  onTopicSelect?: (topic: Topic) => void;
}

export default function Hero({ onTopicSelect }: HeroProps) {
  return (
    <section className="bg-white border-b border-gray-100 px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">

        <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-5 block">
          NIHON NO IBASHO
        </span>

        <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-snug mb-4">
          AI時代に、<span className="text-teal-600">人間が人間の存在意味</span>を支え合う場所。
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          家族や知人には話しづらいことを、匿名でオープンに話せる場所です。
          登録不要・完全無料。
        </p>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTopicSelect?.(t.id)}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium border border-gray-200 bg-white text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            >
              {t.emoji} {t.id}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-gray-400">
          唯一のルール：<span className="font-semibold text-gray-600">悪口禁止</span>
        </p>
      </div>
    </section>
  );
}
