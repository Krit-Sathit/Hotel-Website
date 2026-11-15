import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getHotelBySlug, getPromotions } from '@/lib/db/mock-data';
import PromotionsSection from '@/components/sections/promotions-section';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import { getBookingEngineUrl, resolveTenantPrefix } from '@/lib/booking-engine';

interface PromotionsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function PromotionsPage({ params }: PromotionsPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const headerList = await headers();
  const rawHost = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const tenantPrefix = resolveTenantPrefix(rawHost, tenant);

  const promotions = await getPromotions(hotel.id);

  return (
    <div className="pt-8 bg-slate-50 dark:bg-slate-900/40">
      <PageViewTracker hotelId={hotel.id} pagePath="/promotions" />
      {promotions.length > 0 ? (
        <PromotionsSection promotions={promotions} bookingUrl={getBookingEngineUrl(hotel.slug, tenantPrefix)} />
      ) : (
        <div className="py-24 text-center text-slate-400">
          <p className="text-lg">No active promotions at this time.</p>
          <p className="text-xs mt-1">Please check back later or subscribe to our newsletter.</p>
        </div>
      )}
    </div>
  );
}
