import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FTokyo',
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return NextResponse.json(data.current ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
