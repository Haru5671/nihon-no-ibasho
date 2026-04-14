import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { checkModeration } from '@/lib/moderate';

function anonDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data, error } = await anonDb()
    .from('replies')
    .select('*')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { body, name } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }
  const replyName = (typeof name === 'string' && name.trim()) ? name.trim().slice(0, 20) : 'にんげんさん';

  const mod = checkModeration(body.trim());
  if (!mod.ok) {
    return NextResponse.json({ error: mod.reason }, { status: 422 });
  }

  let userId: string | undefined;
  try {
    const serverClient = createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (user) userId = user.id;
  } catch { /* ok */ }

  const { data, error } = await anonDb()
    .from('replies')
    .insert({ post_id: params.id, name: replyName, body: body.trim(), ...(userId ? { user_id: userId } : {}) })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
