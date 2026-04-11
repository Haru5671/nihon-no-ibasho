import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const { data, error } = await db()
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const { topic, name, description } = await req.json();
  if (!name?.trim() || !topic) {
    return NextResponse.json({ error: 'name and topic are required' }, { status: 400 });
  }

  const { data, error } = await db()
    .from('rooms')
    .insert({ topic, name: name.trim(), description: description?.trim() ?? '' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
