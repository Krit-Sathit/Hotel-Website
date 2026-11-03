import React from 'react';
import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/lib/db/mock-data';
import HotelBookingEngine from '@/components/booking/hotel-booking-engine';
import PageViewTracker from '@/components/analytics/page-view-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BookPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    rooms?: string;
    promoCode?: string;
  }>;
}

export default async function TenantBookPage({ params, searchParams }: BookPageProps) {
  const { tenant } = await params;
  const query = await searchParams;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const initialAdults = Math.max(1, parseInt(query.adults || '2', 10) || 2);
  const initialChildren = Math.max(0, parseInt(query.children || '0', 10) || 0);
  const initialRooms = Math.max(1, parseInt(query.rooms || '1', 10) || 1);

  return (
    <>
      <PageViewTracker hotelId={hotel.id} pagePath="/book" />
      <HotelBookingEngine
        tenantSlug={hotel.slug || tenant}
        hotelName={hotel.name}
        initialCheckIn={query.checkIn}
        initialCheckOut={query.checkOut}
        initialAdults={initialAdults}
        initialChildren={initialChildren}
        initialRooms={initialRooms}
        initialPromoCode={query.promoCode || ''}
      />
    </>
  );
}
