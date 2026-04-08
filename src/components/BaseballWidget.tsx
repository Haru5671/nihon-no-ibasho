'use client';
import { useEffect, useState } from 'react';

interface GameScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

const TEAM_SHORT: Record<string, string> = {
  'Yomiuri Giants': '巨人',
  'Hanshin Tigers': '阪神',
  'Hiroshima Toyo Carp': '広島',
  'Yokohama DeNA BayStars': 'DeNA',
  'Tokyo Yakult Swallows': 'ヤクルト',
  'Chunichi Dragons': '中日',
  'Fukuoka SoftBank Hawks': 'SB',
  'Tohoku Rakuten Golden Eagles': '楽天',
  'Chiba Lotte Marines': 'ロッテ',
  'Orix Buffaloes': 'Orix',
  'Hokkaido Nippon-Ham Fighters': '日ハム',
  'Saitama Seibu Lions': '西武',
};

function short(name: string) {
  return TEAM_SHORT[name] ?? name.slice(0, 4);
}

export default function BaseballWidget() {
  const [games, setGames] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/baseball')
      .then(r => r.json())
      .then(setGames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-[12px] font-bold text-gray-700">⚾ プロ野球</span>
        <span className="text-[10px] text-gray-400">NPB</span>
      </div>
      {loading && <div className="px-3 py-3 text-[11px] text-gray-400">読み込み中...</div>}
      {!loading && games.length === 0 && (
        <div className="px-3 py-3 text-[11px] text-gray-400">本日の試合はありません</div>
      )}
      <div className="divide-y divide-gray-100">
        {games.map((g, i) => (
          <div key={i} className="px-3 py-2 flex items-center gap-2 text-[12px]">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
              g.status === '終了' ? 'bg-gray-100 text-gray-500' :
              g.status.includes('回') ? 'bg-green-100 text-green-700' :
              'bg-blue-50 text-blue-600'
            }`}>{g.status}</span>
            <span className="text-gray-700 font-medium shrink-0">{short(g.awayTeam)}</span>
            <span className="font-bold text-gray-900">
              {g.awayScore !== null ? g.awayScore : '-'}
            </span>
            <span className="text-gray-400 text-[10px]">-</span>
            <span className="font-bold text-gray-900">
              {g.homeScore !== null ? g.homeScore : '-'}
            </span>
            <span className="text-gray-700 font-medium shrink-0">{short(g.homeTeam)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
