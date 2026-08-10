import { NextRequest, NextResponse } from 'next/server';
import { getHotelBySlug, saveContactMessage } from '@/lib/db/mock-data';
import { sendContactNotification } from '@/lib/email/contact-notification';

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

    const hotel = await getHotelBySlug(hotelId);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    // Keep every inquiry in the CMS database before attempting email delivery.
    const savedMessage = await saveContactMessage(hotelId, { name, email, phone, message });

    const delivery = await sendContactNotification({
      hotelName: hotel.name,
      recipient: hotel.email,
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      message,
    });

    if (!delivery.success) {
      return NextResponse.json(
        {
          error: 'Your message was saved, but email delivery is temporarily unavailable. Please contact the hotel directly.',
          message: savedMessage,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: savedMessage, sentTo: hotel.email });
  } catch (error) {
    console.error('Contact form API endpoint error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
