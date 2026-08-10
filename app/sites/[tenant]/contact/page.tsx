import React from 'react';
import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/lib/db/mock-data';
import ContactSection from '@/components/sections/contact-section';
import LocationSection from '@/components/sections/location-section';
import PageViewTracker from '@/components/analytics/page-view-tracker';

interface ContactPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

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
