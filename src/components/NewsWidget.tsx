'use client';
import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

function timeAgoFromRSS(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    return `${Math.floor(diff / 86400)}日前`;
  } catch {
    return '';
  }
}

export default function NewsWidget() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 bg-surface-container-low flex items-center justify-between">
        <span className="text-xs font-bold text-primary font-headline">関連ニュース</span>
        <span className="text-[11px] text-on-surface-variant font-medium">AI失業・再就職</span>
      </div>
      {loading && (
        <div className="px-5 py-4 text-xs text-on-surface-variant">読み込み中...</div>
      )}
      {!loading && items.length === 0 && (
        <div className="px-5 py-4 text-xs text-on-surface-variant">ニュースを取得できませんでした</div>
      )}
      <div className="divide-y divide-outline-variant/15">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-5 py-3 hover:bg-surface-container-low transition-colors group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          >
            <p className="text-[13px] text-on-surface leading-snug line-clamp-2 group-hover:text-primary mb-1">
              {item.title}
            </p>
            <div className="flex items-center gap-2">
              {item.source && (
                <span className="text-[11px] text-on-surface-variant">{item.source}</span>
              )}
              {item.pubDate && (
                <span className="text-[11px] text-outline">{timeAgoFromRSS(item.pubDate)}</span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
