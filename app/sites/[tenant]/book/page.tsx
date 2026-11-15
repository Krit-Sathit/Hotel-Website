import React from 'react';
import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/lib/db/mock-data';
import HotelBookingEngine from '@/components/booking/hotel-booking-engine';
import PageViewTracker from '@/components/analytics/page-view-tracker';

interface BookPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    checkin?: string;
    checkout?: string;
    check_in?: string;
    check_out?: string;
    nights?: string;
    los?: string;
    adults?: string;
    guests?: string;
    children?: string;
    rooms?: string;
    promoCode?: string;
  }>;
}

function addDaysIso(isoDate: string, days: number): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return undefined;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(dt.getTime())) return undefined;
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export default async function TenantBookPage({ params, searchParams }: BookPageProps) {
  const { tenant } = await params;
  const query = await searchParams;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Support both internal camelCase params and Google Hotel Center / Channex Free Booking Link params
  const resolvedCheckIn = query.checkIn || query.checkin || query.check_in;
  const stayNights = parseInt(query.nights || query.los || '0', 10);
  const resolvedCheckOut =
    query.checkOut ||
    query.checkout ||
    query.check_out ||
    (resolvedCheckIn && stayNights > 0 ? addDaysIso(resolvedCheckIn, stayNights) : undefined);

  const isHostel = /hostel|โฮสเทล/i.test(`${hotel.name || ''} ${hotel.slug || ''} ${tenant}`);
  const defaultAdults = isHostel ? 1 : 2;
  const rawAdults = query.adults || query.guests || String(defaultAdults);
  const initialAdults = Math.max(1, parseInt(rawAdults, 10) || defaultAdults);
  const initialChildren = Math.max(0, parseInt(query.children || '0', 10) || 0);
  const initialRooms = Math.max(1, parseInt(query.rooms || '1', 10) || 1);

  return (
    <>
      <PageViewTracker hotelId={hotel.id} pagePath="/book" />
      <HotelBookingEngine
        tenantSlug={hotel.slug || tenant}
        hotelName={hotel.name}
        initialCheckIn={resolvedCheckIn}
        initialCheckOut={resolvedCheckOut}
        initialAdults={initialAdults}
        initialChildren={initialChildren}
        initialRooms={initialRooms}
        initialPromoCode={query.promoCode || ''}
      />
    </>
  );
}
