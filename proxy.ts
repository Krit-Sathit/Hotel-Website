import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getHotelByDomainEdge } from './lib/db/edge-lookup';

// Next.js 16 Proxy Convention
export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  console.log('[Proxy] Incoming Request - Host:', hostname, 'Path:', url.pathname);

  // Exclude API routes, static assets, and internal Next.js paths
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.includes('.') || 
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/favicon.ico')
  ) {
    console.log('[Proxy] Excluded path, proceeding normally:', url.pathname);
    return NextResponse.next();
  }

  // Define main platform domain names (including local port)
  const mainDomains = ['localhost:3000', 'flowstay.com', 'www.flowstay.com'];
  const normalizedHost = hostname.toLowerCase().split(':')[0];
  const hostParts = normalizedHost.split('.');
  
  let isMainDomain = mainDomains.includes(normalizedHost);

  // Dynamically recognize any Vercel deployment root domains as the main platform domain
  if (normalizedHost.endsWith('vercel.app')) {
    if (hostParts.length === 3) {
      isMainDomain = true;
    }
  }

  let tenantSlug: string | null = null;

  if (!isMainDomain) {
    // Dynamically resolve hotel mapping based on custom domain or subdomain (Edge-safe)
    const hotel = await getHotelByDomainEdge(hostname);
    if (hotel && hotel.status === 'active') {
      tenantSlug = hotel.slug;
    }
  }

  console.log('[Proxy] Evaluated tenantSlug:', tenantSlug);

  // If a tenant slug is identified, rewrite the request internally to /sites/[tenant]
  if (tenantSlug && tenantSlug !== 'www' && tenantSlug !== 'admin' && tenantSlug !== 'dashboard') {
    if (!url.pathname.startsWith('/sites/')) {
      url.pathname = `/sites/${tenantSlug}${url.pathname}`;
      console.log('[Proxy] Rewriting to:', url.pathname);
      return NextResponse.rewrite(url);
    }
  }

  // Otherwise, proceed normally on the main platform domain
  console.log('[Proxy] Proceeding normally to:', url.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. Static files
     */
    '/((?!api/|_next/|_static/|_images/|[^?]*\\.(?:html|css|js|gif|svg|png|jpg|jpeg|webp|ico|csv|docx|xlsx|zip|wav|mp3|mp4|webm)$).*)',
  ],
};
