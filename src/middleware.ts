import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
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
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
