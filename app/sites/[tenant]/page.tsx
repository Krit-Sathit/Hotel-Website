import React from 'react';
import { notFound } from 'next/navigation';
import { 
  getHotelBySlug, 
  getHeroSlides, 
  getHomepageSections, 
  getRooms, 
  getPromotions, 
  getGalleryPhotos, 
  trackAnalyticsEvent 
} from '@/lib/db/mock-data';

// Import our beautiful section components
import HeroSlider from '@/components/sections/hero-slider';
import AboutSection from '@/components/sections/about-section';
import RoomsSection from '@/components/sections/rooms-section';
import FacilitiesSection from '@/components/sections/facilities-section';
import PromotionsSection from '@/components/sections/promotions-section';
import GallerySection from '@/components/sections/gallery-section';
import TestimonialsSection from '@/components/sections/testimonials-section';
import AwardsSection from '@/components/sections/awards-section';
import LocationSection from '@/components/sections/location-section';
import ContactSection from '@/components/sections/contact-section';

interface TenantPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant } = await params;
  const hotel = getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Log a privacy-compliant page view event on the server side on load
  trackAnalyticsEvent(hotel.id, 'page_view', '/');

  // Fetch all content concurrently
  const slides = getHeroSlides(hotel.id);
  const dbSections = getHomepageSections(hotel.id);
  const rooms = getRooms(hotel.id);
  const promotions = getPromotions(hotel.id);
  const gallery = getGalleryPhotos(hotel.id);

  // Helper to extract content for a specific section type
  const getSectionContent = (type: string) => {
    const s = dbSections.find((sec) => sec.section_type === type);
    return s && s.is_enabled ? s.content : null;
  };

  // Render a specific block based on its key in homepage_layout
  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return slides.length > 0 ? (
          <HeroSlider key="hero" slides={slides} hotelId={hotel.id} />
        ) : null;
        
      case 'about':
        const aboutContent = getSectionContent('about');
        return aboutContent ? (
          <AboutSection key="about" content={aboutContent} />
        ) : null;
        
      case 'rooms':
        return rooms.length > 0 ? (
          <RoomsSection key="rooms" rooms={rooms} />
        ) : null;
        
      case 'facilities':
        // If there is no database override, render default premium facilities
        const facilitiesContent = getSectionContent('facilities') || {
          title: 'World-Class Offerings',
          subtitle: 'Designed for Exquisite Pleasures',
          items: [
            { title: 'The Wellness Spa', desc: 'Holistic massage and therapeutic hydro-treatments.', icon: 'spa' },
            { title: 'Michelin Star Dining', desc: 'Culinary arts crafted with organic local ingredients.', icon: 'dining' },
            { title: 'Heated Plunge Pools', desc: 'Panoramic temperature-regulated swimming decks.', icon: 'pool' },
            { title: '24/7 Butler Service', desc: 'Personalized service to anticipate your every requirement.', icon: 'service' }
          ]
        };
        return (
          <FacilitiesSection key="facilities" content={facilitiesContent} />
        );
        
      case 'promotions':
        return promotions.length > 0 ? (
          <PromotionsSection key="promotions" promotions={promotions} />
        ) : null;
        
      case 'gallery':
        return gallery.length > 0 ? (
          <GallerySection key="gallery" photos={gallery} limit={6} />
        ) : null;
        
      case 'testimonials':
        const testimonialContent = getSectionContent('testimonials') || {
          title: 'Guest Diaries',
          subtitle: 'Unforgettable Journeys in Their Own Words',
          items: [
            { guest: 'Lady Eleanor Carter', text: 'An absolute masterpiece of hospitality. The ocean vistas, the intuitive staff, and the culinary artistry left us entirely restored.', location: 'London, UK' },
            { guest: 'Julian Vance', text: 'Minimalist design perfection. A peaceful haven in NYC with hyper-fast fiber and the best rooftop cocktails in Soho.', location: 'San Francisco, CA' }
          ]
        };
        return (
          <TestimonialsSection key="testimonials" content={testimonialContent} />
        );
        
      case 'awards':
        const awardsContent = getSectionContent('awards') || {
          title: 'Distinguished Accolades',
          subtitle: 'Our Legacy of Excellence Recognized Globally',
          items: [
            { name: 'Condé Nast Traveler', detail: 'Gold List - Best Luxury Resorts' },
            { name: 'Travel + Leisure', detail: 'World Best Awards - Top 10 Boutique Hotels' },
            { name: 'Michelin Guide', detail: 'Three Michelin Keys - Extraordinary Experience' }
          ]
        };
        return (
          <AwardsSection key="awards" content={awardsContent} />
        );
        
      case 'location':
        return (
          <LocationSection 
            key="location" 
            hotelName={hotel.name}
            address={hotel.address} 
            mapUrl={hotel.google_map_url} 
          />
        );
        
      case 'contact':
        return (
          <ContactSection 
            key="contact" 
            hotelId={hotel.id}
            email={hotel.email} 
            phone={hotel.phone} 
            address={hotel.address} 
            socials={hotel.social_links}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Loop through and render each homepage block in the layout array */}
      {hotel.homepage_layout.map((sectionType) => renderSection(sectionType))}
    </div>
  );
}
