import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const THE_PAR_HOSTS = new Set(['theparphuket.com', 'www.theparphuket.com']);
const LEGACY_PATHS: Record<string, string> = {
  // These links were indexed before the public hotel routes were introduced.
  '/rc': '/',
  '/rooms/4': '/',
};

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase().split(':')[0];
  const pathname = request.nextUrl.pathname;

  if (host && THE_PAR_HOSTS.has(host)) {
    const legacyDestination = LEGACY_PATHS[pathname];
    if (legacyDestination) {
      const url = request.nextUrl.clone();
      url.pathname = legacyDestination;
      return NextResponse.redirect(url, 308);
    }

    if (pathname.startsWith('/sites/the-par-phuket')) {
      return NextResponse.next();
    }

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
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|hotel-icon.svg|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
};
