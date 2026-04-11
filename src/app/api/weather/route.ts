import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') ?? '35.6762';
    const lon = searchParams.get('lon') ?? '139.6503';

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FTokyo`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    return NextResponse.json(data.current ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
