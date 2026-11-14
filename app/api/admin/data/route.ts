import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getHotelBySlug,
  getHeroSlides,
  getRooms,
  getAllPromotions,
  getHomepageSections,
  getMediaItems,
} from '@/lib/db/mock-data';

export async function GET(request: NextRequest) {
  try {
    const queryHotelId = request.nextUrl.searchParams.get('hotelId')?.trim();
    const cookieStore = await cookies();
    let activeHotelId = queryHotelId || cookieStore.get('active_hotel_id')?.value;
    if (!activeHotelId || activeHotelId === 'hotel-1784206393534') {
      activeHotelId = 'theparphuket'; // Default to The Par Phuket consistently across dashboard
    }

    const hotel = await getHotelBySlug(activeHotelId);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    const includeParam = request.nextUrl.searchParams.get('include');
    const requested = includeParam
      ? new Set(includeParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))
      : null;

    const shouldFetch = (key: string) => !requested || requested.has(key);

    const [slides, rooms, sections, media, promotions] = await Promise.all([
      shouldFetch('slides') ? getHeroSlides(hotel.id) : Promise.resolve(undefined),
      shouldFetch('rooms') ? getRooms(hotel.id) : Promise.resolve(undefined),
      shouldFetch('sections') ? getHomepageSections(hotel.id) : Promise.resolve(undefined),
      shouldFetch('media') ? getMediaItems(hotel.id) : Promise.resolve(undefined),
      shouldFetch('promotions') ? getAllPromotions(hotel.id) : Promise.resolve(undefined),
    ]);

    return NextResponse.json(
      {
        hotel,
        ...(slides !== undefined ? { slides } : {}),
        ...(rooms !== undefined ? { rooms } : {}),
        ...(sections !== undefined ? { sections } : {}),
        ...(media !== undefined ? { media } : {}),
        ...(promotions !== undefined ? { promotions } : {}),
      },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      }
    );
  } catch (error) {
    console.error('Admin data fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
