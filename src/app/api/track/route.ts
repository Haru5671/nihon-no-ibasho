import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export async function POST(req: Request) {
  try {
    const { path, referrer, ua } = await req.json();

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';
    // 専用ソルトでIPをハッシュ化（autopost認可トークンの流用をやめる）。未設定なら保存しない
    const salt = process.env.IP_HASH_SALT ?? process.env.CRON_SECRET;
    const ipHash = salt
      ? createHash('sha256').update(ip + salt).digest('hex').slice(0, 16)
      : null;

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await db.from('page_views').insert({
      path: path ?? '/',
      ip_hash: ipHash,
      referrer: referrer ?? null,
      ua: ua ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
