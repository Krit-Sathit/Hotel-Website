import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getHotelBySlug, getHeroSlides, getRooms, getAllPromotions } from '@/lib/db/mock-data';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let activeHotelId = cookieStore.get('active_hotel_id')?.value;
    if (!activeHotelId) {
      activeHotelId = '11111111-1111-1111-1111-111111111111'; // Default Hotel A
    }

    const hotel = await getHotelBySlug(activeHotelId);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    const slides = await getHeroSlides(hotel.id);
    const rooms = await getRooms(hotel.id);
    
    // Fetch all promotions for this hotel (both active and inactive)
    const promotions = await getAllPromotions(hotel.id);

    return NextResponse.json({
      hotel,
      slides,
      rooms,
      promotions
    });
  } catch (error) {
    console.error('Admin data fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 550 });
  }
}

