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
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-[12px] font-bold text-gray-700">関連ニュース</span>
        <span className="text-[10px] text-teal-600 font-medium">AI失業・再就職</span>
      </div>
      {loading && (
        <div className="px-3 py-4 text-[11px] text-gray-400">読み込み中...</div>
      )}
      {!loading && items.length === 0 && (
        <div className="px-3 py-4 text-[11px] text-gray-400">ニュースを取得できませんでした</div>
      )}
      <div className="divide-y divide-gray-100">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 hover:bg-gray-50 transition-colors group"
          >
            <p className="text-[12px] text-gray-800 leading-snug line-clamp-2 group-hover:text-teal-700 mb-1">
              {item.title}
            </p>
            <div className="flex items-center gap-2">
              {item.source && (
                <span className="text-[10px] text-gray-400">{item.source}</span>
              )}
              {item.pubDate && (
                <span className="text-[10px] text-gray-300">{timeAgoFromRSS(item.pubDate)}</span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
