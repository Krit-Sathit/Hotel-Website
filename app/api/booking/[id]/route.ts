import { NextRequest, NextResponse } from 'next/server';

const FLOWSTAY_API_BASE =
  process.env.FLOWSTAY_API_URL ||
  process.env.NEXT_PUBLIC_FLOWSTAY_URL ||
  'https://flowstay.live';

async function fetchTrpcQuery(procedure: string, inputObj: Record<string, unknown>, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const encoded = encodeURIComponent(JSON.stringify({ json: inputObj }));
    const res = await fetch(`${FLOWSTAY_API_BASE}/api/trpc/${procedure}?input=${encoded}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.result?.data?.json ?? payload?.result?.data ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const bookingId = Number(id);
  if (!bookingId || Number.isNaN(bookingId)) {
    return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
  }

  const booking = await fetchTrpcQuery('booking.getById', { id: bookingId });
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  let tracking = null;
  if (booking.hotelId) {
    tracking = await fetchTrpcQuery('trackingSettings.getPublic', { hotelId: booking.hotelId });
  }

  return NextResponse.json({ booking, tracking });
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const bookingId = Number(id);
  if (!bookingId || Number.isNaN(bookingId)) {
    return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${FLOWSTAY_API_BASE}/api/trpc/booking.verifyPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ json: { bookingId } }),
      signal: controller.signal,
    });

    const payload = await res.json();
    const result = payload?.result?.data?.json ?? payload?.result?.data ?? null;
    return NextResponse.json(result || { status: 'pending', paymentStatus: 'pending' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Verification failed' },
      { status: 500 }
    );
  } finally {
    clearTimeout(timer);
  }
}
