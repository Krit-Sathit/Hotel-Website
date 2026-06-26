import { NextRequest, NextResponse } from 'next/server';
import { trackAnalyticsEvent } from '@/lib/db/mock-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelId, eventType, pagePath, roomId } = body;

    if (!hotelId || !eventType || !pagePath) {
      return NextResponse.json({ error: 'Missing required tracking fields' }, { status: 400 });
    }

    // Call our DAL to track the event in our database/mock store
    trackAnalyticsEvent(hotelId, eventType, pagePath, roomId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking endpoint error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
