import { NextRequest, NextResponse } from 'next/server';

const FLOWSTAY_API_BASE =
  process.env.FLOWSTAY_API_URL ||
  process.env.NEXT_PUBLIC_FLOWSTAY_URL ||
  'https://flowstay.live';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantPrefix = '', ...bookingInput } = body;

    const proto =
      request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
      (request.url.startsWith('https') ? 'https' : 'http');
    const host =
      request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
      request.headers.get('host') ||
      'theparphuket.com';

    const siteOrigin = `${proto}://${host}`.replace(/\/$/, '');
    const cleanPrefix = tenantPrefix ? `/${String(tenantPrefix).replace(/^\/+|\/+$/g, '')}` : '';
    const returnOrigin = `${siteOrigin}${cleanPrefix}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(`${FLOWSTAY_API_BASE}/api/trpc/booking.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Referer: `${returnOrigin}/`,
        },
        body: JSON.stringify({
          json: {
            ...bookingInput,
            returnOrigin,
          },
        }),
        signal: controller.signal,
      });

      const payload = await res.json();

      if (!res.ok || payload?.error) {
        const errMsg =
          payload?.error?.json?.message ||
          payload?.error?.message ||
          'Failed to create booking';
        return NextResponse.json({ error: errMsg }, { status: res.status || 400 });
      }

      const result = payload?.result?.data?.json ?? payload?.result?.data;
      return NextResponse.json(result);
    } finally {
      clearTimeout(timer);
    }
  } catch (error: any) {
    console.error('[Booking Create Proxy] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unable to process booking request' },
      { status: 500 }
    );
  }
}
