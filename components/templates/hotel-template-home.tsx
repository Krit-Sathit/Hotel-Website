'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Users,
  BedDouble,
  Check,
  Sparkles,
  ArrowRight,
  X,
  Grid,
  Compass,
  ShieldCheck,
  Clock,
  Star,
} from 'lucide-react';
import type {
  Hotel,
  HotelTheme,
  HeroSlide,
  Room,
  Promotion,
  GalleryPhoto,
  HomepageSection,
} from '@/lib/db/mock-data';
import {
  getTemplateByTheme,
  type HotelWebsiteTemplate,
} from '@/lib/hotel-templates';
import TemplateBookingForm from './template-booking-form';
import PromotionsSection from '@/components/sections/promotions-section';
import LocationSection from '@/components/sections/location-section';
import ContactSection from '@/components/sections/contact-section';

export interface HotelTemplateHomeProps {
  hotel: Hotel;
  themeOverride?: HotelTheme;
  templateOverride?: HotelWebsiteTemplate;
  slides: HeroSlide[];
  sections: HomepageSection[];
  rooms: Room[];
  promotions: Promotion[];
  gallery: GalleryPhoto[];
  tenantPrefix?: string;
  bookingUrl: string;
  isPreview?: boolean;
}

function cleanImg(url?: string | null): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/(www\.)?flowstay\.live\/storage\//i, '/storage/')
    .replace(/^http:\/\/flowstay\.live\//i, 'https://flowstay.live/');
}

function getButtonRadius(theme: HotelTheme): string {
  if (theme.button_style === 'square') return '0px';
  if (theme.button_style === 'pill') return '9999px';
  return theme.border_radius || '8px';
}

