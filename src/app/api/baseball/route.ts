import { NextResponse } from 'next/server';

interface GameScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

let cache: { data: GameScore[]; ts: number; date: string } | null = null;
const CACHE_MS = 3 * 60 * 1000;

function getJSTDateString(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jst.getUTCDate()).padStart(2, '0');
  return `${y}/${m}${d}`;
}

function parseScore(scoreStr: string): [number | null, number | null] {
  const s = (scoreStr ?? '').trim();
  // '-' or '*-*' means no score yet
  if (!s || s === '-' || s.includes('*')) return [null, null];
  const parts = s.split('-');
  if (parts.length !== 2) return [null, null];
  const a = parseInt(parts[0], 10);
  const b = parseInt(parts[1], 10);
  return [isNaN(a) ? null : a, isNaN(b) ? null : b];
}

function extractStatus(stateText: string, scoreStr: string): string {
  const s = stateText.replace(/\s+/g, ' ').trim();

  if (s.includes('中止')) return '中止';
  if (s.includes('試合終了') || (scoreStr !== '-' && !scoreStr.includes('*') && scoreStr.includes('-'))) {
    // Check if score has actual numbers
    const [a, b] = parseScore(scoreStr);
    if (a !== null && b !== null) return '終了';
  }
  if (s.includes('試合中') || /[0-9]+回/.test(s)) {
    const inn = s.match(/([0-9]+回[表裏])/)?.[1];
    return inn ?? '試合中';
  }
  // Extract scheduled time HH:MM
  const timeMatch = s.match(/(\d{1,2}:\d{2})/);
  if (timeMatch) return timeMatch[1];

  return '予定';
}

export async function GET() {
  const today = getJSTDateString();

  if (cache && Date.now() - cache.ts < CACHE_MS && cache.date === today) {
    return NextResponse.json(cache.data);
  }

  try {
    const url = `https://npb.jp/scores/${today}/`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ibasho-bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      cache: 'no-store',
    });

    // npb.jp may return 403 from server IPs, but still serves HTML with score data in header
    const html = await res.text();
    if (html.length < 1000) throw new Error(`npb.jp empty response ${res.status}`);

    const gameRegex = /<a href="\/scores\/\d+\/\d+\/[^"]+\/">\s*<div>([\s\S]*?)<\/div>\s*<\/a>/g;
    const games: GameScore[] = [];

    let match;
    while ((match = gameRegex.exec(html)) !== null) {
      const block = match[1];

      const leftAlt = block.match(/alt="([^"]+)"[^>]*class="logo_left"/)
        ?.[1] ?? block.match(/class="logo_left"[^>]*alt="([^"]+)"/)
        ?.[1];
      const rightAlt = block.match(/alt="([^"]+)"[^>]*class="logo_right"/)
        ?.[1] ?? block.match(/class="logo_right"[^>]*alt="([^"]+)"/)
        ?.[1];
      const scoreText = block.match(/class="score">([^<]+)<\/div>/)?.[1]?.trim() ?? '';
      const stateRaw = block.match(/class="state">([\s\S]*?)<\/div>/)?.[1] ?? '';
      const stateText = stateRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      if (!leftAlt || !rightAlt) continue;

      const statusLabel = extractStatus(stateText, scoreText);
      if (statusLabel === '中止') continue;

      const [leftScore, rightScore] = parseScore(scoreText);

      // npb.jp: logo_left = away, logo_right = home
      games.push({
        awayTeam: leftAlt,
        homeTeam: rightAlt,
        awayScore: leftScore,
        homeScore: rightScore,
        status: statusLabel,
      });
    }

    cache = { data: games, ts: Date.now(), date: today };
    return NextResponse.json(games);
  } catch {
    return NextResponse.json([]);
  }
}
