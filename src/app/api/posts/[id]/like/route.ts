import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = db();

  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', params.id)
    .single();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 });

  const { data, error } = await supabase
    .from('posts')
    .update({ likes: (post.likes ?? 0) + 1 })
    .eq('id', params.id)
    .select('likes')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
