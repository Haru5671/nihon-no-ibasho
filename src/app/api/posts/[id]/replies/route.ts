import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data, error } = await db()
    .from('replies')
    .select('*')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { body } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }

  const { data, error } = await db()
    .from('replies')
    .insert({ post_id: params.id, name: 'にんげんさん', body: body.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
