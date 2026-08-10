import React from 'react';
import { notFound } from 'next/navigation';

import { getHotelBySlug, getGalleryPhotos, getRooms } from '@/lib/db/mock-data';
import GallerySection from '@/components/sections/gallery-section';
import PageViewTracker from '@/components/analytics/page-view-tracker';

interface GalleryPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const photos = await getGalleryPhotos(hotel.id);
  const rooms = await getRooms(hotel.id);

  return (
    <div className="pt-8">
      <PageViewTracker hotelId={hotel.id} pagePath="/gallery" />
      <GallerySection photos={photos} rooms={rooms} showFilters={true} />
    </div>
  );
}
