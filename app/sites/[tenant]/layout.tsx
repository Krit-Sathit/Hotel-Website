import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Phone, Mail, MapPin } from 'lucide-react';
import { getHotelBySlug } from '@/lib/db/mock-data';
import HotelThemeProvider from '@/components/hotel-theme-provider';
import BookingWidget from '@/components/booking-widget';
import MobileNavigation from '@/components/mobile-navigation';
import TenantChromeGuard from '@/components/templates/tenant-chrome-guard';
import { getBookingEngineUrl, resolveTenantPrefix } from '@/lib/booking-engine';
import {
  buildGoogleDirectionsUrl,
  extractLatLng,
  formatPhoneForSchema,
} from '@/lib/map-utils';
import {
  resolveHotelSeo,
  resolveHotelHighlights,
  isTheParPhuketHotel,
} from '@/lib/hotel-seo-highlights';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata({ params }: Pick<TenantLayoutProps, 'params'>): Promise<Metadata> {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);
  const seo = resolveHotelSeo(hotel);
  const canonicalUrl = hotel?.custom_domain
    ? `https://${hotel.custom_domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`
    : undefined;

  return {
    title: seo.title,
    description: seo.description,
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
    icons: {
      icon: '/hotel-icon.svg',
    },
  };
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);

  // If the hotel is not registered or suspended, return a 404
  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const { theme } = hotel;

  // Determine tenant prefix for links based on domain host
  const headerList = await headers();
  const rawHost = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const host = rawHost.split(',')[0].trim().toLowerCase();
  const tenantPrefix = resolveTenantPrefix(rawHost, tenant);
  const bookingUrl = getBookingEngineUrl(hotel.slug, tenantPrefix);
  const mapDirectionsHref = buildGoogleDirectionsUrl(
    hotel.google_map_url,
    hotel.name,
    hotel.address
  );
  const geoCoords = extractLatLng(hotel.google_map_url);
  const canonicalDomain = hotel.custom_domain
    ? `https://${hotel.custom_domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`
    : host
    ? `https://${host}${tenantPrefix}`
    : undefined;

  const seo = resolveHotelSeo(hotel);
  const isParPhuket = isTheParPhuketHotel(hotel.slug, hotel.name);
  const highlights = resolveHotelHighlights(undefined, hotel.slug, hotel.name);
  const socialSameAs = (['facebook', 'instagram', 'whatsapp', 'twitter'] as const)
    .map((k) => hotel.social_links?.[k]?.trim())
    .filter((v): v is string => Boolean(v));

  // Official Schema.org Hotel + Resort + FAQ JSON-LD for Google Search, Google Maps & Google AI Mode (GEO)
  const hotelEntity: Record<string, unknown> = {
    '@type': isParPhuket ? ['Hotel', 'Resort'] : 'Hotel',
    name: hotel.name,
    ...(isParPhuket
      ? {
          alternateName: [
            'เดอะ พาร์ ภูเก็ต',
            'The Par Phuket Golf & Lifestyle Hotel',
            'โรงแรมเดอะ พาร์ ภูเก็ต สนามกอล์ฟกะทู้',
          ],
          keywords:
            'โรงแรมในสนามกอล์ฟภูเก็ต, โรงแรมติดสนามกอล์ฟ ภูเก็ต, Golf Hotel Phuket, Golf Resort Kathu Phuket, Phuket Country Club Hotel, สนามกอล์ฟ ภูเก็ต คันทรี คลับ, ที่พักกะทู้ วิวสนามกอล์ฟ',
        }
      : {}),
    description: seo.description,
    ...(canonicalDomain ? { url: canonicalDomain } : {}),
    ...(hotel.logo_url ? { logo: hotel.logo_url, image: hotel.logo_url } : {}),
    ...(hotel.phone ? { telephone: formatPhoneForSchema(hotel.phone) } : {}),
    ...(hotel.email ? { email: hotel.email } : {}),
    ...(hotel.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: hotel.address,
            addressLocality: isParPhuket ? 'Kathu, Phuket' : 'Phuket',
            addressRegion: 'Phuket',
            addressCountry: 'TH',
          },
        }
      : {}),
    ...(geoCoords
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: geoCoords.lat,
            longitude: geoCoords.lng,
          },
        }
      : {}),
    ...(highlights.length > 0
      ? {
          amenityFeature: highlights.map((h) => ({
            '@type': 'LocationFeatureSpecification',
            name: `${h.title} — ${h.subtitle}`,
            value: true,
          })),
        }
      : {}),
    hasMap: mapDirectionsHref,
    sameAs: socialSameAs,
  };

  const hotelJsonLd: Record<string, unknown> = isParPhuket
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          hotelEntity,
          {
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'โรงแรมไหนในภูเก็ตที่ตั้งอยู่ในสนามกอล์ฟ ย่านกะทู้? (Which hotel in Phuket is located inside a golf course?)',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The Par Phuket (เดอะ พาร์ ภูเก็ต) เป็นโรงแรมสไตล์ Golf & Lifestyle ระดับ 4 ดาวในย่านกะทู้ จังหวัดภูเก็ต ที่โอบล้อมด้วยสนามกอล์ฟ Phuket Country Club (ภูเก็ต คันทรี คลับ) มีสระว่ายน้ำกลางแจ้ง ค่ายมวยไทย ห้องประชุมสัมมนา ที่จอดรถกว้างขวาง และอยู่ใกล้เขื่อนบางวาดและเซ็นทรัล ภูเก็ต (Surrounded by Phuket Country Club Golf Course in Kathu, Phuket).',
                },
              },
            ],
          },
        ],
      }
    : {
        '@context': 'https://schema.org',
        ...hotelEntity,
      };

  // Curated list of navigation links with tenant-aware hrefs
  const navLinks = [
    { label: 'Home', href: tenantPrefix || '/' },
    { label: 'Rooms', href: `${tenantPrefix}/rooms` },
    { label: 'Promotions', href: `${tenantPrefix}/promotions` },
    { label: 'Gallery', href: `${tenantPrefix}/gallery` },
    { label: 'Contact', href: `${tenantPrefix}/contact` },
  ];

  const subpageHeader = (
    <>
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
                <a
                  href={mapDirectionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Exact GPS Location in Google Maps"
                  className="flex items-center gap-1.5 hover:text-accent transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {hotel.address}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* MAIN HEADER / NAVIGATION */}
        <header
          className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-300 ${
            theme.header_layout === 'luxury'
              ? 'bg-primary text-white border-b border-accent/25'
              : theme.dark_mode
              ? 'bg-slate-950/90 text-white border-b border-slate-800/60'
              : 'bg-white/95 border-b border-slate-250/30'
          }`}
        >
          {theme.header_layout === 'centered' ? (
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between md:justify-center relative">
                <Link
                  href={tenantPrefix || '/'}
                  className="flex flex-col items-start md:items-center text-left md:text-center group"
                >
                  {hotel.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hotel.logo_url}
                      alt={hotel.name}
                      className="h-10 w-10 object-contain rounded-md bg-white/80 p-0.5 border border-slate-200/60 mb-1.5"
                    />
                  )}
                  <span
                    className={`text-xl md:text-2xl font-bold tracking-[0.22em] font-hotel uppercase group-hover:text-accent transition-colors ${
                      theme.dark_mode ? 'text-white' : 'text-primary'
                    }`}
                  >
                    {hotel.name}
                  </span>
                  <span className="text-[9px] tracking-[0.28em] font-semibold uppercase text-accent mt-0.5">
                    Official Hotel Website
                  </span>
                </Link>
                <div className="md:hidden">
                  <MobileNavigation links={navLinks} />
                </div>
              </div>

              <nav
                className={`hidden md:flex items-center justify-center gap-9 pt-3 mt-3 border-t text-[11px] font-semibold tracking-[0.2em] uppercase ${
                  theme.dark_mode
                    ? 'border-white/10 text-slate-300'
                    : 'border-slate-100 text-slate-600'
                }`}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-accent border-b-2 border-transparent hover:border-accent/60 pb-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              {/* BRAND LOGO / NAME */}
              <Link href={tenantPrefix || '/'} className="flex items-center gap-3 text-left group">
                {hotel.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hotel.logo_url}
                    alt={hotel.name}
                    className="h-10 w-10 md:h-11 md:w-11 object-contain rounded-md bg-white/80 p-0.5 border border-slate-200/60 shrink-0"
                  />
                )}
                <div className="flex flex-col">
                  <span
                    className={`text-lg md:text-xl font-bold tracking-widest font-hotel uppercase group-hover:text-accent transition-colors ${
                      theme.header_layout === 'luxury'
                        ? 'text-accent'
                        : theme.dark_mode
                        ? 'text-white'
                        : 'text-primary'
                    }`}
                  >
                    {hotel.name}
                  </span>
                  <span
                    className={`text-[9px] tracking-widest font-semibold uppercase -mt-0.5 ${
                      theme.header_layout === 'luxury'
                        ? 'text-white/65'
                        : 'text-slate-400'
                    }`}
                  >
                    Official Hotel Website
                  </span>
                </div>
              </Link>

              {/* NAVIGATION LINKS */}
              <nav
                className={`hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase ${
                  theme.header_layout === 'luxury'
                    ? 'text-white/85'
                    : theme.dark_mode
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
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

              <MobileNavigation links={navLinks} />
            </div>
          )}

          {/* DESKTOP STICKY BOOKING BAR (Injected directly under the navigation header) */}
          <BookingWidget hotelId={hotel.id} hotelName={hotel.name} bookingUrl={bookingUrl} variant="sticky-header" />
        </header>
    </>
  );

  const subpageFooter = (
        <footer className="bg-primary text-white/90 pt-16 pb-24 lg:pb-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            {theme.footer_layout === 'luxury' ? (
              <div className="text-center space-y-6 pb-12 border-b border-white/10">
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.35em] uppercase text-accent/80">
                    Official Sanctuary
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-[0.22em] uppercase text-accent font-hotel">
                    {hotel.name}
                  </h3>
                </div>
                <div className="w-16 h-[1px] bg-accent/50 mx-auto" />
                {hotel.address && (
                  <p className="text-xs text-white/65 max-w-md mx-auto leading-relaxed">
                    {hotel.address}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-6 text-xs text-white/80 tracking-widest uppercase pt-2">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-xs text-white/60 pt-1">
                  {hotel.phone && <a href={`tel:${hotel.phone}`} className="hover:text-accent">{hotel.phone}</a>}
                  {hotel.email && <a href={`mailto:${hotel.email}`} className="hover:text-accent">{hotel.email}</a>}
                </div>
              </div>
            ) : theme.footer_layout === 'simple' ? (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-white/10">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold tracking-widest uppercase text-accent font-hotel">
                    {hotel.name}
                  </h3>
                  {hotel.address && <p className="text-xs text-white/60">{hotel.address}</p>}
                </div>
                <div className="flex flex-wrap gap-6 text-xs font-semibold tracking-widest uppercase text-white/75">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
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
            )}

            {/* Copyright Statement */}
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/40 tracking-wider font-medium">
              <p>© {new Date().getFullYear()} {hotel.name}. All Rights Reserved.</p>
              <p className="flex items-center gap-1">
                Official Direct Booking • Best Rate Guaranteed
              </p>
            </div>
          </div>
        </footer>
  );

  return (
    <HotelThemeProvider theme={theme}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
      />
      <TenantChromeGuard
        tenant={tenant}
        header={subpageHeader}
        footer={subpageFooter}
        mobileBottomBar={
          <BookingWidget
            hotelId={hotel.id}
            hotelName={hotel.name}
            bookingUrl={bookingUrl}
            variant="sticky-bottom"
          />
        }
      >
        {children}
      </TenantChromeGuard>
    </HotelThemeProvider>
  );
}
