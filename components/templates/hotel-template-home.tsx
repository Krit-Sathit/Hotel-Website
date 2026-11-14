'use client';

import React, { useState, useMemo } from 'react';
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
  ArrowRight,
  X,
  Grid,
  ShieldCheck,
  Clock,
  Star,
  Menu,
  Tag,
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
import { deriveSurfacePalette, withAlpha } from '@/lib/color-utils';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const palette = useMemo(() => deriveSurfacePalette(activeTheme), [activeTheme]);
  const {
    bg: bgColor,
    bgIsDark: isDark,
    text: textColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    cardBg,
    subtleSurface,
    canvasStackBg,
    cardBorder,
    mutedText,
    primaryText,
    secondaryText,
    accentText,
  } = palette;

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

  /**
   * Unified Channel Manager + FlowStay Promo Lowest Price Renderer (NEVER shows basePrice!)
   */
  const renderRoomPrice = (
    room: Room,
    opts?: { align?: 'left' | 'center' | 'right'; compact?: boolean }
  ) => {
    const price = Math.round(Number(room.price ?? 0));
    const orig = Math.round(Number(room.original_price ?? 0));
    const discPct = Math.round(Number(room.discount_pct ?? 0));
    const hasDiscount = price > 0 && orig > price;
    const align = opts?.align || 'left';
    const alignClass =
      align === 'right'
        ? 'items-end text-right'
        : align === 'center'
        ? 'items-center text-center'
        : 'items-start text-left';

    if (price <= 0) {
      return (
        <div className={`flex flex-col ${alignClass}`}>
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            Official Direct Rate
          </span>
          <span className="text-xs font-semibold" style={{ color: mutedText }}>
            Check Availability
          </span>
        </div>
      );
    }

    return (
      <div className={`flex flex-col ${alignClass} leading-tight`}>
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          {hasDiscount && (
            <span
              className="text-[11px] line-through font-medium"
              style={{ color: mutedText }}
            >
              ฿{orig.toLocaleString()}
            </span>
          )}
          {discPct > 0 && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5"
              style={{
                backgroundColor: withAlpha(accentColor, 0.16),
                color: accentColor,
              }}
            >
              <Tag className="w-2.5 h-2.5" />-{discPct}%
            </span>
          )}
          {!hasDiscount && !opts?.compact && (
            <span
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: mutedText }}
            >
              Lowest Direct Rate
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={opts?.compact ? 'text-base font-bold' : 'text-lg @3xl:text-xl font-bold'}
            style={{ color: textColor }}
          >
            ฿{price.toLocaleString()}
          </span>
          <span className="text-[11px] font-normal" style={{ color: mutedText }}>
            / night
          </span>
        </div>
      </div>
    );
  };

  /**
   * Shared Slide-Down Mobile Menu Drawer (used across all 16 templates on < @3xl / < 768px)
   */
  const renderMobileNavDrawer = () => {
    if (!mobileMenuOpen) return null;
    return (
      <div
        className="@3xl:hidden border-t px-5 py-4 space-y-4 shadow-xl"
        style={{ backgroundColor: cardBg, borderColor: cardBorder, color: textColor }}
      >
        <nav className="flex flex-col divide-y text-xs font-bold uppercase tracking-[0.18em]" style={{ borderColor: cardBorder }}>
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between"
              style={{ color: textColor, borderColor: cardBorder }}
            >
              <span>{l.label}</span>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: accentColor }} />
            </a>
          ))}
        </nav>

        {(hotel.phone || hotel.email || hotel.address) && (
          <div className="pt-2 border-t space-y-1.5 text-[11px]" style={{ borderColor: cardBorder, color: mutedText }}>
            {hotel.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                <span>{hotel.phone}</span>
              </div>
            )}
            {hotel.email && (
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">{hotel.email}</span>
              </div>
            )}
            {hotel.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                <span className="leading-snug">{hotel.address}</span>
              </div>
            )}
          </div>
        )}

        <a
          href={getReserveHref()}
          onClick={() => setMobileMenuOpen(false)}
          className="w-full py-3 px-4 text-center text-xs font-bold uppercase tracking-widest block shadow-sm"
          style={{
            backgroundColor: primaryColor,
            color: primaryText,
            borderRadius: btnRadius,
          }}
        >
          Book Direct — Best Rate
        </a>
      </div>
    );
  };

  // =========================================================================
  // HEADER RENDERER (Adapts cleanly to Desktop @3xl+ AND Mobile < @3xl)
  // =========================================================================
  const hasHeaderBookingBar =
    template.heroLayout === 'full-slider' ||
    template.heroLayout === 'cinema-crest' ||
    template.heroLayout === 'triptych-panels';

  const renderTopHeader = () => {
    // 1. Floating Pill Navbar (#03)
    if (template.shellStyle === 'floating-pill-nav') {
      return (
        <header className="sticky top-2 @3xl:top-3 z-40 px-3 @3xl:px-8 pt-2 @3xl:pt-3">
          <div
            className="max-w-7xl mx-auto px-4 @3xl:px-6 py-2.5 @3xl:py-3.5 shadow-lg border backdrop-blur-xl flex items-center justify-between gap-2"
            style={{
              backgroundColor: withAlpha(cardBg, 0.94),
              borderColor: cardBorder,
              borderRadius: mobileMenuOpen ? '20px' : '9999px',
            }}
          >
            <a
              href={isPreview ? '#top' : tenantPrefix || '/'}
              className="flex items-center gap-2 text-left min-w-0"
            >
              {hotel.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanImg(hotel.logo_url)}
                  alt={hotel.name}
                  className="w-7 h-7 @3xl:w-8 @3xl:h-8 rounded-full object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                />
              )}
              <span
                className="text-sm @3xl:text-lg font-bold uppercase tracking-wider @3xl:tracking-widest truncate"
                style={{ color: isDark ? textColor : primaryColor, fontFamily: fontStack }}
              >
                {hotel.name}
              </span>
            </a>

            <nav className="hidden @3xl:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider">
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

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={getReserveHref()}
                className="px-3.5 @3xl:px-5 py-1.5 @3xl:py-2 text-[11px] @3xl:text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryText,
                  borderRadius: '9999px',
                }}
              >
                Book
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="@3xl:hidden p-2 rounded-full border cursor-pointer"
                style={{ borderColor: cardBorder, color: textColor }}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-2 rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: cardBorder }}>
              {renderMobileNavDrawer()}
            </div>
          )}
        </header>
      );
    }

    // 2. Newspaper / Magazine Masthead (#09)
    if (template.heroLayout === 'magazine-masthead') {
      return (
        <header
          className="border-b"
          style={{ backgroundColor: bgColor, borderColor: cardBorder }}
        >
          <div className="max-w-7xl mx-auto px-4 @3xl:px-6 py-3.5 @3xl:py-5 space-y-3 @3xl:space-y-4">
            <div
              className="hidden @3xl:flex items-center justify-between text-[10px] uppercase tracking-[0.25em] pb-3 border-b"
              style={{ color: mutedText, borderColor: cardBorder }}
            >
              <span className="truncate max-w-[260px]">{hotel.address || 'Thailand'}</span>
              <span>Official Direct Edition</span>
              <span>{hotel.phone || 'Direct Reservations'}</span>
            </div>

            {/* Mobile Single-Row Masthead vs Desktop Grand Masthead */}
            <div className="flex @3xl:block items-center justify-between gap-3">
              <h1
                className="text-base @3xl:text-5xl font-bold uppercase tracking-[0.12em] @3xl:tracking-[0.18em] @3xl:text-center truncate"
                style={{ color: textColor, fontFamily: fontStack }}
              >
                {hotel.name}
              </h1>
              <div className="flex @3xl:hidden items-center gap-2 shrink-0">
                <a
                  href={getReserveHref()}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryText,
                    borderRadius: btnRadius,
                  }}
                >
                  Reserve
                </a>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((p) => !p)}
                  className="p-2 rounded-lg border cursor-pointer"
                  style={{ borderColor: cardBorder, color: textColor }}
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <nav
              className="hidden @3xl:flex flex-wrap items-center justify-center gap-8 pt-3 border-t text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ borderColor: cardBorder, color: textColor }}
            >
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className="hover:opacity-70">
                  {l.label}
                </a>
              ))}
              <a href={getReserveHref()} style={{ color: accentColor }}>
                Reserve Direct →
              </a>
            </nav>
          </div>
          {renderMobileNavDrawer()}
        </header>
      );
    }

    // 3. Standard / Centered / Luxury Top Header
    const isLux = activeTheme.header_layout === 'luxury';
    const isCentered = activeTheme.header_layout === 'centered';
    const headerSurfaceBg = isLux ? primaryColor : withAlpha(cardBg, 0.96);
    const headerFg = isLux ? primaryText : textColor;
    const headerBrandColor = isLux ? accentColor : isDark ? textColor : primaryColor;

    return (
      <>
        {/* Top Utility Strip: Sleek 1-Line Mobile Strip vs Full Desktop Strip */}
        <div
          className="w-full py-1.5 @5xl:py-2 px-4 @3xl:px-6 text-[10px] @5xl:text-[11px] tracking-wider border-b"
          style={{
            backgroundColor: secondaryColor,
            color: withAlpha(secondaryText, 0.9),
            borderColor: withAlpha(secondaryText, 0.12),
          }}
        >
          {/* Mobile compact 1-line bar (fixes multi-line address wrapping!) */}
          <div className="flex @5xl:hidden items-center justify-between gap-2">
            {hotel.phone ? (
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Phone className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">{hotel.phone}</span>
              </span>
            ) : (
              <span className="font-medium truncate">{hotel.name}</span>
            )}
            <span
              className="font-bold uppercase tracking-widest text-[9px] shrink-0"
              style={{ color: accentColor }}
            >
              Official Direct Rate
            </span>
          </div>

          {/* Desktop full utility bar */}
          <div className="hidden @5xl:flex max-w-7xl mx-auto items-center justify-between gap-6">
            <div className="flex items-center gap-5 shrink-0">
              {hotel.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" style={{ color: accentColor }} />
                  {hotel.phone}
                </span>
              )}
              {hotel.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" style={{ color: accentColor }} />
                  {hotel.email}
                </span>
              )}
            </div>
            {hotel.address && (
              <span className="flex items-center gap-1.5 truncate max-w-md">
                <MapPin className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">{hotel.address}</span>
              </span>
            )}
          </div>
        </div>

        <header
          className="sticky top-0 z-40 border-b backdrop-blur-md"
          style={{
            backgroundColor: headerSurfaceBg,
            borderColor: isLux ? withAlpha(accentColor, 0.3) : cardBorder,
          }}
        >
          {/* MOBILE UNIFIED CLEAN HEADER (< @3xl) */}
          <div className="@3xl:hidden px-4 py-3 flex items-center justify-between gap-2.5">
            <a
              href={isPreview ? '#top' : tenantPrefix || '/'}
              className="flex items-center gap-2 text-left min-w-0"
            >
              {hotel.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanImg(hotel.logo_url)}
                  alt={hotel.name}
                  className="w-8 h-8 rounded-md object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                />
              )}
              <div className="min-w-0">
                <span
                  className="text-sm font-bold uppercase tracking-wider block truncate"
                  style={{ color: headerBrandColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </span>
                <span
                  className="text-[8px] uppercase tracking-[0.2em] font-semibold block"
                  style={{ color: accentColor }}
                >
                  Official Website
                </span>
              </div>
            </a>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={getReserveHref()}
                className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: isLux ? accentColor : primaryColor,
                  color: isLux ? accentText : primaryText,
                  borderRadius: btnRadius,
                }}
              >
                Book
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="p-2 rounded-lg border cursor-pointer"
                style={{
                  borderColor: withAlpha(headerFg, 0.2),
                  color: headerFg,
                }}
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* DESKTOP HEADER (@3xl+) */}
          {isCentered ? (
            <div className="hidden @3xl:block max-w-7xl mx-auto px-6 py-4 text-center space-y-3">
              <div>
                <a
                  href={isPreview ? '#top' : tenantPrefix || '/'}
                  className="text-2xl font-bold uppercase tracking-[0.22em] block"
                  style={{ color: headerBrandColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </a>
                <span
                  className="text-[9px] uppercase tracking-[0.3em] font-semibold"
                  style={{ color: accentColor }}
                >
                  Official Hotel Website
                </span>
              </div>
              <nav
                className="flex flex-wrap items-center justify-center gap-8 pt-2.5 border-t text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  borderColor: withAlpha(headerFg, 0.12),
                  color: withAlpha(headerFg, 0.86),
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
            <div className="hidden @3xl:flex max-w-7xl mx-auto px-6 py-4 items-center justify-between gap-4">
              <a
                href={isPreview ? '#top' : tenantPrefix || '/'}
                className="flex items-center gap-3 text-left min-w-0"
              >
                {hotel.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cleanImg(hotel.logo_url)}
                    alt={hotel.name}
                    className="w-10 h-10 rounded-md object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span
                    className="text-lg @5xl:text-xl font-bold uppercase tracking-widest block truncate"
                    style={{ color: headerBrandColor, fontFamily: fontStack }}
                  >
                    {hotel.name}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-widest font-semibold block -mt-0.5"
                    style={{ color: withAlpha(headerFg, 0.58) }}
                  >
                    Official Hotel Website
                  </span>
                </div>
              </a>

              <nav
                className="flex items-center gap-6 @5xl:gap-7 text-xs font-semibold uppercase tracking-widest"
                style={{ color: withAlpha(headerFg, 0.86) }}
              >
                {navLinks.map((l) => (
                  <a key={l.label} href={l.href} className="hover:opacity-75 whitespace-nowrap">
                    {l.label}
                  </a>
                ))}
              </nav>

              <a
                href={getReserveHref()}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0 whitespace-nowrap"
                style={{
                  backgroundColor: isLux ? accentColor : primaryColor,
                  color: isLux ? accentText : primaryText,
                  borderRadius: btnRadius,
                }}
              >
                Book Now
              </a>
            </div>
          )}

          {renderMobileNavDrawer()}

          {/* Desktop sticky horizontal booking bar for #01, #04, #15 (on mobile rendered cleanly below hero!) */}
          {hasHeaderBookingBar && (
            <div className="hidden @3xl:block">
              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="horizontal"
                isPreview={isPreview}
              />
            </div>
          )}
        </header>
      </>
    );
  };

  // =========================================================================
  // 16 DISTINCT HERO COMPOSITIONS (100% Container-Query Mobile Responsive)
  // =========================================================================
  const renderHero = () => {
    switch (template.heroLayout) {
      // #02 SPLIT-SCREEN 50/50 EDITORIAL
      case 'split-screen':
        return (
          <section className="w-full border-b" style={{ borderColor: cardBorder }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 @5xl:grid-cols-12 @5xl:min-h-[560px]">
              {/* Photo first on mobile, right 50% on desktop */}
              <div className="@5xl:col-span-6 @5xl:order-2 relative h-[260px] @3xl:h-[380px] @5xl:h-auto overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentHeroImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                {heroPhotos.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx((p) => (p - 1 + heroPhotos.length) % heroPhotos.length)
                      }
                      className="p-2 bg-white/90 text-slate-900 rounded-lg shadow-md cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideIdx((p) => (p + 1) % heroPhotos.length)}
                      className="p-2 bg-white/90 text-slate-900 rounded-lg shadow-md cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Left 50%: Editorial Typography + Direct Booking Card */}
              <div className="@5xl:col-span-6 @5xl:order-1 p-5 @3xl:p-10 @5xl:p-14 flex flex-col justify-center space-y-4 @3xl:space-y-6 text-left">
                <span
                  className="text-[10px] @3xl:text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: accentColor }}
                >
                  {aboutData.badge}
                </span>
                <h1
                  className="text-2xl @3xl:text-4xl @5xl:text-5xl font-bold leading-tight"
                  style={{ color: textColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </h1>
                <p className="text-xs @3xl:text-sm leading-relaxed max-w-lg" style={{ color: mutedText }}>
                  {aboutData.description}
                </p>
                <div className="pt-1 @5xl:max-w-md">
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
            </div>
          </section>
        );

      // #03 FLOATING GLASS & FRAMED ROUNDED HERO
      case 'floating-dock':
        return (
          <section className="px-3 @3xl:px-8 pt-3 @3xl:pt-4 pb-8 @3xl:pb-12">
            <div className="max-w-7xl mx-auto relative">
              <div className="relative h-[260px] @3xl:h-[520px] rounded-[22px] @3xl:rounded-[28px] overflow-hidden shadow-xl bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentHeroImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="-mt-6 @3xl:-mt-10 relative z-20 px-2 @3xl:px-4">
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
          <section className="space-y-4">
            <div className="py-4 @3xl:py-8 px-4 @3xl:px-8">
              <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 h-[260px] @3xl:h-[500px]">
                <div className="hidden @3xl:block col-span-2 overflow-hidden opacity-85">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[(slideIdx + 1) % heroPhotos.length]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="col-span-12 @3xl:col-span-8 relative overflow-hidden shadow-xl border-2"
                  style={{ borderColor: withAlpha(accentColor, 0.45) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentHeroImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden @3xl:block col-span-2 overflow-hidden opacity-85">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[(slideIdx + 2) % heroPhotos.length]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="@3xl:hidden">
              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="horizontal"
                isPreview={isPreview}
              />
            </div>
          </section>
        );

      // #05 5-PHOTO BOUTIQUE MOSAIC COLLAGE (Airbnb Luxe Style)
      case 'photo-mosaic':
        return (
          <section className="max-w-7xl mx-auto px-4 @3xl:px-6 pt-5 @3xl:pt-8 pb-4 space-y-4 text-left">
            <div className="flex flex-col @3xl:flex-row @3xl:items-end justify-between gap-3">
              <div className="min-w-0">
                <span
                  className="text-[10px] @3xl:text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  Official Direct Property
                </span>
                <h1
                  className="text-xl @3xl:text-4xl font-bold mt-0.5"
                  style={{ color: textColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </h1>
                {hotel.address && (
                  <p className="text-xs flex items-start gap-1.5 mt-1" style={{ color: mutedText }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <span className="line-clamp-2">{hotel.address}</span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => openLightbox(heroPhotos, 0, hotel.name)}
                className="self-start @3xl:self-auto px-3.5 py-2 border text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  color: textColor,
                  borderRadius: btnRadius,
                }}
              >
                <Grid className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>View All {heroPhotos.length} Photos</span>
              </button>
            </div>

            {/* Mobile: 1 Hero + 2 Sub-Thumbs | Desktop (@3xl+): 5-Photo Collage Grid */}
            <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-2 @3xl:gap-2.5 @3xl:h-[460px] rounded-2xl overflow-hidden">
              <div
                onClick={() => openLightbox(heroPhotos, 0, hotel.name)}
                className="col-span-2 @3xl:row-span-2 h-52 @3xl:h-full relative overflow-hidden cursor-pointer group bg-slate-200"
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
                  className={`${
                    offset <= 2 ? 'block h-28 @3xl:h-full' : 'hidden @3xl:block @3xl:h-full'
                  } relative overflow-hidden cursor-pointer group bg-slate-200`}
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
          <section className="max-w-6xl mx-auto px-4 @3xl:px-12 py-6 @3xl:py-10 space-y-6 @3xl:space-y-8">
            <div className="flex items-stretch gap-6">
              <div
                className="hidden @3xl:flex flex-col justify-between py-2 text-[10px] uppercase tracking-[0.35em]"
                style={{ writingMode: 'vertical-rl', color: mutedText }}
              >
                <span>{hotel.name}</span>
                <span style={{ color: accentColor }}>Sanctuary of Calm</span>
              </div>
              <div className="flex-1 h-[260px] @3xl:h-[500px] overflow-hidden bg-slate-200">
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
          <section className="pb-6 @3xl:pb-10">
            <div className="relative h-[280px] @3xl:h-[520px] w-full overflow-hidden rounded-b-[32px] @3xl:rounded-b-[80px] shadow-lg bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImg}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="-mt-6 @3xl:-mt-9 relative z-20 px-4 @3xl:px-6">
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
          <section className="p-4 @3xl:p-10 space-y-5 @3xl:space-y-6">
            <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-3 @3xl:gap-4 h-auto @5xl:h-[460px]">
              <div className="@5xl:col-span-8 h-[250px] @3xl:h-[340px] @5xl:h-full overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhotos[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="@5xl:col-span-4 grid grid-cols-2 @5xl:grid-cols-1 gap-3 @3xl:gap-4 h-full">
                <div className="h-28 @3xl:h-40 @5xl:h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[1 % heroPhotos.length]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-28 @3xl:h-40 @5xl:h-full overflow-hidden bg-slate-200">
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
          <section className="max-w-7xl mx-auto px-4 @3xl:px-6 py-5 @3xl:py-8 space-y-6 @3xl:space-y-8">
            <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-5 @3xl:gap-6 items-stretch">
              <div className="order-1 @5xl:order-2 @5xl:col-span-6 h-[260px] @3xl:h-[420px] @5xl:h-[480px] overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroPhotos[0]} alt={hotel.name} className="w-full h-full object-cover" />
              </div>

              <div
                className="order-2 @5xl:order-1 @5xl:col-span-3 flex flex-col justify-between border-y py-4 @3xl:py-5 text-left space-y-4"
                style={{ borderColor: cardBorder }}
              >
                <div className="space-y-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: accentColor }}
                  >
                    01 / The Destination
                  </span>
                  <h2 className="text-lg @3xl:text-xl font-bold leading-snug" style={{ fontFamily: fontStack }}>
                    A Curated Escape at {hotel.name}
                  </h2>
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: mutedText }}>
                    {aboutData.description}
                  </p>
                </div>
                <div className="h-36 overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[1 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              <div
                className="order-3 @5xl:col-span-3 flex flex-col justify-between border-y py-4 @3xl:py-5 text-left space-y-4"
                style={{ borderColor: cardBorder }}
              >
                <div className="h-36 overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[2 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: accentColor }}
                  >
                    02 / Direct Privileges
                  </span>
                  <h3 className="text-base @3xl:text-lg font-bold" style={{ fontFamily: fontStack }}>
                    {rooms.length || 4} Signature Room Categories
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
                    Instant reservation confirmation with official Channel Manager rates.
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
          <section className="w-full">
            {/* Mobile (< @5xl): Clean Hero Banner + Booking Card neatly stacked below */}
            <div className="@5xl:hidden">
              <div className="h-[260px] w-full overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentHeroImg} alt={hotel.name} className="w-full h-full object-cover" />
              </div>
              <div className="px-4 -mt-8 relative z-10 pb-4">
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

            {/* Desktop (@5xl+): Full Hero with Right Floating Vertical Check-In Card */}
            <div className="hidden @5xl:flex relative w-full min-h-[540px] items-center py-12 px-6 overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImg}
                alt={hotel.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-8 items-center">
                <div className="col-span-7" />
                <div className="col-span-5">
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
            </div>
          </section>
        );

      // #11 MEDITERRANEAN 3-ARCHED COURTYARD WINDOWS
      case 'arched-courtyard':
        return (
          <section className="max-w-7xl mx-auto px-4 @3xl:px-6 py-6 @3xl:py-10 space-y-6 @3xl:space-y-8">
            {/* Mobile: 1 Featured Arch + 2 Mini Arches | Desktop: 3 Grand Arches */}
            <div className="grid grid-cols-2 @3xl:grid-cols-3 gap-3 @3xl:gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => openLightbox(heroPhotos, i % heroPhotos.length, hotel.name)}
                  className={`overflow-hidden shadow-lg cursor-pointer bg-slate-200 ${
                    i === 0
                      ? 'col-span-2 @3xl:col-span-1 h-[270px] @3xl:h-[380px] rounded-t-[150px] @3xl:rounded-t-[220px] rounded-b-2xl'
                      : i === 1
                      ? 'h-[140px] @3xl:h-[420px] @3xl:-mt-4 rounded-t-[90px] @3xl:rounded-t-[220px] rounded-b-xl @3xl:rounded-b-2xl'
                      : 'h-[140px] @3xl:h-[380px] rounded-t-[90px] @3xl:rounded-t-[220px] rounded-b-xl @3xl:rounded-b-2xl'
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

      // #12 WIDESCREEN 21:9 CINEMA
      case 'widescreen-noir':
        return (
          <section className="py-5 @3xl:py-8 px-4 @3xl:px-10 space-y-5 @3xl:space-y-6" style={{ backgroundColor: bgColor }}>
            <div
              className="max-w-7xl mx-auto overflow-hidden aspect-[16/10] @3xl:aspect-[21/9] border shadow-2xl relative"
              style={{ borderColor: withAlpha(accentColor, 0.4) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImg}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
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
          <section className="max-w-7xl mx-auto px-4 @3xl:px-6 py-7 @3xl:py-12 space-y-6 @3xl:space-y-8 text-center">
            <div className="max-w-2xl mx-auto space-y-2.5 @3xl:space-y-3">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1 rounded-full border"
                style={{
                  color: accentColor,
                  borderColor: withAlpha(accentColor, 0.4),
                }}
              >
                {aboutData.badge}
              </span>
              <h1
                className="text-2xl @3xl:text-5xl font-bold tracking-wide"
                style={{ color: textColor, fontFamily: fontStack }}
              >
                {hotel.name}
              </h1>
              <p className="text-xs @3xl:text-sm leading-relaxed" style={{ color: mutedText }}>
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

            <div className="h-[240px] @3xl:h-[500px] rounded-2xl @3xl:rounded-3xl overflow-hidden shadow-xl bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImg}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        );

      // #14 COMPACT DIRECT-BOOKING PRO
      case 'compact-direct':
        return (
          <section className="border-b" style={{ backgroundColor: subtleSurface, borderColor: cardBorder }}>
            <div className="max-w-7xl mx-auto px-4 @3xl:px-6 py-4 @3xl:py-6 space-y-4 @3xl:space-y-5">
              <div className="grid grid-cols-1 @3xl:grid-cols-12 gap-3 h-[200px] @3xl:h-[260px] rounded-xl overflow-hidden">
                <div className="@3xl:col-span-6 h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[0]} alt={hotel.name} className="w-full h-full object-cover" />
                </div>
                <div className="hidden @3xl:block @3xl:col-span-3 h-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[1 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="hidden @3xl:block @3xl:col-span-3 h-full overflow-hidden bg-slate-200">
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
          <section className="space-y-4">
            <div className="max-w-7xl mx-auto px-4 @3xl:px-6 py-5 @3xl:py-8">
              <div className="grid grid-cols-2 @3xl:grid-cols-3 gap-2.5 @3xl:gap-4 @3xl:h-[500px]">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    onClick={() => openLightbox(heroPhotos, i % heroPhotos.length, hotel.name)}
                    className={`relative overflow-hidden border-2 cursor-pointer group bg-slate-200 ${
                      i === 0
                        ? 'col-span-2 @3xl:col-span-1 h-[240px] @3xl:h-full'
                        : 'h-[120px] @3xl:h-full'
                    }`}
                    style={{ borderColor: withAlpha(accentColor, 0.45) }}
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
            </div>
            <div className="@3xl:hidden">
              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="horizontal"
                isPreview={isPreview}
              />
            </div>
          </section>
        );

      // #16 MODULAR BENTO CARD-STACK
      case 'bento-stack':
        return (
          <section className="max-w-7xl mx-auto px-3 @3xl:px-6 pt-4 @3xl:pt-6 space-y-4">
            <div
              className="p-3.5 @3xl:p-6 rounded-[22px] @3xl:rounded-[28px] shadow-xs border space-y-4 @3xl:space-y-5"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-4 items-stretch">
                <div className="@5xl:col-span-8 h-[240px] @3xl:h-[420px] rounded-[18px] @3xl:rounded-[22px] overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentHeroImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="@5xl:col-span-4 p-5 @3xl:p-8 rounded-[18px] @3xl:rounded-[22px] flex flex-col justify-between text-left"
                  style={{ backgroundColor: primaryColor, color: primaryText }}
                >
                  <div className="space-y-2.5 @3xl:space-y-3">
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: withAlpha(primaryText, 0.14),
                        color: primaryText,
                      }}
                    >
                      Direct Official Stay
                    </span>
                    <h1
                      className="text-xl @3xl:text-3xl font-bold leading-snug"
                      style={{ fontFamily: fontStack }}
                    >
                      {hotel.name}
                    </h1>
                    <p className="text-xs leading-relaxed opacity-85 line-clamp-3">
                      {aboutData.description}
                    </p>
                  </div>
                  <div className="pt-4 @3xl:pt-6 flex flex-wrap items-center gap-3 text-xs opacity-95">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" style={{ color: accentColor }} />
                      Best Direct Rate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" style={{ color: accentColor }} />
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
          <section>
            <div className="relative w-full h-[270px] @3xl:h-[520px] @5xl:h-[600px] overflow-hidden bg-slate-900">
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
                    className="absolute left-3 @3xl:left-5 top-1/2 -translate-y-1/2 p-2 @3xl:p-3 rounded-full bg-black/35 hover:bg-black/55 text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 @3xl:w-5 @3xl:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlideIdx((p) => (p + 1) % heroPhotos.length)}
                    className="absolute right-3 @3xl:right-5 top-1/2 -translate-y-1/2 p-2 @3xl:p-3 rounded-full bg-black/35 hover:bg-black/55 text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 @3xl:w-5 @3xl:h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="@3xl:hidden">
              <TemplateBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                bookingUrl={bookingUrl}
                theme={activeTheme}
                variant="horizontal"
                isPreview={isPreview}
              />
            </div>
          </section>
        );
    }
  };

  // =========================================================================
  // DISTINCT ROOMS SHOWCASE LAYOUTS (10 Structural Layouts — Mobile + Dynamic Color + Channel Manager Lowest Promo Price)
  // =========================================================================
  const renderRoomsSection = () => {
    if (rooms.length === 0) return null;

    const sectionWrapClass =
      template.shellStyle === 'card-stack-canvas'
        ? 'max-w-7xl mx-auto px-3 @3xl:px-6 py-3 @3xl:py-4'
        : 'w-full py-10 @3xl:py-20 px-4 @3xl:px-6';

    const innerCardWrap =
      template.shellStyle === 'card-stack-canvas'
        ? 'p-4 @3xl:p-10 rounded-[22px] @3xl:rounded-[28px] border shadow-xs space-y-7 @3xl:space-y-10'
        : 'max-w-7xl mx-auto space-y-8 @3xl:space-y-12';

    return (
      <section id="rooms" className={sectionWrapClass}>
        <div
          className={innerCardWrap}
          style={
            template.shellStyle === 'card-stack-canvas'
              ? { backgroundColor: cardBg, borderColor: cardBorder }
              : undefined
          }
        >
          {/* Section Heading */}
          <div
            className={`space-y-2 ${
              template.roomsLayout === 'zen-minimal-list' ||
              template.roomsLayout === 'sidebar-sticky-list' ||
              template.roomsLayout === 'rate-table-pro'
                ? 'text-left'
                : 'text-center max-w-2xl mx-auto'
            }`}
          >
            <span
              className="text-[10px] @3xl:text-xs font-bold uppercase tracking-[0.25em] block"
              style={{ color: accentColor }}
            >
              Accommodations & Suites
            </span>
            <h2
              className="text-xl @3xl:text-4xl font-bold tracking-wide"
              style={{ color: textColor, fontFamily: fontStack }}
            >
              Choose Your Stay at {hotel.name}
            </h2>
          </div>

          {/* LAYOUT A: ZIG-ZAG ALTERNATING HORIZONTAL SHOWCASE (#02 & #08) */}
          {template.roomsLayout === 'zigzag-horizontal' && (
            <div className="space-y-6 @3xl:space-y-10">
              {rooms.map((room, idx) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const reversed = idx % 2 === 1;
                return (
                  <div
                    key={room.id}
                    className="grid grid-cols-1 @5xl:grid-cols-12 gap-5 @3xl:gap-8 items-center border p-4 @3xl:p-8"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderRadius: btnRadius === '0px' ? '0px' : '20px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className={`@5xl:col-span-7 aspect-[16/10] overflow-hidden cursor-pointer relative group bg-slate-200 ${
                        reversed ? '@5xl:order-2' : ''
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
                      className={`@5xl:col-span-5 space-y-4 text-left ${
                        reversed ? '@5xl:order-1' : ''
                      }`}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.25em]"
                        style={{ color: accentColor }}
                      >
                        Suite 0{idx + 1}
                      </span>
                      <h3
                        className="text-xl @3xl:text-3xl font-bold"
                        style={{ color: textColor, fontFamily: fontStack }}
                      >
                        {room.name}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: mutedText }}>
                        {room.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs font-semibold pt-1" style={{ color: mutedText }}>
                        <span className="flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          {room.room_size} m²
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          Max {room.max_guests} Guests
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          {room.bed_type}
                        </span>
                      </div>

                      <div
                        className="pt-4 border-t flex flex-wrap items-end justify-between gap-3"
                        style={{ borderColor: cardBorder }}
                      >
                        {renderRoomPrice(room)}
                        <a
                          href={getReserveHref(room.id)}
                          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                          style={{
                            backgroundColor: primaryColor,
                            color: primaryText,
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
            <div className="grid grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-3 gap-5 @3xl:gap-6">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="border overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col text-left group"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderRadius: '20px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="relative aspect-[16/10] @3xl:aspect-[4/3] overflow-hidden cursor-pointer bg-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {(room.discount_pct ?? 0) > 0 && (
                        <span
                          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md"
                          style={{ backgroundColor: accentColor, color: accentText }}
                        >
                          -{room.discount_pct}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-4 @3xl:p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs line-clamp-2" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px]" style={{ color: mutedText }}>
                          <span>{room.room_size} m²</span>
                          <span>•</span>
                          <span>Max {room.max_guests}</span>
                          <span>•</span>
                          <span>{room.bed_type}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t flex flex-wrap items-end justify-between gap-3" style={{ borderColor: cardBorder }}>
                        {renderRoomPrice(room, { compact: true })}
                        <a
                          href={getReserveHref(room.id)}
                          className="px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                          style={{
                            backgroundColor: primaryColor,
                            color: primaryText,
                            borderRadius: btnRadius,
                          }}
                        >
                          Book Room
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
            <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-6 @3xl:gap-8 items-start">
              {/* On mobile, show booking widget cleanly first, then rooms */}
              <div className="@5xl:col-span-4 @5xl:order-2 @5xl:sticky @5xl:top-24">
                <TemplateBookingForm
                  hotelId={hotel.id}
                  hotelName={hotel.name}
                  bookingUrl={bookingUrl}
                  theme={activeTheme}
                  variant="vertical-card"
                  isPreview={isPreview}
                />
              </div>

              <div className="@5xl:col-span-8 @5xl:order-1 space-y-4 @3xl:space-y-5">
                {rooms.map((room) => {
                  const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                  const cover = photos[0] || currentHeroImg;
                  return (
                    <div
                      key={room.id}
                      className="border p-4 rounded-2xl grid grid-cols-1 @3xl:grid-cols-12 gap-4 @3xl:gap-5 items-center text-left"
                      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                    >
                      <div
                        onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                        className="@3xl:col-span-5 aspect-[16/10] @3xl:aspect-[4/3] rounded-xl overflow-hidden cursor-pointer relative bg-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="@3xl:col-span-7 space-y-3">
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
                        <div className="pt-2 border-t flex flex-wrap items-end justify-between gap-3" style={{ borderColor: cardBorder }}>
                          {renderRoomPrice(room, { compact: true })}
                          <a
                            href={getReserveHref(room.id)}
                            className="px-4 py-2 text-xs font-bold uppercase whitespace-nowrap"
                            style={{
                              backgroundColor: primaryColor,
                              color: primaryText,
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
            </div>
          )}

          {/* LAYOUT D: FULL-WIDTH LUXURY SUITE ROWS (#04 & #13) */}
          {template.roomsLayout === 'luxury-rows' && (
            <div className="space-y-5 @3xl:space-y-6">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="border p-4 @3xl:p-6 grid grid-cols-1 @5xl:grid-cols-12 gap-4 @3xl:gap-6 items-center text-left"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderRadius: btnRadius === '9999px' ? '22px' : '12px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="@5xl:col-span-4 aspect-[16/10] overflow-hidden cursor-pointer bg-slate-200 rounded-lg"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="@5xl:col-span-5 space-y-2">
                      <h3 className="text-lg @3xl:text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                        {room.name}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedText }}>
                        {room.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1" style={{ color: mutedText }}>
                        <span>{room.room_size} m²</span>
                        <span>•</span>
                        <span>Up to {room.max_guests} Guests</span>
                        <span>•</span>
                        <span>{room.bed_type}</span>
                      </div>
                    </div>
                    <div
                      className="@5xl:col-span-3 pt-3 @5xl:pt-0 border-t @5xl:border-t-0 @5xl:border-l @5xl:pl-6 flex flex-wrap @5xl:flex-col items-end justify-between gap-3"
                      style={{ borderColor: cardBorder }}
                    >
                      {renderRoomPrice(room)}
                      <a
                        href={getReserveHref(room.id)}
                        className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{
                          backgroundColor: primaryColor,
                          color: primaryText,
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
            <div className="divide-y border-y" style={{ borderColor: cardBorder }}>
              {rooms.map((room, idx) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="py-6 @3xl:py-8 grid grid-cols-1 @3xl:grid-cols-12 gap-4 @3xl:gap-6 items-center text-left"
                    style={{ borderColor: cardBorder }}
                  >
                    <div className="hidden @3xl:block @3xl:col-span-1 text-xs font-mono opacity-55">
                      0{idx + 1}
                    </div>
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="@3xl:col-span-4 aspect-[16/10] overflow-hidden cursor-pointer bg-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="@3xl:col-span-4 space-y-1.5">
                      <span className="@3xl:hidden text-[10px] font-mono opacity-60">0{idx + 1}</span>
                      <h3 className="text-lg @3xl:text-xl font-semibold" style={{ color: textColor, fontFamily: fontStack }}>
                        {room.name}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedText }}>
                        {room.description}
                      </p>
                      <p className="text-[11px]" style={{ color: mutedText }}>
                        {room.room_size} m² · {room.bed_type} · Max {room.max_guests} Guests
                      </p>
                    </div>
                    <div className="@3xl:col-span-3 flex flex-wrap @3xl:flex-col items-end justify-between gap-3 pt-2 @3xl:pt-0">
                      {renderRoomPrice(room, { compact: true })}
                      <a
                        href={getReserveHref(room.id)}
                        className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border whitespace-nowrap"
                        style={{
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                          color: primaryText,
                          borderRadius: btnRadius,
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
            <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-6 @3xl:gap-8">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const thumbs = photos.length > 1 ? photos.slice(1, 5) : heroPhotos.slice(0, 4);
                return (
                  <div
                    key={room.id}
                    className="border rounded-2xl @3xl:rounded-3xl overflow-hidden shadow-md flex flex-col text-left"
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
                    <div
                      className="grid grid-cols-4 gap-1.5 p-2 border-b"
                      style={{ backgroundColor: subtleSurface, borderColor: cardBorder }}
                    >
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
                    <div className="p-4 @3xl:p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-lg @3xl:text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                      </div>
                      <div
                        className="pt-3 border-t flex flex-wrap items-end justify-between gap-3"
                        style={{ borderColor: cardBorder }}
                      >
                        {renderRoomPrice(room)}
                        <a
                          href={getReserveHref(room.id)}
                          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                          style={{
                            backgroundColor: primaryColor,
                            color: primaryText,
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
            <div className="grid grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-3 gap-7 @3xl:gap-8">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div key={room.id} className="text-center space-y-3.5">
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="aspect-[4/4] @3xl:aspect-[4/5] rounded-t-[160px] @3xl:rounded-t-[200px] rounded-b-2xl overflow-hidden shadow-lg cursor-pointer bg-slate-200 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="space-y-2 px-2">
                      <h3 className="text-lg @3xl:text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                        {room.name}
                      </h3>
                      <p className="text-xs line-clamp-2" style={{ color: mutedText }}>
                        {room.bed_type} • {room.room_size} m² • Up to {room.max_guests} Guests
                      </p>
                      <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                        {renderRoomPrice(room, { align: 'center', compact: true })}
                        <a
                          href={getReserveHref(room.id)}
                          className="px-5 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                          style={{
                            backgroundColor: primaryColor,
                            color: primaryText,
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

          {/* LAYOUT H: TALL 3:4 PORTRAIT CINEMA POSTER CARDS (#12 — Dynamically respects custom colors!) */}
          {template.roomsLayout === 'portrait-posters' && (
            <div className="grid grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-3 gap-5 @3xl:gap-6">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="border overflow-hidden flex flex-col text-left group"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: withAlpha(accentColor, 0.35),
                      borderRadius: btnRadius === '0px' ? '0px' : '12px',
                    }}
                  >
                    <div
                      onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                      className="aspect-[4/4] @3xl:aspect-[3/4] overflow-hidden cursor-pointer bg-slate-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4 @3xl:p-5 space-y-3 flex-1 flex flex-col justify-between" style={{ color: textColor }}>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold" style={{ fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs" style={{ color: mutedText }}>
                          {room.room_size} m² • {room.bed_type} • Max {room.max_guests}
                        </p>
                      </div>
                      <div className="space-y-3 pt-2 border-t" style={{ borderColor: cardBorder }}>
                        {renderRoomPrice(room, { compact: true })}
                        <a
                          href={getReserveHref(room.id)}
                          className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-widest block"
                          style={{
                            backgroundColor: primaryColor,
                            color: primaryText,
                            borderRadius: btnRadius,
                          }}
                        >
                          Book Suite
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LAYOUT I: DIRECT-BOOKING RATE COMPARISON TABLE PRO (#14) */}
          {template.roomsLayout === 'rate-table-pro' && (
            <div
              className="border rounded-2xl overflow-hidden shadow-xs divide-y"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div
                className="hidden @5xl:grid grid-cols-12 px-6 py-3 text-[11px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: primaryColor, color: primaryText }}
              >
                <div className="col-span-4">Room Type</div>
                <div className="col-span-4">Direct Booking Benefits</div>
                <div className="col-span-2">Occupancy</div>
                <div className="col-span-2 text-right">Lowest Direct Rate</div>
              </div>

              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                return (
                  <div
                    key={room.id}
                    className="p-4 @3xl:p-6 grid grid-cols-1 @5xl:grid-cols-12 gap-4 @3xl:gap-5 items-center text-left"
                    style={{ borderColor: cardBorder }}
                  >
                    <div className="@5xl:col-span-4 flex items-center gap-3.5">
                      <div
                        onClick={() => openLightbox(photos.length ? photos : [cover], 0, room.name)}
                        className="w-24 h-20 @3xl:w-28 @3xl:h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold" style={{ color: textColor }}>
                          {room.name}
                        </h3>
                        <span className="text-xs block" style={{ color: mutedText }}>
                          {room.room_size} m² • {room.bed_type}
                        </span>
                      </div>
                    </div>

                    <div className="@5xl:col-span-4 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold" style={{ color: accentColor }}>
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{room.promo_name || 'Instant Direct Confirmation'}</span>
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: mutedText }}>
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                        <span className="line-clamp-1">
                          {(room.amenities || []).slice(0, 3).join(' • ') || 'Free Wi-Fi • Air Conditioning'}
                        </span>
                      </div>
                    </div>

                    <div className="@5xl:col-span-2 text-xs font-semibold" style={{ color: textColor }}>
                      Up to {room.max_guests} Guests
                    </div>

                    <div className="@5xl:col-span-2 flex flex-wrap @5xl:flex-col items-end justify-between gap-2.5 pt-2 @5xl:pt-0 border-t @5xl:border-t-0" style={{ borderColor: cardBorder }}>
                      {renderRoomPrice(room, { compact: true })}
                      <a
                        href={getReserveHref(room.id)}
                        className="px-4 py-2 text-xs font-bold uppercase whitespace-nowrap"
                        style={{
                          backgroundColor: primaryColor,
                          color: primaryText,
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
            <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-6 @3xl:gap-8">
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
                      borderColor: isDoubleBorder ? withAlpha(accentColor, 0.55) : cardBorder,
                      borderRadius: btnRadius === '0px' ? '0px' : '16px',
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
                    <div className="p-4 @3xl:p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg @3xl:text-xl font-bold" style={{ color: textColor, fontFamily: fontStack }}>
                          {room.name}
                        </h3>
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                      </div>
                      <div className="space-y-3.5">
                        <div
                          className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase"
                          style={{ borderColor: cardBorder, color: mutedText }}
                        >
                          <span>{room.room_size} m²</span>
                          <span>Max {room.max_guests} Guests</span>
                          <span>{room.bed_type}</span>
                        </div>
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          {renderRoomPrice(room)}
                          <a
                            href={getReserveHref(room.id)}
                            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{
                              backgroundColor: primaryColor,
                              color: primaryText,
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
    if (template.aboutLayout === 'bento-highlights') {
      return (
        <section className="max-w-7xl mx-auto px-3 @3xl:px-6 py-8 @3xl:py-12">
          <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-4 gap-3.5 @3xl:gap-4">
            {facilitiesData.slice(0, 4).map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-5 border text-left space-y-2"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderRadius: template.shellStyle === 'card-stack-canvas' ? '22px' : '16px',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: withAlpha(accentColor, 0.14),
                    color: accentColor,
                  }}
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
        <section className="py-10 @3xl:py-20 px-4 @3xl:px-6 border-b" style={{ borderColor: cardBorder }}>
          <div className="max-w-3xl mx-auto text-center space-y-4 @3xl:space-y-5">
            <span
              className="text-[10px] @3xl:text-xs font-bold uppercase tracking-[0.28em]"
              style={{ color: accentColor }}
            >
              {aboutData.badge}
            </span>
            <h2
              className="text-2xl @3xl:text-5xl font-bold leading-tight"
              style={{ color: textColor, fontFamily: fontStack }}
            >
              {aboutData.title}
            </h2>
            <div className="w-16 h-[1.5px] mx-auto" style={{ backgroundColor: accentColor }} />
            <p className="text-xs @3xl:text-sm leading-relaxed" style={{ color: mutedText }}>
              {aboutData.description}
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className="max-w-7xl mx-auto px-4 @3xl:px-6 py-10 @3xl:py-20 grid grid-cols-1 @5xl:grid-cols-12 gap-8 @3xl:gap-12 items-center">
        <div className="@5xl:col-span-6 space-y-4 @3xl:space-y-5 text-left">
          <span
            className="text-[10px] @3xl:text-[11px] font-bold uppercase tracking-[0.28em]"
            style={{ color: accentColor }}
          >
            {aboutData.badge}
          </span>
          <h2
            className="text-2xl @3xl:text-4xl font-bold leading-tight"
            style={{ color: textColor, fontFamily: fontStack }}
          >
            {aboutData.title}
          </h2>
          <div className="w-14 h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <p className="text-xs @3xl:text-sm leading-relaxed" style={{ color: mutedText }}>
            {aboutData.description}
          </p>
          <div className="grid grid-cols-1 @xl:grid-cols-2 gap-3.5 pt-2">
            {aboutData.features.map((f: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 @3xl:p-4 border rounded-xl"
                style={{ borderColor: cardBorder, backgroundColor: cardBg }}
              >
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

        <div className="@5xl:col-span-6 grid grid-cols-12 gap-3 @3xl:gap-4 items-center">
          <div
            className={`col-span-7 h-48 @3xl:h-80 overflow-hidden shadow-lg bg-slate-200 ${
              template.aboutLayout === 'arched-trio' ? 'rounded-t-[120px] @3xl:rounded-t-[160px]' : 'rounded-2xl'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aboutData.primaryImage} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
          <div
            className={`col-span-5 h-40 @3xl:h-64 overflow-hidden shadow-md bg-slate-200 ${
              template.aboutLayout === 'arched-trio' ? 'rounded-t-[90px] @3xl:rounded-t-[120px]' : 'rounded-2xl'
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
  // GALLERY STRIP + DYNAMIC COLOR FOOTER
  // =========================================================================
  const renderGalleryStrip = () => {
    if (heroPhotos.length < 2) return null;
    return (
      <section id="gallery" className="max-w-7xl mx-auto px-4 @3xl:px-6 py-10 @3xl:py-14 space-y-6 @3xl:space-y-8">
        <div className="flex items-end justify-between gap-3">
          <div className="text-left">
            <span
              className="text-[10px] @3xl:text-xs font-bold uppercase tracking-[0.25em] block"
              style={{ color: accentColor }}
            >
              Visual Journey
            </span>
            <h2 className="text-xl @3xl:text-3xl font-bold mt-1" style={{ color: textColor, fontFamily: fontStack }}>
              Property Gallery
            </h2>
          </div>
          <a
            href={isPreview ? '#gallery' : `${tenantPrefix}/gallery`}
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
            style={{ color: accentColor }}
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-2.5 @3xl:gap-3">
          {heroPhotos.slice(0, 8).map((url, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(heroPhotos, idx, hotel.name)}
              className={`aspect-[4/3] overflow-hidden cursor-pointer group bg-slate-200 ${
                template.id === 'mediterranean-arch'
                  ? 'rounded-t-[80px] @3xl:rounded-t-[120px] rounded-b-xl'
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

  const footerBg = isDark ? subtleSurface : primaryColor;
  const footerText = isDark ? textColor : primaryText;

  const renderFooter = () => (
    <footer
      className="pt-10 @3xl:pt-14 pb-12 @3xl:pb-16 px-4 @3xl:px-6 border-t"
      style={{
        backgroundColor: footerBg,
        color: withAlpha(footerText, 0.9),
        borderColor: withAlpha(footerText, 0.1),
      }}
    >
      <div className="max-w-7xl mx-auto space-y-8 @3xl:space-y-10">
        {activeTheme.footer_layout === 'luxury' ? (
          <div
            className="text-center space-y-3.5 pb-7 border-b"
            style={{ borderColor: withAlpha(footerText, 0.12) }}
          >
            <h3
              className="text-xl @3xl:text-3xl font-bold uppercase tracking-[0.18em] @3xl:tracking-[0.22em]"
              style={{ color: accentColor, fontFamily: fontStack }}
            >
              {hotel.name}
            </h3>
            {hotel.address && <p className="text-xs opacity-75">{hotel.address}</p>}
            <div className="flex flex-wrap justify-center gap-5 text-xs uppercase tracking-widest opacity-85 pt-2">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col @3xl:flex-row justify-between items-start @3xl:items-center gap-5 pb-7 border-b"
            style={{ borderColor: withAlpha(footerText, 0.12) }}
          >
            <div className="text-left space-y-1">
              <h3
                className="text-base @3xl:text-lg font-bold uppercase tracking-widest"
                style={{ color: accentColor, fontFamily: fontStack }}
              >
                {hotel.name}
              </h3>
              {hotel.address && <p className="text-xs opacity-70">{hotel.address}</p>}
            </div>
            <div className="flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-widest opacity-85">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col @xl:flex-row justify-between items-center gap-2 text-[11px] opacity-60 text-center @xl:text-left">
          <span>© {new Date().getFullYear()} {hotel.name}. All Rights Reserved.</span>
          <span>Official Direct Website • Best Rate Guaranteed</span>
        </div>
      </div>
    </footer>
  );

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
  // ROOT @container SHELL WRAPPER (#08 LEFT SIDEBAR VS TOP-HEADER SHELLS)
  // =========================================================================
  const rootBg =
    template.shellStyle === 'card-stack-canvas' ? canvasStackBg : bgColor;

  return (
    <div
      id="top"
      className="@container min-h-screen w-full overflow-x-clip transition-colors duration-300"
      style={{
        backgroundColor: rootBg,
        color: textColor,
        fontFamily: fontStack,
      }}
    >
      {template.shellStyle === 'left-sidebar' ? (
        <div className="flex flex-col @5xl:flex-row min-h-screen">
          {/* MOBILE STICKY HEADER FOR #08 (< @5xl) */}
          <header
            className="@5xl:hidden sticky top-0 z-40 border-b backdrop-blur-md"
            style={{ backgroundColor: withAlpha(cardBg, 0.96), borderColor: cardBorder }}
          >
            <div className="px-4 py-3 flex items-center justify-between gap-2.5">
              <div className="min-w-0 text-left">
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.25em] block"
                  style={{ color: accentColor }}
                >
                  Official Residence
                </span>
                <span
                  className="text-sm font-bold uppercase tracking-wider block truncate"
                  style={{ color: textColor, fontFamily: fontStack }}
                >
                  {hotel.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getReserveHref()}
                  className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryText,
                    borderRadius: btnRadius,
                  }}
                >
                  Book
                </a>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((p) => !p)}
                  className="p-2 rounded-lg border cursor-pointer"
                  style={{ borderColor: cardBorder, color: textColor }}
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {renderMobileNavDrawer()}
          </header>

          {/* DESKTOP FIXED ARCHITECTURAL LEFT SIDEBAR (#08 @5xl+) */}
          <aside
            className="hidden @5xl:flex @5xl:w-72 @5xl:sticky @5xl:top-0 @5xl:h-screen border-r p-8 flex-col justify-between shrink-0 text-left"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <div className="space-y-8">
              <div>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.28em] block mb-1"
                  style={{ color: accentColor }}
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

              <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.18em]">
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

            <div className="space-y-4 pt-6 border-t" style={{ borderColor: cardBorder }}>
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
                  backgroundColor: primaryColor,
                  color: primaryText,
                  borderRadius: btnRadius,
                }}
              >
                Check Availability →
              </a>
            </div>
          </aside>

          {/* RIGHT SCROLLING VIEWPORT */}
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
            <span className="text-xs @3xl:text-sm font-semibold truncate pr-3">
              {lightboxTitle} ({lightboxIdx + 1} / {lightboxPhotos.length})
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer shrink-0"
              style={{ color: '#ffffff' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl aspect-[4/3] @3xl:aspect-[16/10] flex items-center justify-center overflow-hidden rounded-xl bg-black"
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
                  className="absolute left-3 p-2.5 @3xl:p-3 rounded-full bg-black/60 cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIdx((p) => (p + 1) % lightboxPhotos.length)}
                  className="absolute right-3 p-2.5 @3xl:p-3 rounded-full bg-black/60 cursor-pointer"
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
