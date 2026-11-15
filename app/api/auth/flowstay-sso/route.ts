import { NextRequest, NextResponse } from 'next/server';
import { getHotelBySlug } from '@/lib/db/mock-data';

const FLOWSTAY_API_BASE =
  process.env.FLOWSTAY_API_URL ||
  process.env.NEXT_PUBLIC_FLOWSTAY_URL ||
  'https://flowstay.live';

function getSiteOrigin(request: NextRequest): string {
  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    (request.url.startsWith('https') ? 'https' : 'http');
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host') ||
    'flowweb.flowhubhotel.com';
  return `${proto}://${host}`.replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  const siteOrigin = getSiteOrigin(request);
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', siteOrigin));
  }

  try {
    const verifyRes = await fetch(
      `${FLOWSTAY_API_BASE}/api/public/hotel-website-sso/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ token }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!verifyRes.ok) {
      return NextResponse.redirect(new URL('/auth/login', siteOrigin));
    }

    const data = await verifyRes.json();
    if (!data?.valid || !data?.slug) {
      return NextResponse.redirect(new URL('/auth/login', siteOrigin));
    }

    const slug = String(data.slug);
    const resolvedHotel = await getHotelBySlug(slug);
    const activeHotelId = resolvedHotel?.id || slug;
    const role = data.role === 'super_admin' ? 'super_admin' : 'hotel_admin';
    const email = String(data.email || 'admin@flowstay.live')
      .trim()
      .toLowerCase();

    const response = NextResponse.redirect(new URL('/dashboard', siteOrigin));
    const cookieOpts = {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax' as const,
    };

    response.cookies.set('auth_session', 'authenticated', cookieOpts);
    response.cookies.set('active_hotel_id', activeHotelId, cookieOpts);
    response.cookies.set('user_role', role, cookieOpts);
    response.cookies.set('user_email', email, cookieOpts);

    return response;
  } catch (err) {
    console.error('[FlowStay SSO] Verification failed:', err);
    return NextResponse.redirect(new URL('/auth/login', siteOrigin));
  }
}
