import React from 'react';
import { notFound } from 'next/navigation';
import { getHotelBySlug, getPromotions, trackAnalyticsEvent } from '@/lib/db/mock-data';
import PromotionsSection from '@/components/sections/promotions-section';

interface PromotionsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function PromotionsPage({ params }: PromotionsPageProps) {
  const { tenant } = await params;
  const hotel = getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Track page view for promotions
  trackAnalyticsEvent(hotel.id, 'page_view', '/promotions');

  const promotions = getPromotions(hotel.id);

  return (
    <div className="pt-8 bg-slate-50 dark:bg-slate-900/40">
      {promotions.length > 0 ? (
        <PromotionsSection promotions={promotions} />
      ) : (
        <div className="py-24 text-center text-slate-400">
          <p className="text-lg">No active promotions at this time.</p>
          <p className="text-xs mt-1">Please check back later or subscribe to our newsletter.</p>
        </div>
      )}
    </div>
  );
}
