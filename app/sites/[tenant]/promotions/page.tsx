import React from 'react';
import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { getHotelBySlug, getPromotions } from '@/lib/db/mock-data';
import PromotionsSection from '@/components/sections/promotions-section';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import { getBookingEngineUrl, resolveTenantPrefix } from '@/lib/booking-engine';
import {
  HOTEL_LOCALE_COOKIE,
  parseHotelLocale,
  localizePromotions,
  getHotelUiText,
} from '@/lib/i18n/hotel-locale';

interface PromotionsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function PromotionsPage({ params }: PromotionsPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = parseHotelLocale(cookieStore.get(HOTEL_LOCALE_COOKIE)?.value);
  const ui = getHotelUiText(locale);
  const rawHost = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const tenantPrefix = resolveTenantPrefix(rawHost, tenant);

  const promotions = localizePromotions(await getPromotions(hotel.id), locale);

  return (
    <div className="pt-8 bg-slate-50 dark:bg-slate-900/40">
      <PageViewTracker hotelId={hotel.id} pagePath="/promotions" />
      {promotions.length > 0 ? (
        <PromotionsSection promotions={promotions} bookingUrl={getBookingEngineUrl(hotel.slug, tenantPrefix)} />
      ) : (
        <div className="py-24 text-center text-slate-400">
          <p className="text-lg">{ui.sections.noPromotions}</p>
          <p className="text-xs mt-1">{ui.sections.noPromotionsSub}</p>
        </div>
      )}
    </div>
  );
}
