import { NextResponse } from 'next/server';

interface GameScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  inning?: string;
}

let cache: { data: GameScore[]; ts: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

function getJSTDateString(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }
  try {
    const date = getJSTDateString();
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=16&date=${date}&hydrate=linescore,team`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const json = await res.json();

    const games: GameScore[] = [];
    for (const dateEntry of json.dates ?? []) {
      for (const game of dateEntry.games ?? []) {
        const home = game.teams?.home;
        const away = game.teams?.away;
        const status = game.status?.abstractGameState ?? '';
        const detailed = game.status?.detailedState ?? '';
        const linescore = game.linescore;

        let statusLabel = '';
        if (status === 'Final' || detailed === 'Final') statusLabel = '終了';
        else if (status === 'Live') {
          const inn = linescore?.currentInning ?? '';
          const half = linescore?.inningHalf === 'Top' ? '表' : '裏';
          statusLabel = `${inn}回${half}`;
        } else statusLabel = '予定';

        games.push({
          homeTeam: home?.team?.name ?? '',
          awayTeam: away?.team?.name ?? '',
          homeScore: home?.score ?? null,
          awayScore: away?.score ?? null,
          status: statusLabel,
          inning: statusLabel,
        });
      }
    }

    cache = { data: games, ts: Date.now() };
    return NextResponse.json(games);
  } catch {
    return NextResponse.json([]);
  }
}
