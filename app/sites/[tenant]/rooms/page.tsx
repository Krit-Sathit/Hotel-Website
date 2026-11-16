import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';

import { getHotelBySlug, getRooms } from '@/lib/db/mock-data';
import RoomsSection from '@/components/sections/rooms-section';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import { getBookingEngineUrl, resolveTenantPrefix } from '@/lib/booking-engine';
import {
  HOTEL_LOCALE_COOKIE,
  parseHotelLocale,
  localizeRooms,
} from '@/lib/i18n/hotel-locale';

interface RoomsPageProps {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata({ params }: RoomsPageProps): Promise<Metadata> {
  const { tenant } = await params;

  return tenant === 'the-par-phuket'
    ? { robots: { index: false, follow: true } }
    : {};
}

export default async function RoomsPage({ params }: RoomsPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Compute tenantPrefix for internal navigation links
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = parseHotelLocale(cookieStore.get(HOTEL_LOCALE_COOKIE)?.value);
  const rawHost = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const tenantPrefix = resolveTenantPrefix(rawHost, tenant);

  const rooms = localizeRooms(await getRooms(hotel.id), locale);

  return (
    <div className="pt-8 bg-slate-50 dark:bg-slate-900/40">
      <PageViewTracker hotelId={hotel.id} pagePath="/rooms" />
      <RoomsSection rooms={rooms} tenantPrefix={tenantPrefix} bookingUrl={getBookingEngineUrl(hotel.slug, tenantPrefix)} />
    </div>
  );
}
