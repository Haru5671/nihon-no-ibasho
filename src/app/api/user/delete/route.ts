import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE() {
  try {
    const serverClient = createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'Server config error' }, { status: 500 });

    const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
