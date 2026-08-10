import { NextRequest, NextResponse } from 'next/server';
import { registerNewHotel } from '@/lib/db/mock-data';

export async function POST(request: NextRequest) {
  try {
    const { hotelName, slug, email } = await request.json();
    const normalizedSlug = typeof slug === 'string' ? slug.trim().toLowerCase() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!hotelName?.trim() || !normalizedSlug || !normalizedEmail) {
      return NextResponse.json({ error: 'Hotel name, subdomain, and email are required.' }, { status: 400 });
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      return NextResponse.json({ error: 'The subdomain may only contain lowercase letters, numbers, and hyphens.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const hotelId = await registerNewHotel(hotelName.trim(), normalizedSlug, normalizedEmail);
    return NextResponse.json({ success: true, hotelId });
  } catch (error) {
    console.error('Hotel registration API error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create the hotel.' }, { status: 500 });
  }
}
