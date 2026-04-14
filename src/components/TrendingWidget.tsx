'use client';

interface Props { compact?: boolean; }

const KEYWORDS = [
  'AI失業',
  '失業手当 申請方法',
  '再就職 コツ',
  'クビになった 次',
  '有休消化 交渉',
  'AIに仕事奪われた',
  '失業 相談窓口',
  '退職代行',
  'ハローワーク 失業給付',
  '転職 40代',
];

export default function TrendingWidget({ compact }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 overflow-hidden">
        <span className="shrink-0 text-[10px] font-bold text-on-surface-variant whitespace-nowrap flex items-center gap-1">
          🔥 話題
        </span>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {KEYWORDS.map((kw, i) => (
            <a
              key={i}
              href={`https://www.google.co.jp/search?q=${encodeURIComponent(kw)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-0.5 text-[10px] text-primary bg-primary/8 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors hover:bg-primary/15"
            >
              <span className="opacity-60">#</span>{kw}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
      <div className="px-4 py-3 bg-surface-container-low flex items-center gap-2">
        <span className="text-[12px] font-bold text-primary font-headline">🔥 話題のキーワード</span>
      </div>
      <div className="px-3 py-2 flex flex-wrap gap-1.5">
        {KEYWORDS.map((kw, i) => (
          <a
            key={i}
            href={`https://www.google.co.jp/search?q=${encodeURIComponent(kw)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] text-primary bg-primary/8 hover:bg-primary/15 px-2 py-0.5 rounded-full transition-colors"
          >
            <span className="opacity-60 text-[9px]">#</span>
            {kw}
          </a>
        ))}
      </div>
    </div>
  );
}
