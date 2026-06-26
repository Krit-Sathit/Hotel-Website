import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, Mail, MapPin, Globe, Menu } from 'lucide-react';
import { getHotelBySlug } from '@/lib/db/mock-data';
import HotelThemeProvider from '@/components/hotel-theme-provider';
import BookingWidget from '@/components/booking-widget';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params;
  const hotel = getHotelBySlug(tenant);

  // If the hotel is not registered or suspended, return a 404
  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const { theme } = hotel;

  // Curated list of navigation links
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Rooms', href: '/rooms' },
    { label: 'Promotions', href: '/promotions' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <HotelThemeProvider theme={theme}>
      <div className="flex flex-col min-h-screen font-sans selection:bg-accent/30 selection:text-primary">
        
        {/* TOP UTILITY HEADER (Desktop only) */}
        <div className="hidden lg:block w-full bg-primary text-white/80 border-b border-white/10 py-2 text-[11px] font-medium tracking-wider">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-5">
              {hotel.phone && (
                <a href={`tel:${hotel.phone}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  <Phone className="w-3.5 h-3.5 text-accent" />
                  {hotel.phone}
                </a>
              )}
              {hotel.email && (
                <a href={`mailto:${hotel.email}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  {hotel.email}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              {hotel.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {hotel.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MAIN HEADER / NAVIGATION */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-250/30 dark:border-slate-800/30 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* BRAND LOGO / NAME */}
            <Link href="/" className="flex flex-col text-left group">
              <span className="text-lg md:text-xl font-bold tracking-widest text-primary font-hotel uppercase group-hover:text-accent transition-colors">
                {hotel.name}
              </span>
              <span className="text-[9px] tracking-widest font-semibold uppercase text-slate-400 -mt-0.5">
                Bespoke Retreat
              </span>
            </Link>

            {/* NAVIGATION LINKS */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-slate-600 dark:text-slate-350">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="hover:text-accent border-b-2 border-transparent hover:border-accent/50 pb-1 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* MOBILE MENU TRIGGER */}
            <button className="md:hidden text-primary p-1 hover:text-accent transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* DESKTOP STICKY BOOKING BAR (Injected directly under the navigation header) */}
          <BookingWidget hotelId={hotel.id} hotelName={hotel.name} variant="sticky-header" />
        </header>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-grow pb-16 lg:pb-0">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-primary text-white/90 pt-16 pb-24 lg:pb-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-white/10">
              
              {/* Hotel Intro */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-md font-bold tracking-widest uppercase text-accent font-hotel">
                  {hotel.name}
                </h3>
                <p className="text-xs text-white/60 max-w-sm leading-relaxed">
                  Experience a sanctuary where timeless luxury intersects with local soul. Our dedicated staff is committed to curating an unforgettable stay tailored to your every desire.
                </p>
                <div className="flex gap-4 pt-2">
                  {Object.entries(hotel.social_links).map(([platform, url]) => {
                    if (!url) return null;
                    return (
                      <a 
                        key={platform} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-white/40 hover:text-accent transition-colors capitalize text-xs tracking-wider"
                      >
                        {platform}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Links Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest uppercase text-white/50">Explore</h4>
                <ul className="space-y-2.5 text-xs text-white/70">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-accent transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest uppercase text-white/50">Inquiries</h4>
                <ul className="space-y-2.5 text-xs text-white/75">
                  {hotel.phone && <li>Call: <a href={`tel:${hotel.phone}`} className="hover:text-accent transition-colors">{hotel.phone}</a></li>}
                  {hotel.email && <li>Email: <a href={`mailto:${hotel.email}`} className="hover:text-accent transition-colors">{hotel.email}</a></li>}
                  {hotel.address && <li className="text-white/55 leading-relaxed">Visit: {hotel.address}</li>}
                </ul>
              </div>
            </div>

            {/* Copyright Statement */}
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/40 tracking-wider font-medium">
              <p>© {new Date().getFullYear()} {hotel.name}. All Rights Reserved.</p>
              <p className="flex items-center gap-1">
                Powered by 
                <span className="font-semibold text-white/70 tracking-widest uppercase hover:text-accent transition-colors">
                  FlowStay
                </span>
                Booking Engine
              </p>
            </div>
          </div>
        </footer>

        {/* MOBILE STICKY BOTTOM BAR (Always visible at the bottom on touch devices) */}
        <BookingWidget hotelId={hotel.id} hotelName={hotel.name} variant="sticky-bottom" />
      </div>
    </HotelThemeProvider>
  );
}
