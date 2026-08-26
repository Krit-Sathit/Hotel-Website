import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const THE_PAR_HOSTS = new Set(['theparphuket.com', 'www.theparphuket.com']);

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase().split(':')[0];
  const pathname = request.nextUrl.pathname;

  if (host && THE_PAR_HOSTS.has(host) && !pathname.startsWith('/sites/the-par-phuket')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/'
      ? '/sites/the-par-phuket'
      : `/sites/the-par-phuket${pathname}`;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|hotel-icon.svg|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
};
