"use client";

import type { Topic } from "@/data/posts";
import PostForm from "@/components/PostForm";

interface HeroProps {
  onTopicSelect?: (topic: Topic) => void;
  onPosted?: () => void;
}

export default function Hero({ onPosted }: HeroProps) {
  return (
    <section className="editorial-gradient relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none select-none">
        <svg className="w-full h-full translate-x-1/4" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.2,-69.3,70,-58.5,78.2,-45.5C86.4,-32.5,91,-17.3,89.6,-2.4C88.2,12.5,80.8,27.1,71.4,39.6C62,52.1,50.6,62.5,37.3,70.1C24,77.7,8.7,82.5,-6.3,81.4C-21.3,80.3,-36.1,73.3,-48.8,63.6C-61.5,53.8,-72.1,41.4,-77.8,27.1C-83.5,12.8,-84.3,-3.3,-80.6,-18.2C-76.9,-33.1,-68.8,-46.8,-57.4,-54.6C-46,-62.4,-31.3,-64.3,-17.8,-71.4C-4.3,-78.5,8,-90.7,21.3,-91.1C34.6,-91.5,48.9,-80.1,58.3,-71.7" fill="#ffffff" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/60 mb-2 font-label">
            匿名・登録不要・無料
          </p>

          {/* Headline */}
          <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-[1.3] mb-2">
            AIのせいで仕事が狂った、誰にも相談できない、ネットの悪口が怖い
          </h1>

          {/* Sub */}
          <p className="text-[12px] text-white/80 leading-relaxed mb-4 font-body">
            AI失業・再就職・家族に言えない・相談先がない・炎上が怖い<br />
            話せる場所がここにあります。
          </p>

          {/* Post form — inside hero */}
          <div className="bg-white/12 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <p className="text-[12px] font-semibold text-white/80 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              いま感じていることを話してみる
            </p>
            <PostForm dark onPosted={onPosted} />
          </div>
        </div>
      </div>
    </section>
  );
}
