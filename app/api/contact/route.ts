import { NextRequest, NextResponse } from 'next/server';
import { saveContactMessage } from '@/lib/db/mock-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelId, name, email, phone, message } = body;

    if (!hotelId || !name || !email || !message) {
      return NextResponse.json({ error: 'Missing required contact fields' }, { status: 400 });
    }

    // Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // Save message to our database/mock store
    const savedMessage = saveContactMessage(hotelId, { name, email, phone, message });

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('Contact form API endpoint error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
