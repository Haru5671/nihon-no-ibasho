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
  '読売ジャイアンツ': '巨人',
  '東京ヤクルトスワローズ': 'ヤクルト',
  '横浜DeNAベイスターズ': 'DeNA',
  '中日ドラゴンズ': '中日',
  '阪神タイガース': '阪神',
  '広島東洋カープ': '広島',
  '福岡ソフトバンクホークス': 'SB',
  '東北楽天ゴールデンイーグルス': '楽天',
  '千葉ロッテマリーンズ': 'ロッテ',
  'オリックス・バファローズ': 'Orix',
  '北海道日本ハムファイターズ': '日ハム',
  '埼玉西武ライオンズ': '西武',
};

function short(name: string) {
  return TEAM_SHORT[name] ?? name.slice(0, 4);
}

export default function BaseballWidget({ compact }: { compact?: boolean }) {
  const [games, setGames] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/baseball')
      .then(r => r.json())
      .then(setGames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (compact) {
    const g = games[0];
    return (
      <a
        href="https://npb.jp/scores/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-container-low transition-colors"
      >
        <span className="text-[12px]">⚾</span>
        {loading && <span className="text-[10px] text-outline">--</span>}
        {!loading && !g && <span className="text-[10px] text-outline">試合なし</span>}
        {g && (
          <>
            <span className="text-[11px] font-medium text-on-surface whitespace-nowrap">
              {short(g.awayTeam)} {g.awayScore ?? '-'} - {g.homeScore ?? '-'} {short(g.homeTeam)}
            </span>
            <span className="text-[9px] text-outline ml-auto">↗</span>
          </>
        )}
      </a>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
      <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between">
        <a
          href="https://npb.jp/scores/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-bold text-primary font-headline hover:text-primary/80 transition-colors"
        >
          ⚾ プロ野球 ↗
        </a>
        <span className="text-[10px] text-outline">NPB</span>
      </div>
      {loading && <div className="px-4 py-3 text-[12px] text-outline">読み込み中...</div>}
      {!loading && games.length === 0 && (
        <div className="px-4 py-3 text-[12px] text-outline">本日の試合はありません</div>
      )}
      <div>
        {games.map((g, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center gap-2 text-[12px]">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
              g.status === "終了" ? "bg-surface-container text-outline" :
              g.status.includes("回") ? "bg-primary/10 text-primary" :
              "bg-secondary-fixed text-on-secondary-fixed"
            }`}>{g.status}</span>
            <span className="text-on-surface font-medium shrink-0">{short(g.awayTeam)}</span>
            <span className="font-bold text-on-surface">{g.awayScore !== null ? g.awayScore : "-"}</span>
            <span className="text-outline text-[10px]">-</span>
            <span className="font-bold text-on-surface">{g.homeScore !== null ? g.homeScore : "-"}</span>
            <span className="text-on-surface font-medium shrink-0">{short(g.homeTeam)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
