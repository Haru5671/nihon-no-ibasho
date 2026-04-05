import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkModeration } from '@/lib/moderate';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const { data, error } = await db()
    .from('posts')
    .select('*, replies(count)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { body, topic } = await req.json();
  if (!body?.trim() || !topic) {
    return NextResponse.json({ error: 'body and topic are required' }, { status: 400 });
  }

  const mod = checkModeration(body.trim());
  if (!mod.ok) {
    return NextResponse.json({ error: mod.reason }, { status: 422 });
  }

  const { data, error } = await db()
    .from('posts')
    .insert({ name: 'にんげんさん', body: body.trim(), topic })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
