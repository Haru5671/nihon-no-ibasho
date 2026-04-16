import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AI_POSTS } from '@/data/aiPosts';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all bodies already posted to avoid duplicates
  const { data: existing } = await db
    .from('posts')
    .select('body');
  const postedBodies = new Set((existing ?? []).map((r: { body: string }) => r.body));

  const candidates = AI_POSTS.filter(p => !postedBodies.has(p.body));
  if (candidates.length === 0) {
    return NextResponse.json({ ok: false, message: 'All posts already used' });
  }

  const post = pick(candidates);

  const { error } = await db
    .from('posts')
    .insert({ name: 'にんげんさん', body: post.body, topic: post.topic, likes: 0 });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, topic: post.topic });
}
