import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DOMAIN_TO_SLUG: Record<string, string> = {
  'theparphuket.com': 'the-par-phuket',
  'www.theparphuket.com': 'the-par-phuket',
  'phuketairportvilla.com': 'phuket-airport-villa',
  'www.phuketairportvilla.com': 'phuket-airport-villa',
  'phuketairvilla.com': 'phuket-airport-villa',
  'www.phuketairvilla.com': 'phuket-airport-villa',
};

const LEGACY_PATHS: Record<string, string> = {
  // These links were indexed before the public hotel routes were introduced.
  '/rc': '/',
  '/rooms/4': '/',
};

export function proxy(request: NextRequest) {
  const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.hostname || '';
  const host = rawHost.split(',')[0].trim().toLowerCase().split(':')[0];
  const normalizedHost = host.replace(/^www\./, '');
  const pathname = request.nextUrl.pathname;

  const slug = DOMAIN_TO_SLUG[host] || DOMAIN_TO_SLUG[normalizedHost] || (
    host.includes('phuketairport') || host.includes('phuketairvilla') || host.includes('airportvilla')
      ? 'phuket-airport-villa'
      : host.includes('thepar')
        ? 'the-par-phuket'
        : null
  );

  if (slug) {
    const legacyDestination = LEGACY_PATHS[pathname];
    if (legacyDestination) {
      const url = request.nextUrl.clone();
      url.pathname = legacyDestination;
      return NextResponse.redirect(url, 308);
    }

    if (pathname.startsWith(`/sites/${slug}`)) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = pathname === '/'
      ? `/sites/${slug}`
      : `/sites/${slug}${pathname}`;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
