import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUsers, createUser, deleteUser, getAllHotels } from '@/lib/db/mock-data';

export async function GET(request: Request) {
  try {
    const scope = new URL(request.url).searchParams.get('scope');
    const users = await getUsers();

    // Fast path for login authentication check: skip fetching external hotels list
    if (scope === 'auth') {
      return NextResponse.json({
        success: true,
        users,
      });
    }

    const hotels = await getAllHotels();

    // The access-management screen is scoped to the currently selected hotel.
    // The unscoped response remains available to the login flow, which needs to
    // locate the account before an active hotel has been chosen.
    if (scope === 'active') {
      const cookieStore = await cookies();
      const rawActiveId = cookieStore.get('active_hotel_id')?.value;
      const activeHotelId = !rawActiveId || rawActiveId === 'hotel-1784206393534' ? 'theparphuket' : rawActiveId;
      const activeHotel = hotels.find(
        (hotel) =>
          hotel.id === activeHotelId ||
          hotel.slug === activeHotelId ||
          hotel.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === activeHotelId.toLowerCase().replace(/[^a-z0-9]/g, '')
      );

      if (!activeHotel) {
        return NextResponse.json({ success: false, error: 'Selected hotel was not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        users: users.filter(
          (user) =>
            user.hotel_id === activeHotel.id ||
            user.hotel_id === activeHotel.slug ||
            (activeHotel.slug === 'theparphuket' &&
              (user.hotel_id === 'hotel-1784206393534' || user.hotel_id === 'the-par-phuket'))
        ),
        hotels: [{ id: activeHotel.id, name: activeHotel.name, slug: activeHotel.slug }],
        activeHotel: { id: activeHotel.id, name: activeHotel.name }
      });
    }

    return NextResponse.json({
      success: true,
      users,
      hotels: hotels.map(h => ({ id: h.id, name: h.name, slug: h.slug }))
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, hotel_id } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and Password are required' }, { status: 400 });
    }

    const existingUsers = await getUsers();
    if (existingUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const newUser = await createUser({
      email,
      password,
      name: name || email.split('@')[0],
      role: role || 'hotel_admin',
      hotel_id: hotel_id || null
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    await deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
