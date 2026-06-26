import React from 'react';
import { notFound } from 'next/navigation';
import { getHotelBySlug, getGalleryPhotos, trackAnalyticsEvent } from '@/lib/db/mock-data';
import GallerySection from '@/components/sections/gallery-section';

interface GalleryPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Track page view for gallery
  await trackAnalyticsEvent(hotel.id, 'page_view', '/gallery');

  const photos = await getGalleryPhotos(hotel.id);

  return (
    <div className="pt-8">
      <GallerySection photos={photos} showFilters={true} />
    </div>
  );
}
