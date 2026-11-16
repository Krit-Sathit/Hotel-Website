import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getHotelBySlug } from '@/lib/db/mock-data';
import ContactSection from '@/components/sections/contact-section';
import LocationSection from '@/components/sections/location-section';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import {
  HOTEL_LOCALE_COOKIE,
  parseHotelLocale,
  localizeHotel,
} from '@/lib/i18n/hotel-locale';

interface ContactPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { tenant } = await params;
  const [rawHotel, cookieStore] = await Promise.all([getHotelBySlug(tenant), cookies()]);

  if (!rawHotel || rawHotel.status !== 'active') {
    notFound();
  }

  const locale = parseHotelLocale(cookieStore.get(HOTEL_LOCALE_COOKIE)?.value);
  const hotel = localizeHotel(rawHotel, locale);

  return (
    <div className="flex flex-col w-full">
      <PageViewTracker hotelId={hotel.id} pagePath="/contact" />
      {/* Contact form and details */}
      <ContactSection 
        hotelId={hotel.id}
        email={hotel.email}
        phone={hotel.phone}
        address={hotel.address}
        socials={hotel.social_links}
      />
      
      {/* Interactive Map and Attractions */}
      <LocationSection 
        hotelName={hotel.name}
        address={hotel.address}
        mapUrl={hotel.google_map_url}
      />
    </div>
  );
}
