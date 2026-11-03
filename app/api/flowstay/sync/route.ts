import { NextResponse } from 'next/server';
import { revalidatePath, updateTag } from 'next/cache';
import { clearFlowStayCache } from '@/lib/db/mock-data';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { hotelId, slug } = body || {};

    clearFlowStayCache(slug || hotelId);
    if (hotelId && slug) {
      clearFlowStayCache(String(hotelId));
      clearFlowStayCache(`hotel-${hotelId}`);
    }

    try {
      updateTag('hotel-content');
    } catch {
      // ignore if updateTag not supported in current context
    }

    revalidatePath('/', 'layout');
    if (slug) {
      revalidatePath(`/sites/${slug}`, 'layout');
    }
    if (hotelId) {
      revalidatePath(`/sites/hotel-${hotelId}`, 'layout');
      revalidatePath(`/sites/${hotelId}`, 'layout');
    }

    return NextResponse.json(
      {
        success: true,
        revalidated: true,
        hotelId: hotelId ?? null,
        slug: slug ?? null,
        syncedAt: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to sync' },
      { status: 500, headers: corsHeaders }
    );
  }
}
