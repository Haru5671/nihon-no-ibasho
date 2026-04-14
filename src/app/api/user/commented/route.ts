import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function anonDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  try {
    const serverClient = createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get post_ids the user has replied to
    const { data: replies, error: rErr } = await anonDb()
      .from('replies')
      .select('post_id')
      .eq('user_id', user.id);

    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });
    if (!replies || replies.length === 0) return NextResponse.json([]);

    const postIds = Array.from(new Set(replies.map((r) => r.post_id)));

    const { data, error } = await anonDb()
      .from('posts')
      .select('*, replies(count)')
      .in('id', postIds)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
