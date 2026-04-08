"use client";

import { TOPICS, type Topic } from "@/data/posts";

interface HeroProps {
  onTopicSelect?: (topic: Topic) => void;
}

export default function Hero({ onTopicSelect }: HeroProps) {
  return (
    <section className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Description */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-700 font-semibold mb-0.5">
              AIのせいで仕事を失った・失業手当がわからない・誰にも相談できない——
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              AI失業・再就職・クビ・有休消化・失業どうすれば。匿名・登録不要で話せるコミュニティです。
            </p>
          </div>

          {/* Topic quick select */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {TOPICS.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={() => onTopicSelect?.(t.id)}
                className="px-2.5 py-1 rounded text-[11px] font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
              >
                {t.emoji} {t.id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
