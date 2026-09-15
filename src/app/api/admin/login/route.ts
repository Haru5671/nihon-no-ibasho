import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { ADMIN_COOKIE, ADMIN_TTL_SEC, issueAdminToken } from '@/lib/admin/session';

const sha = (s: string) => createHash('sha256').update(s).digest();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  // trim: Vercel env values set via `echo` carry a trailing newline
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return NextResponse.json({ error: '管理画面は無効です' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!timingSafeEqual(sha(password), sha(expected))) {
    await sleep(800);
    return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await issueAdminToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_TTL_SEC,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  res.cookies.delete('admin_token');
  return res;
}