export default function HotelTemplateHome({
  hotel,
  themeOverride,
  templateOverride,
  slides,
  sections,
  rooms,
  promotions,
  gallery,
  tenantPrefix = '',
  bookingUrl,
  isPreview = false,
}: HotelTemplateHomeProps) {
  const activeTheme = themeOverride || hotel.theme;
  const template = templateOverride || getTemplateByTheme(activeTheme);

  const [slideIdx, setSlideIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const isDark = Boolean(activeTheme.dark_mode);
  const bgColor = activeTheme.background_color || (isDark ? '#0b0f19' : '#ffffff');
  const textColor = activeTheme.text_color || (isDark ? '#f8fafc' : '#0f172a');
  const mutedText = isDark ? 'rgba(248,250,252,0.68)' : '#64748b';
  const cardBg = isDark ? '#131b2e' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const subtleSurface = isDark ? '#0f172a' : '#f8fafc';
  const btnRadius = getButtonRadius(activeTheme);
  const fontStack = `'${activeTheme.font_family || 'Inter'}', sans-serif`;

  // Collect rich visual pool from slides + gallery + rooms
  const heroPhotos = useMemo(() => {
    const list: string[] = [];
    for (const s of slides) {
      const u = cleanImg(s.image_url);
      if (u && !list.includes(u)) list.push(u);
    }
    for (const g of gallery) {
      const u = cleanImg(g.image_url);
      if (u && !list.includes(u) && list.length < 10) list.push(u);
    }
    for (const r of rooms) {
      for (const img of r.gallery || []) {
        const u = cleanImg(img);
        if (u && !list.includes(u) && list.length < 10) list.push(u);
      }
    }
    if (list.length === 0) list.push(template.fallbackHeroImage);
    return list;
  }, [slides, gallery, rooms, template.fallbackHeroImage]);

  const currentHeroImg = heroPhotos[slideIdx % heroPhotos.length] || template.fallbackHeroImage;

  const aboutData = useMemo(() => {
    const found = sections.find((s) => s.section_type === 'about' && s.is_enabled);
    const content = found?.content || {};
    return {
      badge: content.badge || 'Official Hotel Website',
      subtitle: content.subtitle || `Welcome to ${hotel.name}`,
      title: content.title || hotel.name,
      description:
        content.description ||
        `Experience warm hospitality, thoughtfully designed accommodations, and effortless comfort at ${hotel.name}. Book directly on our official website for exclusive rates and privileges.`,
      primaryImage: cleanImg(content.primary_image_url) || heroPhotos[1] || heroPhotos[0],
      secondaryImage: cleanImg(content.secondary_image_url) || heroPhotos[2] || heroPhotos[0],
      features:
        Array.isArray(content.features) && content.features.length > 0
          ? content.features
          : [
              { title: 'Best Rate Guaranteed', desc: 'Exclusive direct booking rates & perks.' },
              { title: 'Prime Location', desc: hotel.address || 'Conveniently situated for your stay.' },
            ],
    };
  }, [sections, hotel.name, hotel.address, heroPhotos]);

  const facilitiesData = useMemo(() => {
    const found = sections.find((s) => s.section_type === 'facilities' && s.is_enabled);
    const items = found?.content?.items;
    if (Array.isArray(items) && items.length > 0) return items.slice(0, 8);
    return [
      { title: 'High-Speed Wi-Fi', desc: 'Complimentary wireless internet access throughout the property.' },
      { title: 'Warm Hospitality', desc: 'Attentive front desk & personalized local recommendations.' },
      { title: 'Curated Comfort', desc: 'Premium bedding, climate control, and spotless housekeeping.' },
      { title: 'Direct Booking Perks', desc: 'Instant confirmation and priority room allocation.' },
    ];
  }, [sections]);

  const navLinks = [
    { label: 'Home', href: isPreview ? '#top' : tenantPrefix || '/' },
    { label: 'Rooms', href: isPreview ? '#rooms' : `${tenantPrefix}/rooms` },
    { label: 'Promotions', href: isPreview ? '#promotions' : `${tenantPrefix}/promotions` },
    { label: 'Gallery', href: isPreview ? '#gallery' : `${tenantPrefix}/gallery` },
    { label: 'Contact', href: isPreview ? '#contact' : `${tenantPrefix}/contact` },
  ];

  const openLightbox = (photos: string[], idx: number, title: string) => {
    const valid = photos.map(cleanImg).filter(Boolean);
    if (valid.length === 0) return;
    setLightboxPhotos(valid);
    setLightboxIdx(idx);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  const getReserveHref = (roomId?: string) => {
    if (isPreview) return '#rooms';
    if (!roomId) return bookingUrl;
    return `${bookingUrl}${bookingUrl.includes('?') ? '&' : '?'}roomTypeId=${encodeURIComponent(roomId)}`;
  };

  // =========================================================================
  // HEADER RENDERER (Adapts to template shellStyle & header_layout)
  // =========================================================================
  const renderTopHeader = () => {
    // Floating Pill Navbar (#03)
    if (template.shellStyle === 'floating-pill-nav') {
      return (
        <header className="sticky top-3 z-40 px-4 md:px-8 pt-3">
          <div
            className="max-w-7xl mx-auto px-6 py-3.5 shadow-lg border backdrop-blur-xl flex items-center justify-between"
            style={{
              backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.94)',
              borderColor: cardBorder,
              borderRadius: '9999px',
            }}
          >
            <Link
              href={isPreview ? '#top' : tenantPrefix || '/'}
              className="flex items-center gap-2.5 text-left"
            >
              {hotel.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanImg(hotel.logo_url)}
                  alt={hotel.name}
                  className="w-8 h-8 rounded-full object-contain bg-white border border-slate-200 p-0.5"
                />
              )}
              <span
                className="text-base md:text-lg font-bold uppercase tracking-widest"
                style={{ color: isDark ? '#ffffff' : activeTheme.primary_color, fontFamily: fontStack }}
              >
                {hotel.name}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="hover:opacity-75 transition-opacity"
                  style={{ color: textColor }}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <a
              href={getReserveHref()}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: activeTheme.primary_color,
                color: '#ffffff',
                borderRadius: '9999px',
              }}
            >
              Book Stay
            </a>
          </div>
        </header>
      );
    }

    // Newspaper / Magazine Masthead (#09)
    if (template.heroLayout === 'magazine-masthead') {
      return (
        <header
          className="border-b px-6 py-5"
          style={{ backgroundColor: bgColor, borderColor: `${textColor}22` }}
        >
          <div className="max-w-7xl mx-auto space-y-4">
            <div
              className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] pb-3 border-b"
              style={{ color: mutedText, borderColor: `${textColor}15` }}
            >
              <span>{hotel.address || 'Thailand'}</span>
              <span>Official Direct Edition</span>
              <span>{hotel.phone || 'Direct Reservations'}</span>
            </div>
            <div className="text-center py-2">
              <h1
                className="text-3xl md:text-5xl font-bold uppercase tracking-[0.18em]"
                style={{ color: textColor, fontFamily: fontStack }}
              >
                {hotel.name}
              </h1>
            </div>
            <nav
              className="flex flex-wrap items-center justify-center gap-8 pt-3 border-t text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ borderColor: `${textColor}15`, color: textColor }}
            >
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className="hover:opacity-70">
                  {l.label}
                </a>
              ))}
              <a
                href={getReserveHref()}
                style={{ color: activeTheme.accent_color }}
              >
                Reserve Direct →
              </a>
            </nav>
          </div>
        </header>
      );
    }

    // Standard / Centered / Luxury Top Header
    const isLux = activeTheme.header_layout === 'luxury';
    const isCentered = activeTheme.header_layout === 'centered';

    return (
      <>
        {/* Top Utility Strip */}
        <div
          className="hidden lg:block w-full py-2 px-6 text-[11px] tracking-wider border-b"
          style={{
            backgroundColor: activeTheme.primary_color,
            color: 'rgba(255,255,255,0.82)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-5">
              {hotel.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" style={{ color: activeTheme.accent_color }} />
                  {hotel.phone}
                </span>
              )}
              {hotel.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" style={{ color: activeTheme.accent_color }} />
                  {hotel.email}
                </span>
              )}
            </div>
            {hotel.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" style={{ color: activeTheme.accent_color }} />
                {hotel.address}
              </span>
            )}
          </div>
        </div>

        <header
          className="sticky top-0 z-40 border-b backdrop-blur-md"
          style={{
            backgroundColor: isLux
              ? activeTheme.primary_color
              : isDark
              ? 'rgba(15,23,42,0.94)'
              : 'rgba(255,255,255,0.96)',
            borderColor: isLux ? `${activeTheme.accent_color}35` : cardBorder,
          }}
        >
          {isCentered ? (
            <div className="max-w-7xl mx-auto px-6 py-4 text-center space-y-3">
              <div>
                <a
                  href={isPreview ? '#top' : tenantPrefix || '/'}
                  className="text-xl md:text-2xl font-bold uppercase tracking-[0.22em] block"
                  style={{
                    color: isLux
                      ? activeTheme.accent_color
                      : isDark
                      ? '#ffffff'
                      : activeTheme.primary_color,
                    fontFamily: fontStack,
                  }}
                >
                  {hotel.name}
                </a>
                <span
                  className="text-[9px] uppercase tracking-[0.3em] font-semibold"
                  style={{ color: activeTheme.accent_color }}
                >
                  Official Hotel Website
                </span>
              </div>
              <nav
                className="flex flex-wrap items-center justify-center gap-8 pt-2.5 border-t text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  borderColor: isLux || isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                  color: isLux || isDark ? 'rgba(255,255,255,0.85)' : '#475569',
                }}
              >
                {navLinks.map((l) => (
                  <a key={l.label} href={l.href} className="hover:opacity-75">
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
              <a
                href={isPreview ? '#top' : tenantPrefix || '/'}
                className="flex items-center gap-3 text-left"
              >
                {hotel.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cleanImg(hotel.logo_url)}
                    alt={hotel.name}
                    className="w-10 h-10 rounded-md object-contain bg-white border border-slate-200 p-0.5"
                  />
                )}
                <div>
                  <span
                    className="text-lg md:text-xl font-bold uppercase tracking-widest block"
                    style={{
                      color: isLux
                        ? activeTheme.accent_color
                        : isDark
                        ? '#ffffff'
                        : activeTheme.primary_color,
                      fontFamily: fontStack,
                    }}
                  >
                    {hotel.name}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-widest font-semibold block -mt-0.5"
                    style={{
                      color: isLux ? 'rgba(255,255,255,0.6)' : '#94a3b8',
                    }}
                  >
                    Official Hotel Website
                  </span>
                </div>
              </a>

              <nav
                className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-widest"
                style={{
                  color: isLux || isDark ? 'rgba(255,255,255,0.85)' : '#475569',
                }}
              >
                {navLinks.map((l) => (
                  <a key={l.label} href={l.href} className="hover:opacity-75">
                    {l.label}
                  </a>
                ))}
              </nav>

              <a
                href={getReserveHref()}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0"
                style={{
                  backgroundColor: isLux ? activeTheme.accent_color : activeTheme.primary_color,
                  color: isLux && activeTheme.dark_mode ? '#090d16' : '#ffffff',
                  borderRadius: btnRadius,
                }}
              >
                Book Now
              </a>
            </div>
          )}

          {/* Classic Resort (#01) & Grand Palace (#04) include the horizontal sticky bar directly below nav */}
          {(template.heroLayout === 'full-slider' ||
            template.heroLayout === 'cinema-crest' ||
            template.heroLayout === 'triptych-panels') && (
            <TemplateBookingForm
              hotelId={hotel.id}
              hotelName={hotel.name}
              bookingUrl={bookingUrl}
              theme={activeTheme}
              variant="horizontal"
              isPreview={isPreview}
            />
          )}
        </header>
      </>
    );
  };

  // =========================================================================
  // 16 DISTINCT HERO COMPOSITIONS
  // =========================================================================
  const renderHero = () => {
    switch (template.heroLayout) {
      // #02 SPLIT-SCREEN 50/50 EDITORIAL
      case 'split-screen':
        return (
          <section className="w-full border-b" style={{ borderColor: cardBorder }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
              {/* Left 50%: Editorial Typography + Direct Booking Card */}
              <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-center space-y-6 text-left">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.28em]"
                  style={{ color: activeTheme.accent_color }}
                >
                  {aboutData.badge}
                </span>
                <h1
                  className="text-3xl md:text-5xl font-bold leading-tight"
                  style={{ color: textColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </h1>
                <p className="text-sm leading-relaxed max-w-lg" style={{ color: mutedText }}>
                  {aboutData.description}
                </p>
                <div className="pt-2 max-w-md">
                  <TemplateBookingForm
                    hotelId={hotel.id}
                    hotelName={hotel.name}
                    bookingUrl={bookingUrl}
                    theme={activeTheme}
                    variant="vertical-card"
                    isPreview={isPreview}
                  />
                </div>
              </div>

              {/* Right 50%: Tall Portrait Visual Showcase */}
              <div className="lg:col-span-6 relative min-h-[420px] lg:min-h-full overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentHeroImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                {heroPhotos.length > 1 && (
                  <div className="absolute bottom-5 right-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx((p) => (p - 1 + heroPhotos.length) % heroPhotos.length)
                      }
                      className="p-2.5 bg-white/90 text-slate-900 shadow-md cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideIdx((p) => (p + 1) % heroPhotos.length)}
                      className="p-2.5 bg-white/90 text-slate-900 shadow-md cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      // #03 FLOATING GLASS & FRAMED ROUNDED HERO
      case 'floating-dock':
        return (
          <section className="px-4 md:px-8 pt-4 pb-12">
            <div className="max-w-7xl mx-auto relative">
              <div className="relative h-[440px] md:h-[540px] rounded-[28px] overflow-hidden shadow-xl bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentHeroImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="-mt-10 relative z-20 px-4">
                <TemplateBookingForm
                  hotelId={hotel.id}
                  hotelName={hotel.name}
                  bookingUrl={bookingUrl}
                  theme={activeTheme}
                  variant="floating-glass"
                  isPreview={isPreview}
                />
              </div>
            </div>
          </section>
        );

      // #04 GRAND PALACE FLANKED CINEMA HERO
      case 'cinema-crest':
        return (
          <section className="py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 h-[420px] md:h-[520px]">
              <div className="hidden md:block col-span-2 overflow-hidden opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhotos[(slideIdx + 1) % heroPhotos.length]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-12 md:col-span-8 relative overflow-hidden shadow-xl border-2" style={{ borderColor: `${activeTheme.accent_color}55` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentHeroImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block col-span-2 overflow-hidden opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhotos[(slideIdx + 2) % heroPhotos.length]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
        );

      // #05 5-PHOTO BOUTIQUE MOSAIC COLLAGE (Airbnb Luxe Style)
      case 'photo-mosaic':
        return (
          <section className="max-w-7xl mx-auto px-6 pt-8 pb-4 space-y-4 text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: activeTheme.accent_color }}
                >
                  Official Direct Property
                </span>
                <h1
                  className="text-2xl md:text-4xl font-bold mt-1"
                  style={{ color: textColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </h1>
                {hotel.address && (
                  <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: mutedText }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: activeTheme.accent_color }} />
                    {hotel.address}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => openLightbox(heroPhotos, 0, hotel.name)}
                className="self-start md:self-auto px-4 py-2 border text-xs font-bold flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  color: textColor,
                  borderRadius: btnRadius,
                }}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>View All {heroPhotos.length} Photos</span>
              </button>
            </div>

            {/* 5-Photo Collage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 h-[360px] md:h-[460px] rounded-2xl overflow-hidden">
              <div
                onClick={() => openLightbox(heroPhotos, 0, hotel.name)}
                className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer group bg-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhotos[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {[1, 2, 3, 4].map((offset) => (
                <div
                  key={offset}
                  onClick={() =>
                    openLightbox(heroPhotos, offset % heroPhotos.length, hotel.name)
                  }
                  className="hidden md:block relative overflow-hidden cursor-pointer group bg-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[offset % heroPhotos.length]}
                    alt={`${hotel.name} ${offset + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </section>
        );

      // #06 KYOTO ZEN FRAMED WHITESPACE
      case 'zen-framed':
        return (
          <section className="max-w-6xl mx-auto px-6 md:px-12 py-10 space-y-8">
            <div className="flex items-stretch gap-6">
              <div
                className="hidden md:flex flex-col justify-between py-2 text-[10px] uppercase tracking-[0.35em]"
                style={{ writingMode: 'vertical-rl', color: mutedText }}
              >
                <span>{hotel.name}</span>
                <span style={{ color: activeTheme.accent_color }}>Sanctuary of Calm</span>
              </div>
              <div className="flex-1 h-[380px] md:h-[500px] overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentHeroImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <TemplateBookingForm
              hotelId={hotel.id}
              hotelName={hotel.name}
              bookingUrl={bookingUrl}
              theme={activeTheme}
              variant="minimal-line"
              isPreview={isPreview}
            />
          </section>
        );

      // #07 CURVED COASTAL PANORAMA
      case 'curved-coastal':
        return (
          <section className="pb-10">
            <div className="relative h-[440px] md:h-[540px] w-full overflow-hidden rounded-b-[48px] md:rounded-b-[80px] shadow-lg bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImg}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="-mt-9 relative z-20 px-6">
              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="floating-glass"
                isPreview={isPreview}
              />
            </div>
          </section>
        );

      // #08 SIDEBAR ATELIER RIGHT CANVAS HERO
      case 'sidebar-canvas':
        return (
          <section className="p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[480px]">
              <div className="lg:col-span-8 h-[340px] lg:h-full overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhotos[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 h-full">
                <div className="h-44 lg:h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[1 % heroPhotos.length]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-44 lg:h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[2 % heroPhotos.length]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <TemplateBookingForm
              hotelId={hotel.id}
              hotelName={hotel.name}
              bookingUrl={bookingUrl}
              theme={activeTheme}
              variant="minimal-line"
              isPreview={isPreview}
            />
          </section>
        );

      // #09 MAGAZINE 3-COLUMN EDITORIAL FEATURE
      case 'magazine-masthead':
        return (
          <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-3 flex flex-col justify-between border-y py-5 text-left space-y-4" style={{ borderColor: `${textColor}20` }}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: activeTheme.accent_color }}>
                    01 / The Destination
                  </span>
                  <h2 className="text-xl font-bold leading-snug" style={{ fontFamily: fontStack }}>
                    A Curated Escape in {hotel.address || 'Thailand'}
                  </h2>
                  <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
                    {aboutData.description}
                  </p>
                </div>
                <div className="h-40 overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[1 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="lg:col-span-6 h-[380px] lg:h-[480px] overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroPhotos[0]} alt={hotel.name} className="w-full h-full object-cover" />
              </div>

              <div className="lg:col-span-3 flex flex-col justify-between border-y py-5 text-left space-y-4" style={{ borderColor: `${textColor}20` }}>
                <div className="h-40 overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[2 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: activeTheme.accent_color }}>
                    02 / Direct Privileges
                  </span>
                  <h3 className="text-lg font-bold" style={{ fontFamily: fontStack }}>
                    {rooms.length || 4} Signature Room Categories
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
                    Instant reservation confirmation with guaranteed official direct rates.
                  </p>
                </div>
              </div>
            </div>

            <TemplateBookingForm
              hotelId={hotel.id}
              hotelName={hotel.name}
              bookingUrl={bookingUrl}
              theme={activeTheme}
              variant="minimal-line"
              isPreview={isPreview}
            />
          </section>
        );

      // #10 HERO WITH RIGHT FLOATING VERTICAL CHECK-IN CARD
      case 'booking-card-hero':
        return (
          <section className="relative w-full min-h-[540px] flex items-center py-12 px-6 overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentHeroImg}
              alt={hotel.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7" />
              <div className="lg:col-span-5">
                <TemplateBookingForm
                  hotelId={hotel.id}
                  hotelName={hotel.name}
                  bookingUrl={bookingUrl}
                  theme={activeTheme}
                  variant="vertical-card"
                  isPreview={isPreview}
                />
              </div>
            </div>
          </section>
        );

      // #11 MEDITERRANEAN 3-ARCHED COURTYARD WINDOWS
      case 'arched-courtyard':
        return (
          <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => openLightbox(heroPhotos, i % heroPhotos.length, hotel.name)}
                  className={`overflow-hidden rounded-t-[220px] rounded-b-2xl shadow-lg cursor-pointer bg-slate-200 ${
                    i === 1 ? 'h-[420px] md:-mt-4' : 'h-[380px]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[i % heroPhotos.length]}
                    alt={hotel.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
            <TemplateBookingForm
              hotelId={hotel.id}
              hotelName={hotel.name}
              bookingUrl={bookingUrl}
              theme={activeTheme}
              variant="floating-glass"
              isPreview={isPreview}
            />
          </section>
        );

      // #12 WIDESCREEN 21:9 DARK CINEMA NOIR
      case 'widescreen-noir':
        return (
          <section className="py-8 px-4 md:px-10 space-y-6" style={{ backgroundColor: bgColor }}>
            <div className="max-w-7xl mx-auto overflow-hidden aspect-[21/9] min-h-[300px] border shadow-2xl relative" style={{ borderColor: `${activeTheme.accent_color}40` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImg}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-2">
              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="dark-command"
                isPreview={isPreview}
              />
            </div>
          </section>
        );

      // #13 STORY & BOOKING BAR ABOVE WIDE NATURE WINDOW
      case 'story-above-hero':
        return (
          <section className="max-w-7xl mx-auto px-6 py-12 space-y-8 text-center">
            <div className="max-w-2xl mx-auto space-y-3">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.28em] px-3.5 py-1 rounded-full border"
                style={{
                  color: activeTheme.accent_color,
                  borderColor: `${activeTheme.accent_color}40`,
                }}
              >
                {aboutData.badge}
              </span>
              <h1
                className="text-3xl md:text-5xl font-bold tracking-wide"
                style={{ color: textColor, fontFamily: fontStack }}
              >
                {hotel.name}
              </h1>
              <p className="text-xs md:text-sm leading-relaxed" style={{ color: mutedText }}>
                {aboutData.description}
              </p>
            </div>

            <TemplateBookingForm
              hotelId={hotel.id}
              hotelName={hotel.name}
              bookingUrl={bookingUrl}
              theme={activeTheme}
              variant="floating-glass"
              isPreview={isPreview}
            />

            <div className="h-[380px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImg}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        );

      // #14 COMPACT DIRECT-BOOKING PRO (Immediate conversion above the fold)
      case 'compact-direct':
        return (
          <section className="border-b" style={{ backgroundColor: subtleSurface, borderColor: cardBorder }}>
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[260px] rounded-xl overflow-hidden">
                <div className="md:col-span-6 h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[0]} alt={hotel.name} className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block md:col-span-3 h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[1 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block md:col-span-3 h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[2 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="floating-glass"
                isPreview={isPreview}
              />
            </div>
          </section>
        );

      // #15 3-PANEL VERTICAL TRIPTYCH GALLERIA
      case 'triptych-panels':
        return (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[420px] md:h-[520px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => openLightbox(heroPhotos, i % heroPhotos.length, hotel.name)}
                  className="relative overflow-hidden border-2 cursor-pointer group bg-slate-200"
                  style={{ borderColor: `${activeTheme.accent_color}55` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[i % heroPhotos.length]}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
          </section>
        );

      // #16 MODULAR BENTO CARD-STACK
      case 'bento-stack':
        return (
          <section className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-5">
            <div
              className="p-4 md:p-6 rounded-[28px] shadow-sm border space-y-5"
              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-8 h-[340px] md:h-[420px] rounded-[22px] overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentHeroImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="lg:col-span-4 p-6 md:p-8 rounded-[22px] flex flex-col justify-between text-left"
                  style={{ backgroundColor: activeTheme.primary_color, color: '#ffffff' }}
                >
                  <div className="space-y-3">
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#ffffff' }}
                    >
                      Direct Official Stay
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold leading-snug" style={{ fontFamily: fontStack }}>
                      {hotel.name}
                    </h1>
                    <p className="text-xs leading-relaxed opacity-80">
                      {aboutData.description}
                    </p>
                  </div>
                  <div className="pt-6 flex items-center gap-4 text-xs opacity-90">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" style={{ color: activeTheme.accent_color }} />
                      Best Direct Rate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" style={{ color: activeTheme.accent_color }} />
                      Instant Confirm
                    </span>
                  </div>
                </div>
              </div>

              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="floating-glass"
                isPreview={isPreview}
              />
            </div>
          </section>
        );

      // #01 CLASSIC FULL-BLEED SLIDER (Default)
      case 'full-slider':
      default:
        return (
          <section className="relative w-full h-[60vh] md:h-[76vh] overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentHeroImg}
              alt={hotel.name}
              className="w-full h-full object-cover transition-all duration-700"
            />
            {heroPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSlideIdx((p) => (p - 1 + heroPhotos.length) % heroPhotos.length)
                  }
                  className="absolute left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/35 hover:bg-black/55 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIdx((p) => (p + 1) % heroPhotos.length)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/35 hover:bg-black/55 text-white cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </section>
        );
    }
  };

  // =========================================================================
  // DISTINCT ROOMS SHOWCASE LAYOUTS (10 Structural Layouts!)
  // =========================================================================
  const renderRoomsSection = () => {
    if (rooms.length === 0) return null;

    const sectionWrapClass =
      template.shellStyle === 'card-stack-canvas'
        ? 'max-w-7xl mx-auto px-4 md:px-6 py-4'
        : 'w-full py-16 md:py-24 px-6';

    const innerCardWrap =
      template.shellStyle === 'card-stack-canvas'
        ? 'p-6 md:p-10 rounded-[28px] bg-white border border-slate-200 shadow-xs space-y-10'
        : 'max-w-7xl mx-auto space-y-12';

    return (
      <section id="rooms" className={sectionWrapClass}>
        <div className={innerCardWrap}>
          {/* Section Heading */}
          <div
            className={`space-y-2.5 ${
              template.roomsLayout === 'zen-minimal-list' ||
              template.roomsLayout === 'sidebar-sticky-list' ||
              template.roomsLayout === 'rate-table-pro'
                ? 'text-left'
                : 'text-center max-w-2xl mx-auto'
            }`}
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] block"
              style={{ color: activeTheme.accent_color }}
            >
              Accommodations & Suites
            </span>
            <h2
              className="text-2xl md:text-4xl font-bold tracking-wide"
              style={{ color: textColor, fontFamily: fontStack }}
            >
              Choose Your Stay at {hotel.name}
            </h2>
          </div>

          {/* LAYOUT A: ZIG-ZAG ALTERNATING HORIZONTAL SHOWCASE (#02 & #08) */}
          {template.roomsLayout === 'zigzag-horizontal' && (
            <div className="space-y-12">
              {rooms.map((room, idx) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const reversed = idx % 2 === 1;
                return (
                  <div
                    key={room.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border p-5 md:p-8"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderRadius: btnRadius === '0px' ? '0px' : '20px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className={`lg:col-span-7 aspect-[16/10] overflow-hidden cursor-pointer relative group bg-slate-200 ${
                        reversed ? 'lg:order-2' : ''
                      }`}
                      style={{ borderRadius: btnRadius === '0px' ? '0px' : '14px' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {photos.length > 1 && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[11px] font-semibold bg-black/70 text-white rounded">
                          {photos.length} photos
                        </span>
                      )}
                    </div>

                    <div
                      className={`lg:col-span-5 space-y-5 text-left ${
                        reversed ? 'lg:order-1' : ''
                      }`}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.25em]"
                        style={{ color: activeTheme.accent_color }}
                      >
                        Suite 0{idx + 1}
                      </span>
                      <h3
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: textColor, fontFamily: fontStack }}
                      >
                        {room.name}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
                        {room.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold pt-1" style={{ color: mutedText }}>
                        <span className="flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5" style={{ color: activeTheme.accent_color }} />
                          {room.room_size} m²
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" style={{ color: activeTheme.accent_color }} />
                          Max {room.max_guests} Guests
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="w-3.5 h-3.5" style={{ color: activeTheme.accent_color }} />
                          {room.bed_type}
                        </span>
                      </div>

                      <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: cardBorder }}>
                        {(room.price ?? 0) > 0 ? (
                          <div>
                            <span className="text-[10px] uppercase block" style={{ color: mutedText }}>
                              Direct Rate From
                            </span>
                            <span className="text-xl font-bold" style={{ color: textColor }}>
                              ฿{Number(room.price ?? 0).toLocaleString()}
                              <span className="text-xs font-normal opacity-70"> / night</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold" style={{ color: activeTheme.accent_color }}>
                            Best Direct Rate
                          </span>
                        )}

                        <a
                          href={getReserveHref(room.id)}
                          className="px-6 py-3 text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: activeTheme.primary_color,
                            color: '#ffffff',
                            borderRadius: btnRadius,
                          }}
                        >
                          Reserve →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT B: 3-COLUMN BENTO MODERN CARDS (#03, #09, #16) */}
          {template.roomsLayout === 'grid-3-bento' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="border overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col text-left group"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderRadius: '22px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {(room.price ?? 0) > 0 && (
                        <span
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md"
                          style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#0f172a' }}
                        >
                          ฿{Number(room.price ?? 0).toLocaleString()} / คืน
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs line-clamp-2" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[11px]" style={{ color: mutedText }}>
                          <span>{room.room_size} m²</span>
                          <span>•</span>
                          <span>Max {room.max_guests}</span>
                          <span>•</span>
                          <span>{room.bed_type}</span>
                        </div>
                        <a
                          href={getReserveHref(room.id)}
                          className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider block"
                          style={{
                            backgroundColor: activeTheme.primary_color,
                            color: '#ffffff',
                            borderRadius: btnRadius,
                          }}
                        >
                          Book This Room
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT C: STICKY BOOKING SIDEBAR + ROOM LIST (#05 Mosaic) */}
          {template.roomsLayout === 'sidebar-sticky-list' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-5">
                {rooms.map((room) => {
                  const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                  const cover = photos[0] || currentHeroImg;
                  return (
                    <div
                      key={room.id}
                      className="border p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-5 items-center text-left"
                      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                    >
                      <div
                        onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                        className="sm:col-span-5 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer relative bg-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="sm:col-span-7 space-y-3">
                        <h3 className="text-lg font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs line-clamp-2" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(room.amenities || []).slice(0, 4).map((am) => (
                            <span
                              key={am}
                              className="text-[10px] px-2.5 py-0.5 rounded-full border"
                              style={{ borderColor: cardBorder, color: mutedText }}
                            >
                              {am}
                            </span>
                          ))}
                        </div>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-base font-bold" style={{ color: textColor }}>
                            {(room.price ?? 0) > 0 ? `฿${Number(room.price ?? 0).toLocaleString()} / night` : 'Check Rates'}
                          </span>
                          <a
                            href={getReserveHref(room.id)}
                            className="px-4 py-2 text-xs font-bold uppercase"
                            style={{
                              backgroundColor: activeTheme.primary_color,
                              color: '#ffffff',
                              borderRadius: btnRadius,
                            }}
                          >
                            Select Room
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <TemplateBookingForm
                  hotelId={hotel.id}
                  hotelName={hotel.name}
                  bookingUrl={bookingUrl}
                  theme={activeTheme}
                  variant="vertical-card"
                  isPreview={isPreview}
                />
              </div>
            </div>
          )}

          {/* LAYOUT D: FULL-WIDTH LUXURY SUITE ROWS (#04 & #13) */}
          {template.roomsLayout === 'luxury-rows' && (
            <div className="space-y-6">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="border p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderRadius: btnRadius === '9999px' ? '24px' : '8px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="lg:col-span-4 aspect-[16/10] overflow-hidden cursor-pointer bg-slate-200 rounded-lg"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="lg:col-span-5 space-y-2.5">
                      <h3 className="text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                        {room.name}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedText }}>
                        {room.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs pt-1" style={{ color: mutedText }}>
                        <span>{room.room_size} m²</span>
                        <span>•</span>
                        <span>Up to {room.max_guests} Guests</span>
                        <span>•</span>
                        <span>{room.bed_type}</span>
                      </div>
                    </div>
                    <div className="lg:col-span-3 lg:border-l lg:pl-6 flex lg:flex-col items-center lg:items-end justify-between gap-3" style={{ borderColor: cardBorder }}>
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase tracking-wider block" style={{ color: mutedText }}>
                          Official Rate
                        </span>
                        <span className="text-2xl font-bold" style={{ color: activeTheme.accent_color }}>
                          {(room.price ?? 0) > 0 ? `฿${Number(room.price ?? 0).toLocaleString()}` : 'Available'}
                        </span>
                      </div>
                      <a
                        href={getReserveHref(room.id)}
                        className="px-6 py-3 text-xs font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: activeTheme.primary_color,
                          color: '#ffffff',
                          borderRadius: btnRadius,
                        }}
                      >
                        Reserve Suite
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT E: ZEN MINIMALIST HAIRLINE CATALOGUE (#06) */}
          {template.roomsLayout === 'zen-minimal-list' && (
            <div className="divide-y border-y" style={{ borderColor: `${textColor}20` }}>
              {rooms.map((room, idx) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left"
                  >
                    <div className="md:col-span-1 text-xs font-mono opacity-50">
                      0{idx + 1}
                    </div>
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="md:col-span-4 aspect-[16/10] overflow-hidden cursor-pointer bg-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <h3 className="text-xl font-semibold" style={{ color: textColor, fontFamily: fontStack }}>
                        {room.name}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
                        {room.description}
                      </p>
                      <p className="text-[11px] opacity-70">
                        {room.room_size} m² · {room.bed_type} · Max {room.max_guests} Guests
                      </p>
                    </div>
                    <div className="md:col-span-2 flex md:flex-col items-center md:items-end justify-between gap-2">
                      {(room.price ?? 0) > 0 && (
                        <span className="text-base font-bold">฿{Number(room.price ?? 0).toLocaleString()}</span>
                      )}
                      <a
                        href={getReserveHref(room.id)}
                        className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border"
                        style={{
                          borderColor: activeTheme.primary_color,
                          color: activeTheme.primary_color,
                        }}
                      >
                        Select →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT F: VILLA MULTI-THUMBNAIL SHOWCASE CARDS (#07 & #10) */}
          {template.roomsLayout === 'villa-multi-thumb' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const thumbs = photos.length > 1 ? photos.slice(1, 5) : heroPhotos.slice(0, 4);
                return (
                  <div
                    key={room.id}
                    className="border rounded-3xl overflow-hidden shadow-md flex flex-col text-left"
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="aspect-[16/10] overflow-hidden cursor-pointer bg-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    {/* 4-Photo Mini Album Strip */}
                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50/70 border-b" style={{ borderColor: cardBorder }}>
                      {thumbs.map((tUrl, tIdx) => (
                        <div
                          key={tIdx}
                          onClick={() => openLightbox(photos.length ? photos : heroPhotos, tIdx, room.name)}
                          className="aspect-[4/3] rounded-lg overflow-hidden cursor-pointer bg-slate-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tUrl} alt="" className="w-full h-full object-cover hover:opacity-80" />
                        </div>
                      ))}
                    </div>
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: cardBorder }}>
                        <div>
                          <span className="text-lg font-bold" style={{ color: textColor }}>
                            {(room.price ?? 0) > 0 ? `฿${Number(room.price ?? 0).toLocaleString()}` : 'Direct Villa Rate'}
                          </span>
                          {(room.price ?? 0) > 0 && <span className="text-xs opacity-60"> / night</span>}
                        </div>
                        <a
                          href={getReserveHref(room.id)}
                          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: activeTheme.primary_color,
                            color: '#ffffff',
                            borderRadius: btnRadius,
                          }}
                        >
                          Reserve Villa
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT G: MEDITERRANEAN ARCHED ROOM CARDS (#11) */}
          {template.roomsLayout === 'arched-cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div key={room.id} className="text-center space-y-4">
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="aspect-[4/5] rounded-t-[200px] rounded-b-2xl overflow-hidden shadow-lg cursor-pointer bg-slate-200 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="space-y-2 px-2">
                      <h3 className="text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                        {room.name}
                      </h3>
                      <p className="text-xs line-clamp-2" style={{ color: mutedText }}>
                        {room.bed_type} • {room.room_size} m² • Up to {room.max_guests} Guests
                      </p>
                      <div className="pt-1 flex items-center justify-center gap-3">
                        {(room.price ?? 0) > 0 && (
                          <span className="text-sm font-bold" style={{ color: activeTheme.accent_color }}>
                            ฿{Number(room.price ?? 0).toLocaleString()} / night
                          </span>
                        )}
                        <a
                          href={getReserveHref(room.id)}
                          className="px-5 py-2 text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: activeTheme.primary_color,
                            color: '#ffffff',
                            borderRadius: '9999px',
                          }}
                        >
                          Reserve
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT H: TALL 3:4 PORTRAIT CINEMA POSTER CARDS (#12) */}
          {template.roomsLayout === 'portrait-posters' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="border overflow-hidden flex flex-col text-left group"
                    style={{
                      backgroundColor: '#111827',
                      borderColor: `${activeTheme.accent_color}35`,
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="aspect-[3/4] overflow-hidden cursor-pointer bg-slate-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-5 space-y-3" style={{ color: '#f8fafc' }}>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold" style={{ fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        {(room.price ?? 0) > 0 && (
                          <span className="text-sm font-bold shrink-0" style={{ color: activeTheme.accent_color }}>
                            ฿{Number(room.price ?? 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-70">
                        {room.room_size} m² • {room.bed_type} • Max {room.max_guests}
                      </p>
                      <a
                        href={getReserveHref(room.id)}
                        className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-widest block"
                        style={{
                          backgroundColor: activeTheme.accent_color,
                          color: '#090d16',
                          borderRadius: '4px',
                        }}
                      >
                        Book Suite
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT I: DIRECT-BOOKING RATE COMPARISON TABLE PRO (#14) */}
          {template.roomsLayout === 'rate-table-pro' && (
            <div className="border rounded-2xl overflow-hidden shadow-sm divide-y" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
              <div
                className="hidden md:grid grid-cols-12 px-6 py-3 text-[11px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: activeTheme.primary_color, color: '#ffffff' }}
              >
                <div className="col-span-4">Room Type</div>
                <div className="col-span-4">Direct Booking Benefits</div>
                <div className="col-span-2">Occupancy</div>
                <div className="col-span-2 text-right">Official Rate</div>
              </div>

              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div key={room.id} className="p-5 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center text-left">
                    <div className="md:col-span-4 flex items-center gap-4">
                      <div
                        onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                        className="w-28 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold" style={{ color: textColor }}>
                          {room.name}
                        </h3>
                        <span className="text-xs" style={{ color: mutedText }}>
                          {room.room_size} m² • {room.bed_type}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Instant Direct Confirmation</span>
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: mutedText }}>
                        <Check className="w-3.5 h-3.5" style={{ color: activeTheme.accent_color }} />
                        <span>{(room.amenities || []).slice(0, 3).join(' • ') || 'Free Wi-Fi • Air Conditioning'}</span>
                      </div>
                    </div>

                    <div className="md:col-span-2 text-xs font-semibold" style={{ color: textColor }}>
                      Up to {room.max_guests} Guests
                    </div>

                    <div className="md:col-span-2 flex md:flex-col items-center md:items-end justify-between gap-2">
                      {(room.price ?? 0) > 0 && (
                        <div className="text-right">
                          <span className="text-lg font-bold" style={{ color: activeTheme.primary_color }}>
                            ฿{Number(room.price ?? 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] block" style={{ color: mutedText }}>
                            per night
                          </span>
                        </div>
                      )}
                      <a
                        href={getReserveHref(room.id)}
                        className="px-4 py-2 text-xs font-bold uppercase"
                        style={{
                          backgroundColor: activeTheme.primary_color,
                          color: '#ffffff',
                          borderRadius: btnRadius,
                        }}
                      >
                        Book Direct
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT J: CLASSIC 2-COLUMN CARDS (#01 & #15 Double-Border) */}
          {template.roomsLayout === 'grid-2' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const isDoubleBorder = template.id === 'imperial-galleria';
                return (
                  <div
                    key={room.id}
                    className={`overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col text-left group ${
                      isDoubleBorder ? 'border-2 p-2' : 'border'
                    }`}
                    style={{
                      backgroundColor: cardBg,
                      borderColor: isDoubleBorder ? `${activeTheme.accent_color}65` : cardBorder,
                      borderRadius: btnRadius === '0px' ? '0px' : '14px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="aspect-[16/10] overflow-hidden cursor-pointer relative bg-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {photos.length > 1 && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[11px] bg-black/70 text-white rounded">
                          {photos.length} photos
                        </span>
                      )}
                    </div>
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="pt-3 border-t flex items-center justify-between text-[11px] font-semibold uppercase" style={{ borderColor: cardBorder, color: mutedText }}>
                          <span>{room.room_size} m²</span>
                          <span>Max {room.max_guests} Guests</span>
                          <span>{room.bed_type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold" style={{ color: textColor }}>
                            {(room.price ?? 0) > 0 ? `฿${Number(room.price ?? 0).toLocaleString()} / night` : 'Best Rate Guaranteed'}
                          </span>
                          <a
                            href={getReserveHref(room.id)}
                            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: activeTheme.primary_color,
                              color: '#ffffff',
                              borderRadius: btnRadius,
                            }}
                          >
                            Reserve
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  };

  // =========================================================================
  // DISTINCT ABOUT / STORY SECTION LAYOUTS
  // =========================================================================
  const renderAboutSection = () => {
    // Skip redundant About block on Split-Screen (#02) or Story-Above-Hero (#13) if already featured, or show concise highlights
    if (template.aboutLayout === 'bento-highlights') {
      return (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {facilitiesData.slice(0, 4).map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-6 border text-left space-y-2"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderRadius: template.shellStyle === 'card-stack-canvas' ? '24px' : '16px',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${activeTheme.accent_color}18`, color: activeTheme.accent_color }}
                >
                  <Star className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold" style={{ color: textColor }}>
                  {item.title}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (template.aboutLayout === 'centered-manifesto') {
      return (
        <section className="py-16 md:py-24 px-6 border-b" style={{ borderColor: cardBorder }}>
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <span
              className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: activeTheme.accent_color }}
            >
              {aboutData.badge}
            </span>
            <h2
              className="text-3xl md:text-5xl font-bold leading-tight"
              style={{ color: textColor, fontFamily: fontStack }}
            >
              {aboutData.title}
            </h2>
            <div className="w-16 h-[1.5px] mx-auto" style={{ backgroundColor: activeTheme.accent_color }} />
            <p className="text-sm leading-relaxed" style={{ color: mutedText }}>
              {aboutData.description}
            </p>
          </div>
        </section>
      );
    }

    // Default / Overlapping / Split Story
    return (
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5 text-left">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.28em]"
            style={{ color: activeTheme.accent_color }}
          >
            {aboutData.badge}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: textColor, fontFamily: fontStack }}
          >
            {aboutData.title}
          </h2>
          <div className="w-14 h-[1.5px]" style={{ backgroundColor: activeTheme.accent_color }} />
          <p className="text-sm leading-relaxed" style={{ color: mutedText }}>
            {aboutData.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            {aboutData.features.map((f: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-xl" style={{ borderColor: cardBorder, backgroundColor: cardBg }}>
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: textColor }}>
                  {f.title}
                </h4>
                <p className="text-xs mt-1" style={{ color: mutedText }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
          <div
            className={`col-span-7 h-72 md:h-80 overflow-hidden shadow-lg bg-slate-200 ${
              template.aboutLayout === 'arched-trio' ? 'rounded-t-[160px]' : 'rounded-2xl'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aboutData.primaryImage} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
          <div
            className={`col-span-5 h-56 md:h-64 overflow-hidden shadow-md bg-slate-200 ${
              template.aboutLayout === 'arched-trio' ? 'rounded-t-[120px]' : 'rounded-2xl'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aboutData.secondaryImage} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    );
  };

  // =========================================================================
  // GALLERY STRIP / GRID + FOOTER
  // =========================================================================
  const renderGalleryStrip = () => {
    if (heroPhotos.length < 2) return null;
    return (
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-14 space-y-8">
        <div className="flex items-end justify-between">
          <div className="text-left">
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] block"
              style={{ color: activeTheme.accent_color }}
            >
              Visual Journey
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1" style={{ color: textColor, fontFamily: fontStack }}>
              Property Gallery
            </h2>
          </div>
          <a
            href={isPreview ? '#gallery' : `${tenantPrefix}/gallery`}
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1"
            style={{ color: activeTheme.accent_color }}
          >
            <span>Explore Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {heroPhotos.slice(0, 8).map((url, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(heroPhotos, idx, hotel.name)}
              className={`aspect-[4/3] overflow-hidden cursor-pointer group bg-slate-200 ${
                template.id === 'mediterranean-arch'
                  ? 'rounded-t-[120px] rounded-b-xl'
                  : btnRadius === '0px'
                  ? ''
                  : 'rounded-xl'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${hotel.name} photo ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderFooter = () => (
    <footer
      className="pt-14 pb-16 px-6 border-t"
      style={{
        backgroundColor: activeTheme.primary_color,
        color: 'rgba(255,255,255,0.88)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {activeTheme.footer_layout === 'luxury' ? (
          <div className="text-center space-y-4 pb-8 border-b border-white/10">
            <h3
              className="text-2xl md:text-3xl font-bold uppercase tracking-[0.22em]"
              style={{ color: activeTheme.accent_color, fontFamily: fontStack }}
            >
              {hotel.name}
            </h3>
            {hotel.address && <p className="text-xs opacity-70">{hotel.address}</p>}
            <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest opacity-85 pt-2">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/10">
            <div className="text-left space-y-1">
              <h3
                className="text-lg font-bold uppercase tracking-widest"
                style={{ color: activeTheme.accent_color, fontFamily: fontStack }}
              >
                {hotel.name}
              </h3>
              {hotel.address && <p className="text-xs opacity-65">{hotel.address}</p>}
            </div>
            <div className="flex flex-wrap gap-6 text-xs font-semibold uppercase tracking-widest opacity-85">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] opacity-55">
          <span>© {new Date().getFullYear()} {hotel.name}. All Rights Reserved.</span>
          <span>Official Direct Website • Best Rate Guaranteed</span>
        </div>
      </div>
    </footer>
  );

  // Order sections intelligently: Conversion-first (#14) puts Rooms BEFORE About!
  const roomsFirst = template.id === 'booking-first' || template.id === 'bento-mosaic';

  const mainBody = (
    <>
      {renderHero()}
      {roomsFirst ? (
        <>
          {renderRoomsSection()}
          {renderAboutSection()}
        </>
      ) : (
        <>
          {renderAboutSection()}
          {renderRoomsSection()}
        </>
      )}
      {promotions.length > 0 && !isPreview && (
        <div id="promotions">
          <PromotionsSection promotions={promotions} bookingUrl={bookingUrl} />
        </div>
      )}
      {renderGalleryStrip()}
      {!isPreview && (
        <>
          <LocationSection
            hotelName={hotel.name}
            address={hotel.address}
            mapUrl={hotel.google_map_url}
          />
          <ContactSection
            hotelId={hotel.id}
            email={hotel.email}
            phone={hotel.phone}
            address={hotel.address}
            socials={hotel.social_links}
          />
        </>
      )}
      {renderFooter()}
    </>
  );

  // =========================================================================
  // SHELL WRAPPER (#08 LEFT FIXED SIDEBAR VS TOP-HEADER SHELLS)
  // =========================================================================
  return (
    <div
      id="top"
      className="min-h-screen w-full transition-colors duration-300"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: fontStack,
      }}
    >
      {template.shellStyle === 'left-sidebar' ? (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* FIXED ARCHITECTURAL LEFT SIDEBAR (#08) */}
          <aside
            className="lg:w-72 lg:sticky lg:top-0 lg:h-screen border-b lg:border-b-0 lg:border-r p-6 md:p-8 flex flex-col justify-between shrink-0 text-left"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <div className="space-y-8">
              <div>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.28em] block mb-1"
                  style={{ color: activeTheme.accent_color }}
                >
                  Official Residence
                </span>
                <h1
                  className="text-xl font-bold uppercase tracking-wider leading-snug"
                  style={{ color: textColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </h1>
              </div>

              <nav className="flex lg:flex-col flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.18em]">
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="hover:translate-x-1 transition-transform"
                    style={{ color: textColor }}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="hidden lg:block space-y-4 pt-6 border-t" style={{ borderColor: cardBorder }}>
              {hotel.phone && (
                <div className="text-xs" style={{ color: mutedText }}>
                  <strong className="block text-[10px] uppercase">Direct Line</strong>
                  {hotel.phone}
                </div>
              )}
              <a
                href={getReserveHref()}
                className="w-full py-3.5 px-4 text-center text-xs font-bold uppercase tracking-widest block"
                style={{
                  backgroundColor: activeTheme.primary_color,
                  color: '#ffffff',
                  borderRadius: btnRadius,
                }}
              >
                Check Availability →
              </a>
            </div>
          </aside>

          {/* 80% RIGHT SCROLLING VIEWPORT */}
          <main className="flex-1 min-w-0">{mainBody}</main>
        </div>
      ) : (
        <>
          {renderTopHeader()}
          <main>{mainBody}</main>
        </>
      )}

      {/* SHARED PHOTO LIGHTBOX */}
      {lightboxOpen && lightboxPhotos.length > 0 && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
        >
          <div className="w-full max-w-5xl flex items-center justify-between mb-3" style={{ color: '#ffffff' }}>
            <span className="text-sm font-semibold">
              {lightboxTitle} ({lightboxIdx + 1} / {lightboxPhotos.length})
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
              style={{ color: '#ffffff' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl aspect-[16/10] flex items-center justify-center overflow-hidden rounded-xl bg-black"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhotos[lightboxIdx]}
              alt={lightboxTitle}
              className="max-w-full max-h-full object-contain"
            />
            {lightboxPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIdx((p) => (p - 1 + lightboxPhotos.length) % lightboxPhotos.length)
                  }
                  className="absolute left-3 p-3 rounded-full bg-black/60 cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIdx((p) => (p + 1) % lightboxPhotos.length)}
                  className="absolute right-3 p-3 rounded-full bg-black/60 cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
