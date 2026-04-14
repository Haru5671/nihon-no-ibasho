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

export async function GET() {
  const { data, error } = await anonDb()
    .from('posts')
    .select('*, replies(count)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { body, topic, name } = await req.json();
  if (!body?.trim() || !topic) {
    return NextResponse.json({ error: 'body and topic are required' }, { status: 400 });
  }
  const postName = (typeof name === 'string' && name.trim()) ? name.trim().slice(0, 20) : 'にんげんさん';

  const mod = checkModeration(body.trim());
  if (!mod.ok) {
    return NextResponse.json({ error: mod.reason }, { status: 422 });
  }

  // Optionally attach user_id if logged in
  let userId: string | undefined;
  try {
    const serverClient = createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (user) userId = user.id;
  } catch { /* ok — anonymous */ }

  const { data, error } = await anonDb()
    .from('posts')
    .insert({ name: postName, body: body.trim(), topic, ...(userId ? { user_id: userId } : {}) })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
