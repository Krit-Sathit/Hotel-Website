import React from 'react';
import { notFound } from 'next/navigation';
import { getHotelBySlug, getRooms, trackAnalyticsEvent } from '@/lib/db/mock-data';
import RoomsSection from '@/components/sections/rooms-section';

interface RoomsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function RoomsPage({ params }: RoomsPageProps) {
  const { tenant } = await params;
  const hotel = getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Track page view for the rooms listing
  trackAnalyticsEvent(hotel.id, 'page_view', '/rooms');

  const rooms = getRooms(hotel.id);

  return (
    <div className="pt-8 bg-slate-50 dark:bg-slate-900/40">
      <RoomsSection rooms={rooms} />
    </div>
  );
}
