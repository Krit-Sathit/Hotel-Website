import { NextResponse } from 'next/server';
import { getUsers, createUser, deleteUser, getAllHotels } from '@/lib/db/mock-data';

export async function GET() {
  try {
    const users = await getUsers();
    const hotels = await getAllHotels();
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
