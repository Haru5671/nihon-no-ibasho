import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // HTTP → HTTPS redirect (production only)
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 301 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
