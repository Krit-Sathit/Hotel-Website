import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getHotelByDomainEdge } from './lib/db/edge-lookup';

export default async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude API routes, static assets, dashboard, auth, and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.includes('.') || 
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // If path already targets /sites/..., allow it to proceed directly to the App Router route
  if (url.pathname.startsWith('/sites/')) {
    return NextResponse.next();
  }

  const normalizedHost = hostname.toLowerCase().split(':')[0];
  const parts = normalizedHost.split('.');

  // Subdomain / Custom Domain Resolution (e.g. the-par-phuket.localhost:3000 or custom domains)
  let tenantSlug: string | null = null;
  const isLocalhostSubdomain = parts.length > 1 && parts[parts.length - 1] === 'localhost';
  const isVercelSubdomain = normalizedHost.endsWith('vercel.app') && parts.length > 3; // e.g. tenant.project.vercel.app

  if (isLocalhostSubdomain || isVercelSubdomain) {
    const subdomain = parts[0];
    if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== 'dashboard' && subdomain !== 'admin' && subdomain !== 'sites') {
      tenantSlug = subdomain;
    }
  }

  if (!tenantSlug) {
    const hotel = await getHotelByDomainEdge(hostname);
    if (hotel && hotel.status === 'active') {
      tenantSlug = hotel.slug;
    }
  }

  // Rewrite subdomain traffic to /sites/[tenant]
  if (tenantSlug) {
    url.pathname = `/sites/${tenantSlug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // If user visits /[tenant-slug] on main domain (e.g. /the-par-phuket)
  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 1) {
    const candidateSlug = pathParts[0];
    if (
      candidateSlug !== 'dashboard' && 
      candidateSlug !== 'auth' && 
      candidateSlug !== 'api' && 
      candidateSlug !== 'sites' && 
      candidateSlug !== '_next'
    ) {
      // Rewrite /[slug]/... to /sites/[slug]/...
      const restPath = pathParts.slice(1).join('/');
      url.pathname = `/sites/${candidateSlug}${restPath ? `/${restPath}` : ''}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_images/|[^?]*\\.(?:html|css|js|gif|svg|png|jpg|jpeg|webp|ico|csv|docx|xlsx|zip|wav|mp3|mp4|webm)$).*)',
  ],
};
