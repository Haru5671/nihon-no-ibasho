import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin/session';

const ADMIN_PUBLIC = new Set(['/admin/login', '/api/admin/login']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host') ?? '';
    const proto = request.headers.get('x-forwarded-proto');

    // www → apex とHTTP → HTTPSを1回の301に集約し、評価の分散を防ぐ
    const needsHttps = proto === 'http';
    const needsApex = host.startsWith('www.');
    if (needsHttps || needsApex) {
      const url = request.nextUrl.clone();
      url.protocol = 'https:';
      if (needsApex) url.host = host.replace(/^www\./, '');
      return NextResponse.redirect(url, { status: 301 });
    }
  }

  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/');
  if (isAdminArea && !ADMIN_PUBLIC.has(pathname)) {
    const ok = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value, process.env.ADMIN_PASSWORD);
    if (!ok) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
