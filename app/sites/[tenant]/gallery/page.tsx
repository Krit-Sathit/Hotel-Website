import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { getHotelBySlug, getGalleryPhotos, getRooms } from '@/lib/db/mock-data';
import GallerySection from '@/components/sections/gallery-section';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import {
  HOTEL_LOCALE_COOKIE,
  parseHotelLocale,
  localizeRooms,
} from '@/lib/i18n/hotel-locale';

interface GalleryPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const [photos, rawRooms, cookieStore] = await Promise.all([
    getGalleryPhotos(hotel.id),
    getRooms(hotel.id),
    cookies(),
  ]);
  const locale = parseHotelLocale(cookieStore.get(HOTEL_LOCALE_COOKIE)?.value);
  const rooms = localizeRooms(rawRooms, locale);

  return (
    <div className="pt-8">
      <PageViewTracker hotelId={hotel.id} pagePath="/gallery" />
      <GallerySection photos={photos} rooms={rooms} showFilters={true} />
    </div>
  );
}
