import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // 1. Exclude static files, API, auth, dashboard, and Next.js internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/dashboard') ||
    pathname.includes('.') || 
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Allow direct /sites/[tenant] routes to pass through to App Router
  if (pathname.startsWith('/sites/')) {
    return NextResponse.next();
  }

  const normalizedHost = hostname.toLowerCase().split(':')[0];
  const parts = normalizedHost.split('.');

  // 3. Subdomain / Custom Domain Resolution (e.g. tenant.localhost:3000 or tenant.vercel.app)
  const isLocalhostSubdomain = parts.length > 1 && parts[parts.length - 1] === 'localhost';
  const isVercelSubdomain = normalizedHost.endsWith('vercel.app') && parts.length > 3;

  if (isLocalhostSubdomain || isVercelSubdomain) {
    const subdomain = parts[0];
    if (
      subdomain !== 'www' && 
      subdomain !== 'localhost' && 
      subdomain !== 'dashboard' && 
      subdomain !== 'admin' && 
      subdomain !== 'sites'
    ) {
      url.pathname = `/sites/${subdomain}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 4. Path-based Tenant Routing on Main Domain (e.g. /the-par-phuket or /hotel-a)
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length >= 1) {
    const candidateSlug = pathParts[0];
    if (
      candidateSlug !== 'dashboard' && 
      candidateSlug !== 'auth' && 
      candidateSlug !== 'api' && 
      candidateSlug !== 'sites' && 
      candidateSlug !== '_next'
    ) {
      const restPath = pathParts.slice(1).join('/');
      url.pathname = `/sites/${candidateSlug}${restPath ? `/${restPath}` : ''}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_images/|[^?]*\\.(?:html|css|js|gif|svg|png|jpg|jpeg|webp|ico|csv|docx|xlsx|zip|wav|mp3|mp4|webm)$).*)',
  ],
};
