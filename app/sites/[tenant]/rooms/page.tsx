import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getHotelBySlug, getRooms, trackAnalyticsEvent } from '@/lib/db/mock-data';
import RoomsSection from '@/components/sections/rooms-section';

interface RoomsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function RoomsPage({ params }: RoomsPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Compute tenantPrefix for internal navigation links
  const headerList = await headers();
  const host = headerList.get('host') || '';
  const isMainDomain = host.includes('vercel.app') || host.includes('localhost') || !host.includes(tenant);
  const tenantPrefix = isMainDomain ? `/sites/${tenant}` : '';

  // Track page view for the rooms listing
  await trackAnalyticsEvent(hotel.id, 'page_view', '/rooms');

  const rooms = await getRooms(hotel.id);

  return (
    <div className="pt-8 bg-slate-50 dark:bg-slate-900/40">
      <RoomsSection rooms={rooms} tenantPrefix={tenantPrefix} />
    </div>
  );
}
