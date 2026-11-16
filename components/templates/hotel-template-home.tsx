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
  Camera,
  ChevronDown,
  Flag,
  Trees,
  Dumbbell,
  Presentation,
  ShoppingBag,
  Car,
  Waves,
  Utensils,
  Plane,
  Wifi,
  Sparkles,
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
import { buildGoogleDirectionsUrl } from '@/lib/map-utils';
import {
  resolveHotelHighlights,
  isTheParPhuketHotel,
  type HighlightIconKey,
} from '@/lib/hotel-seo-highlights';
import { deriveSurfacePalette, isDarkColor, withAlpha } from '@/lib/color-utils';
import { SwipeablePhotoSlider, SwipeableLightbox } from '@/components/ui/swipeable-photo-slider';
import TemplateBookingForm from './template-booking-form';
import PromotionsSection from '@/components/sections/promotions-section';
import LocationSection from '@/components/sections/location-section';
import ContactSection from '@/components/sections/contact-section';
import { useHotelLocale } from '@/components/hotel-locale-provider';
import LanguageSwitcher from '@/components/language-switcher';

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
  const { locale, ui } = useHotelLocale();

  const [slideIdx, setSlideIdx] = useState(0);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [rosewoodTabIdx, setRosewoodTabIdx] = useState(0);
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
      if (u && !list.includes(u) && list.length < 12) list.push(u);
    }
    for (const r of rooms) {
      for (const img of r.gallery || []) {
        const u = cleanImg(img);
        if (u && !list.includes(u) && list.length < 12) list.push(u);
      }
    }
    if (list.length === 0) list.push(template.fallbackHeroImage);
    return list;
  }, [slides, gallery, rooms, template.fallbackHeroImage]);

  // Expanded gallery pool for Property Gallery carousel & Lightbox
  const galleryPhotosPool = useMemo(() => {
    const list: string[] = [];
    for (const g of gallery) {
      const u = cleanImg(g.image_url);
      if (u && !list.includes(u) && list.length < 24) list.push(u);
    }
    for (const s of slides) {
      const u = cleanImg(s.image_url);
      if (u && !list.includes(u) && list.length < 24) list.push(u);
    }
    for (const r of rooms) {
      for (const img of r.gallery || []) {
        const u = cleanImg(img);
        if (u && !list.includes(u) && list.length < 24) list.push(u);
      }
    }
    if (list.length === 0) return heroPhotos;
    return list;
  }, [gallery, slides, rooms, heroPhotos]);

  const currentHeroImg = heroPhotos[slideIdx % heroPhotos.length] || template.fallbackHeroImage;

  const aboutData = useMemo(() => {
    const found = sections.find((s) => s.section_type === 'about' && s.is_enabled);
    const content = found?.content || {};
    const isParPhuket = isTheParPhuketHotel(hotel.slug, hotel.name);
    const isGenericFlowstayPlaceholder =
      typeof content.description === 'string' &&
      content.description.includes('Experience warm hospitality, thoughtfully designed rooms');

    const rawDesc =
      typeof content.description === 'string' &&
      content.description.trim() &&
      !(isParPhuket && isGenericFlowstayPlaceholder)
        ? content.description.trim()
        : isParPhuket
        ? `Surrounded by the lush fairways of Phuket Country Club Golf Course in Kathu, The Par Phuket is a distinctive golf and lifestyle hotel blending serene greenery views with modern boutique comfort.\n\nGuests enjoy an on-site Muay Thai training camp, dedicated meeting & conference facilities, spacious on-site parking, and convenient proximity to Bang Wad Reservoir and Central Festival Phuket.`
        : `Welcome to ${hotel.name}. Experience warm hospitality, thoughtfully designed accommodations, and effortless comfort. Book directly on our official website for exclusive direct rates and privileges.`;
    const parsedParagraphs = rawDesc
      .split(/\n+/)
      .map((p: string) => p.trim())
      .filter(Boolean);

    const rawStory2Desc =
      typeof content.story2_description === 'string' && content.story2_description.trim()
        ? content.story2_description.trim()
        : '';
    const story2Paragraphs = rawStory2Desc
      ? rawStory2Desc
          .split(/\n+/)
          .map((p: string) => p.trim())
          .filter(Boolean)
      : [];

    const fallbackImg1 =
      galleryPhotosPool[1] || heroPhotos[1] || galleryPhotosPool[0] || heroPhotos[0];
    const fallbackImg2 =
      galleryPhotosPool[2] ||
      heroPhotos[2] ||
      (galleryPhotosPool[0] !== fallbackImg1 ? galleryPhotosPool[0] : heroPhotos[0]);

    const customFeatures: Array<{ title: string; desc: string; image_url?: string }> =
      Array.isArray(content.features) && content.features.length > 0
        ? content.features
        : [];

    const highlights = resolveHotelHighlights(
      content.highlights,
      hotel.slug,
      hotel.name,
      locale
    );

    return {
      badge:
        content.badge ||
        (isParPhuket
          ? locale === 'th'
            ? 'โรงแรมสไตล์กอล์ฟและไลฟ์สไตล์ในภูเก็ต'
            : 'Golf & Lifestyle Hotel in Phuket'
          : ui.badges.officialWebsite),
      subtitle:
        content.subtitle ||
        (locale === 'th' ? `ยินดีต้อนรับสู่ ${hotel.name}` : `Welcome to ${hotel.name}`),
      title:
        content.title && !(isParPhuket && content.title === hotel.name)
          ? content.title
          : isParPhuket
          ? locale === 'th'
            ? 'พักผ่อนท่ามกลางสนามกอล์ฟและธรรมชาติ ที่ เดอะ พาร์ ภูเก็ต'
            : 'Golf & Lifestyle Sanctuary At The Par Phuket'
          : hotel.name,
      description: rawDesc,
      paragraphs: parsedParagraphs,
      hasCustomStory2: Boolean(content.story2_title?.trim() || rawStory2Desc),
      story2Title:
        content.story2_title?.trim() ||
        (locale === 'th' ? `วางแผนการเข้าพักที่ ${hotel.name}` : `Plan Your Stay at ${hotel.name}`),
      story2Paragraphs,
      primaryImage: cleanImg(content.primary_image_url) || fallbackImg1,
      secondaryImage: cleanImg(content.secondary_image_url) || fallbackImg2,
      customFeatures,
      highlights,
      features:
        customFeatures.length > 0
          ? customFeatures
          : [
              {
                title: locale === 'th' ? 'การันตีราคาดีที่สุด' : 'Best Rate Guaranteed',
                desc:
                  locale === 'th'
                    ? 'ราคาและสิทธิพิเศษเฉพาะการสำรองห้องพักโดยตรง'
                    : 'Exclusive direct booking rates & perks.',
              },
              {
                title: locale === 'th' ? 'ทำเลสะดวกสบาย' : 'Convenient Location',
                desc:
                  hotel.address ||
                  (locale === 'th'
                    ? 'เดินทางสะดวกสบาย เหมาะสำหรับการพักผ่อน'
                    : 'Thoughtfully situated for your stay.'),
              },
            ],
    };
  }, [sections, hotel.slug, hotel.name, hotel.address, heroPhotos, galleryPhotosPool, locale, ui.badges.officialWebsite]);

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
    { label: ui.nav.home, href: isPreview ? '#top' : tenantPrefix || '/' },
    { label: ui.nav.rooms, href: isPreview ? '#rooms' : `${tenantPrefix}/rooms` },
    { label: ui.nav.promotions, href: isPreview ? '#promotions' : `${tenantPrefix}/promotions` },
    { label: ui.nav.gallery, href: isPreview ? '#gallery' : `${tenantPrefix}/gallery` },
    { label: ui.nav.contact, href: isPreview ? '#contact' : `${tenantPrefix}/contact` },
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
            {ui.badges.officialDirectRate}
          </span>
          <span className="text-xs font-semibold" style={{ color: mutedText }}>
            {ui.cta.checkAvailability}
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
              {ui.badges.lowestDirectRate}
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
            {ui.badges.perNight}
          </span>
        </div>
      </div>
    );
  };

  const mapDirectionsHref = buildGoogleDirectionsUrl(
    hotel.google_map_url,
    hotel.name,
    hotel.address
  );

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
              <a href={isPreview ? undefined : `tel:${hotel.phone}`} className="flex items-center gap-2 hover:opacity-80">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                <span>{hotel.phone}</span>
              </a>
            )}
            {hotel.email && (
              <a href={isPreview ? undefined : `mailto:${hotel.email}`} className="flex items-center gap-2 truncate hover:opacity-80">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">{hotel.email}</span>
              </a>
            )}
            {hotel.address && (
              <a
                href={isPreview ? '#location' : mapDirectionsHref}
                target={isPreview ? undefined : '_blank'}
                rel={isPreview ? undefined : 'noopener noreferrer'}
                className="flex items-start gap-2 hover:opacity-80"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                <span className="leading-snug underline-offset-2 hover:underline">{hotel.address}</span>
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mutedText }}>
            {locale === 'th' ? 'ภาษา / Language' : 'Language'}
          </span>
          <LanguageSwitcher color={textColor} borderColor={cardBorder} />
        </div>

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
          {ui.cta.bookDirectBestRate}
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
    // -1. Rosewood Heritage 2-Tier Ivory Header (#18: Global Brand Bar + Sticky Serif Sub-Nav + Forest Jade RESERVE Button)
    if (template.shellStyle === 'rosewood-heritage') {
      const nameWords = (hotel.name || 'Luxury Sanctuary').trim().split(/\s+/);
      const brandLine1 = nameWords[0] || hotel.name;
      const brandLine2 = nameWords.length > 1 ? nameWords.slice(1).join(' ') : 'OFFICIAL SANCTUARY';
      const rosewoodLinks = [
        { label: ui.nav.discover, href: '#sense-of-place' },
        { label: ui.nav.overview, href: isPreview ? '#top' : tenantPrefix || '/' },
        { label: ui.nav.offers, href: '#full-width-carousel' },
        { label: ui.nav.accommodation, href: isPreview ? '#rooms' : `${tenantPrefix}/rooms` },
        { label: ui.nav.experiences, href: '#sense-of-place' },
        { label: ui.nav.gallery, href: isPreview ? '#gallery' : `${tenantPrefix}/gallery` },
        { label: ui.nav.location, href: isPreview ? '#location' : `${tenantPrefix}/contact` },
      ];

      return (
        <>
          {/* TIER 1: GLOBAL BRAND BAR (Scrolls away gently on scroll down, matching Rosewood!) */}
          <div
            className="hidden @3xl:block w-full border-b px-8 py-3.5 transition-colors"
            style={{
              backgroundColor: bgColor,
              color: textColor,
              borderColor: cardBorder,
            }}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
              <div className="text-left">
                <a
                  href={isPreview ? '#sense-of-place' : mapDirectionsHref}
                  target={isPreview ? undefined : '_blank'}
                  rel={isPreview ? undefined : 'noopener noreferrer'}
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] pb-1 border-b hover:opacity-70 transition-opacity font-sans"
                  style={{ color: textColor, borderColor: textColor }}
                >
                  OFFICIAL COLLECTION
                </a>
              </div>

              <div className="text-center">
                <a
                  href={isPreview ? '#top' : tenantPrefix || '/'}
                  className="text-base @5xl:text-lg font-bold uppercase tracking-[0.3em] font-sans"
                  style={{ color: textColor }}
                >
                  {hotel.name}
                </a>
              </div>

              <div className="text-right flex items-center justify-end gap-4">
                {hotel.phone && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.18em] pb-1 border-b font-sans"
                    style={{ color: textColor, borderColor: textColor }}
                  >
                    TEL {hotel.phone}
                  </span>
                )}
                {!isPreview && <LanguageSwitcher color={textColor} compact />}
              </div>
            </div>
          </div>

          {/* TIER 2: STICKY PROPERTY SUB-NAVIGATION BAR */}
          <header
            className="sticky top-0 z-40 border-b backdrop-blur-md transition-all"
            style={{
              backgroundColor: withAlpha(bgColor, 0.97),
              color: textColor,
              borderColor: cardBorder,
            }}
          >
            {/* Mobile Sleek Header (< @3xl) */}
            <div className="@3xl:hidden px-4 py-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="p-2 cursor-pointer"
                style={{ color: textColor }}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              <a
                href={isPreview ? '#top' : tenantPrefix || '/'}
                className="text-xs font-bold uppercase tracking-[0.24em] truncate font-sans text-center"
                style={{ color: textColor }}
              >
                {hotel.name}
              </a>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isPreview && <LanguageSwitcher color={textColor} compact />}
                <a
                  href={getReserveHref()}
                  className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] font-sans shrink-0"
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryText,
                    borderRadius: btnRadius,
                  }}
                >
                  {ui.cta.reserve}
                </a>
              </div>
            </div>

            {/* Desktop Tier-2 Sub-Nav (@3xl+) */}
            <div className="hidden @3xl:flex max-w-7xl mx-auto px-8 py-4 items-center justify-between gap-6">
              {/* Left Stacked Property Selector Identity */}
              <a
                href={isPreview ? '#top' : tenantPrefix || '/'}
                className="flex items-center gap-3 text-left shrink-0 group"
              >
                {hotel.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cleanImg(hotel.logo_url)}
                    alt={hotel.name}
                    className="w-8 h-8 object-contain shrink-0"
                  />
                )}
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col leading-snug font-sans">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                      style={{ color: textColor }}
                    >
                      {brandLine1}
                    </span>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.2em] truncate max-w-[180px]"
                      style={{ color: textColor }}
                    >
                      {brandLine2}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" style={{ color: textColor }} />
                </div>
              </a>

              {/* Center Delicate Title-Case High-Contrast Serif Links */}
              <nav className="flex flex-wrap items-center justify-center gap-6 @5xl:gap-8">
                {rosewoodLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[15px] @5xl:text-[16px] font-normal tracking-normal hover:opacity-65 underline-offset-8 hover:underline transition-all"
                    style={{ color: textColor, fontFamily: fontStack }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Right Deep Forest Jade / Primary Sharp RESERVE Button */}
              <a
                href={getReserveHref()}
                className="px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] font-sans hover:opacity-90 transition-opacity shrink-0"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryText,
                  borderRadius: btnRadius,
                }}
              >
                RESERVE
              </a>
            </div>

            {renderMobileNavDrawer()}
          </header>
        </>
      );
    }

    // 0. Hotel Indigo Boutique Header (#17: Deep Teal/Primary Bar + Gold Active HOME Pill + White BOOK NOW Button)
    if (template.shellStyle === 'indigo-boutique') {
      const indigoHeaderIsDark = isDarkColor(primaryColor);
      const bookBtnBg = indigoHeaderIsDark ? '#ffffff' : textColor;
      const bookBtnText = indigoHeaderIsDark ? primaryColor : bgColor;
      const indigoNavRow1 = [
        { label: ui.nav.home, href: isPreview ? '#top' : tenantPrefix || '/', active: true },
        { label: ui.nav.ourRooms, href: isPreview ? '#rooms' : `${tenantPrefix}/rooms` },
        ...(promotions.length > 0
          ? [{ label: ui.nav.offers, href: isPreview ? '#promotions' : `${tenantPrefix}/promotions`, hasCaret: true }]
          : []),
        { label: ui.nav.amenitiesFacilities, href: '#experience-mosaic' },
        { label: ui.nav.gallery, href: isPreview ? '#gallery' : `${tenantPrefix}/gallery` },
      ];
      const indigoNavRow2 = [
        { label: ui.nav.neighborhoodStory, href: '#neighborhood-story', hasCaret: true },
        { label: ui.nav.directPrivileges, href: '#settle-in', hasCaret: true },
        { label: ui.nav.locationContact, href: isPreview ? '#location' : `${tenantPrefix}/contact` },
      ];

      return (
        <header
          className="sticky top-0 z-40 shadow-lg backdrop-blur-md transition-colors duration-300 border-b"
          style={{
            backgroundColor: withAlpha(primaryColor, 0.96),
            color: primaryText,
            borderColor: withAlpha(primaryText, 0.1),
          }}
        >
          {/* MOBILE HEADER (< @3xl) */}
          <div className="@3xl:hidden px-4 py-3 flex items-center justify-between gap-2.5">
            <a
              href={isPreview ? '#top' : tenantPrefix || '/'}
              className="flex items-center gap-2.5 min-w-0 text-left"
            >
              {hotel.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanImg(hotel.logo_url)}
                  alt={hotel.name}
                  className="w-8 h-8 rounded object-contain bg-white/95 p-0.5 shrink-0"
                />
              )}
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-[8px] font-bold uppercase tracking-[0.28em] opacity-80">
                  HOTEL
                </span>
                <span
                  className="text-sm font-bold uppercase tracking-[0.14em] truncate mt-0.5"
                  style={{ fontFamily: fontStack, color: primaryText }}
                >
                  {hotel.name}
                </span>
              </div>
            </a>

            <div className="flex items-center gap-1.5 shrink-0">
              {!isPreview && <LanguageSwitcher color={primaryText} compact />}
              <a
                href={getReserveHref()}
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] shadow-xs whitespace-nowrap"
                style={{
                  backgroundColor: bookBtnBg,
                  color: bookBtnText,
                  borderRadius: btnRadius,
                  fontFamily: fontStack,
                }}
              >
                {ui.cta.bookNow}
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="p-2 border cursor-pointer"
                style={{
                  borderColor: withAlpha(primaryText, 0.25),
                  color: primaryText,
                  borderRadius: btnRadius,
                }}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* DESKTOP BOUTIQUE EMBLEM + 2-TIER NAV + WHITE BOOK NOW CTA (@3xl+) */}
          <div className="hidden @3xl:flex max-w-7xl mx-auto px-6 py-3.5 items-center justify-between gap-6">
            {/* Left Stacked Boutique Crest */}
            <a
              href={isPreview ? '#top' : tenantPrefix || '/'}
              className="flex items-center gap-3 shrink-0 group text-center"
            >
              {hotel.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanImg(hotel.logo_url)}
                  alt={hotel.name}
                  className="w-10 h-10 rounded object-contain bg-white/95 p-1 shrink-0"
                />
              )}
              <div className="flex flex-col items-center leading-tight">
                <span className="text-[9px] font-semibold uppercase tracking-[0.32em] opacity-85">
                  BOUTIQUE HOTEL
                </span>
                <span
                  className="text-base @5xl:text-lg font-bold uppercase tracking-[0.18em] mt-0.5"
                  style={{ fontFamily: fontStack, color: primaryText }}
                >
                  {hotel.name}
                </span>
                <div className="flex items-center gap-2 mt-1 opacity-75">
                  <span className="w-4 h-[1px]" style={{ backgroundColor: primaryText }} />
                  <span className="text-[8px] uppercase tracking-[0.26em]">OFFICIAL STAY</span>
                  <span className="w-4 h-[1px]" style={{ backgroundColor: primaryText }} />
                </div>
              </div>
            </a>

            {/* Center 2-Row Navigation with Signature Gold/Accent Active HOME Pill */}
            <nav className="flex flex-col items-center gap-1.5">
              <div className="flex flex-wrap items-center justify-center gap-5 @5xl:gap-7 text-[11px] font-bold uppercase tracking-[0.14em]">
                {indigoNavRow1.map((item) =>
                  item.active ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="px-4 py-2 transition-opacity hover:opacity-90 shadow-xs"
                      style={{
                        backgroundColor: accentColor,
                        color: accentText,
                        borderRadius: btnRadius,
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      className="inline-flex items-center gap-1 py-1 hover:opacity-75 transition-opacity"
                      style={{ color: primaryText }}
                    >
                      <span>{item.label}</span>
                      {item.hasCaret && <ChevronDown className="w-3 h-3 opacity-75" />}
                    </a>
                  )
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-[0.15em] opacity-90">
                {indigoNavRow2.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
                    style={{ color: primaryText }}
                  >
                    <span>{item.label}</span>
                    {item.hasCaret && <ChevronDown className="w-3 h-3 opacity-75" />}
                  </a>
                ))}
              </div>
            </nav>

            {/* Right Language Switcher + Crisp Solid White BOOK NOW Rectangle */}
            <div className="flex items-center gap-3 shrink-0">
              {!isPreview && (
                <LanguageSwitcher
                  color={primaryText}
                  borderColor={withAlpha(primaryText, 0.25)}
                />
              )}
              <a
                href={getReserveHref()}
                className="px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:opacity-90 transition-all shrink-0"
                style={{
                  backgroundColor: bookBtnBg,
                  color: bookBtnText,
                  borderRadius: btnRadius,
                  fontFamily: fontStack,
                }}
              >
                {ui.cta.bookNow}
              </a>
            </div>
          </div>

          {renderMobileNavDrawer()}
        </header>
      );
    }

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
              {!isPreview && <LanguageSwitcher color={textColor} compact />}
              <a
                href={getReserveHref()}
                className="px-3.5 @3xl:px-5 py-1.5 @3xl:py-2 text-[11px] @3xl:text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryText,
                  borderRadius: '9999px',
                }}
              >
                {ui.cta.book}
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
              {!isPreview && <LanguageSwitcher color={textColor} compact />}
              <a href={getReserveHref()} style={{ color: accentColor }}>
                {ui.cta.reserveDirect}
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
              <a
                href={isPreview ? undefined : `tel:${hotel.phone}`}
                className="flex items-center gap-1.5 font-medium truncate hover:opacity-80"
              >
                <Phone className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">{hotel.phone}</span>
              </a>
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
                <a
                  href={isPreview ? undefined : `tel:${hotel.phone}`}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <Phone className="w-3 h-3" style={{ color: accentColor }} />
                  {hotel.phone}
                </a>
              )}
              {hotel.email && (
                <a
                  href={isPreview ? undefined : `mailto:${hotel.email}`}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <Mail className="w-3 h-3" style={{ color: accentColor }} />
                  {hotel.email}
                </a>
              )}
            </div>
            {hotel.address && (
              <a
                href={isPreview ? '#location' : mapDirectionsHref}
                target={isPreview ? undefined : '_blank'}
                rel={isPreview ? undefined : 'noopener noreferrer'}
                title="Open Exact GPS Location in Google Maps"
                className="flex items-center gap-1.5 truncate max-w-md hover:opacity-80 transition-opacity"
              >
                <MapPin className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                <span className="truncate underline-offset-2 hover:underline">{hotel.address}</span>
              </a>
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

            <div className="flex items-center gap-1.5 shrink-0">
              {!isPreview && <LanguageSwitcher color={headerFg} compact />}
              <a
                href={getReserveHref()}
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: isLux ? accentColor : primaryColor,
                  color: isLux ? accentText : primaryText,
                  borderRadius: btnRadius,
                }}
              >
                {ui.cta.book}
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
                  {ui.badges.officialWebsite}
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
                {!isPreview && <LanguageSwitcher color={headerFg} compact />}
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
                    {ui.badges.officialWebsite}
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

              <div className="flex items-center gap-2.5 shrink-0">
                {!isPreview && (
                  <LanguageSwitcher
                    color={headerFg}
                    borderColor={withAlpha(headerFg, 0.18)}
                  />
                )}
                <a
                  href={getReserveHref()}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0 whitespace-nowrap"
                  style={{
                    backgroundColor: isLux ? accentColor : primaryColor,
                    color: isLux ? accentText : primaryText,
                    borderRadius: btnRadius,
                  }}
                >
                  {ui.cta.bookNow}
                </a>
              </div>
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
  // 16 DISTINCT HERO COMPOSITIONS (100% Container-Query Mobile + Touch Finger-Swipe)
  // =========================================================================
  const renderHero = () => {
    switch (template.heroLayout) {
      // #02 SPLIT-SCREEN 50/50 EDITORIAL
      case 'split-screen':
        return (
          <section className="w-full border-b" style={{ borderColor: cardBorder }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 @5xl:grid-cols-12 @5xl:min-h-[560px]">
              {/* Photo first on mobile (Swipeable with finger!), right 50% on desktop */}
              <div className="@5xl:col-span-6 @5xl:order-2 relative h-[260px] @3xl:h-[380px] @5xl:h-auto overflow-hidden bg-slate-200">
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  controlledIndex={slideIdx}
                  onIndexChange={setSlideIdx}
                  arrowsMode="bottom-right"
                  showCounter={heroPhotos.length > 1}
                  counterPositionClass="top-3 right-3"
                  onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
                />
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
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  controlledIndex={slideIdx}
                  onIndexChange={setSlideIdx}
                  arrowsMode="desktop-hover"
                  dotsBottomClass="bottom-9 @3xl:bottom-12"
                  showCounter={heroPhotos.length > 1}
                  counterPositionClass="top-3 right-3"
                  onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
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
                  <SwipeablePhotoSlider
                    photos={heroPhotos}
                    alt={hotel.name}
                    className="w-full h-full"
                    controlledIndex={slideIdx}
                    onIndexChange={setSlideIdx}
                    arrowsMode="desktop-hover"
                    showCounter={heroPhotos.length > 1}
                    counterPositionClass="top-3 right-3"
                    onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
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

            {/* Mobile: Swipeable Hero + 2 Sub-Thumbs | Desktop (@3xl+): 5-Photo Collage Grid */}
            <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-2 @3xl:gap-2.5 @3xl:h-[460px] rounded-2xl overflow-hidden">
              <div className="col-span-2 @3xl:row-span-2 h-56 @3xl:h-full relative overflow-hidden bg-slate-200">
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  arrowsMode="desktop-hover"
                  showCounter={heroPhotos.length > 1}
                  counterPositionClass="top-3 right-3"
                  onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
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
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  controlledIndex={slideIdx}
                  onIndexChange={setSlideIdx}
                  arrowsMode="desktop-hover"
                  showCounter={heroPhotos.length > 1}
                  counterPositionClass="top-3 right-3"
                  onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
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
              <SwipeablePhotoSlider
                photos={heroPhotos}
                alt={hotel.name}
                className="w-full h-full"
                controlledIndex={slideIdx}
                onIndexChange={setSlideIdx}
                arrowsMode="desktop-hover"
                dotsBottomClass="bottom-9 @3xl:bottom-12"
                showCounter={heroPhotos.length > 1}
                counterPositionClass="top-3 right-3"
                onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
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
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  arrowsMode="desktop-hover"
                  showCounter={heroPhotos.length > 1}
                  counterPositionClass="top-3 right-3"
                  onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
                />
              </div>
              <div className="@5xl:col-span-4 grid grid-cols-2 @5xl:grid-cols-1 gap-3 @3xl:gap-4 h-full">
                <div
                  onClick={() => openLightbox(heroPhotos, 1 % heroPhotos.length, hotel.name)}
                  className="h-28 @3xl:h-40 @5xl:h-full overflow-hidden bg-slate-200 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhotos[1 % heroPhotos.length]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  onClick={() => openLightbox(heroPhotos, 2 % heroPhotos.length, hotel.name)}
                  className="h-28 @3xl:h-40 @5xl:h-full overflow-hidden bg-slate-200 cursor-pointer"
                >
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
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  arrowsMode="desktop-hover"
                  showCounter={heroPhotos.length > 1}
                  counterPositionClass="top-3 right-3"
                  onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
                />
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
                <div
                  onClick={() => openLightbox(heroPhotos, 1 % heroPhotos.length, hotel.name)}
                  className="h-36 overflow-hidden bg-slate-200 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[1 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              <div
                className="order-3 @5xl:col-span-3 flex flex-col justify-between border-y py-4 @3xl:py-5 text-left space-y-4"
                style={{ borderColor: cardBorder }}
              >
                <div
                  onClick={() => openLightbox(heroPhotos, 2 % heroPhotos.length, hotel.name)}
                  className="h-36 overflow-hidden bg-slate-200 cursor-pointer"
                >
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
            {/* Mobile (< @5xl): Finger-Swipeable Hero Banner + Booking Card neatly stacked below */}
            <div className="@5xl:hidden">
              <div className="h-[260px] w-full overflow-hidden bg-slate-200">
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  controlledIndex={slideIdx}
                  onIndexChange={setSlideIdx}
                  arrowsMode="desktop-hover"
                  dotsBottomClass="bottom-10"
                  showCounter={heroPhotos.length > 1}
                  counterPositionClass="top-3 right-3"
                  onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
                />
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
              <div className="absolute inset-0">
                <SwipeablePhotoSlider
                  photos={heroPhotos}
                  alt={hotel.name}
                  className="w-full h-full"
                  controlledIndex={slideIdx}
                  onIndexChange={setSlideIdx}
                  arrowsMode="always"
                />
              </div>
              <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-8 items-center pointer-events-none">
                <div className="col-span-7" />
                <div className="col-span-5 pointer-events-auto">
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
            {/* Mobile: 1 Swipeable Featured Arch + 2 Mini Arches | Desktop: 3 Grand Arches */}
            <div className="grid grid-cols-2 @3xl:grid-cols-3 gap-3 @3xl:gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={
                    i === 0 ? undefined : () => openLightbox(heroPhotos, i % heroPhotos.length, hotel.name)
                  }
                  className={`overflow-hidden shadow-lg bg-slate-200 ${
                    i === 0
                      ? 'col-span-2 @3xl:col-span-1 h-[270px] @3xl:h-[380px] rounded-t-[150px] @3xl:rounded-t-[220px] rounded-b-2xl'
                      : i === 1
                      ? 'h-[140px] @3xl:h-[420px] @3xl:-mt-4 rounded-t-[90px] @3xl:rounded-t-[220px] rounded-b-xl @3xl:rounded-b-2xl cursor-pointer'
                      : 'h-[140px] @3xl:h-[380px] rounded-t-[90px] @3xl:rounded-t-[220px] rounded-b-xl @3xl:rounded-b-2xl cursor-pointer'
                  }`}
                >
                  {i === 0 ? (
                    <SwipeablePhotoSlider
                      photos={heroPhotos}
                      alt={hotel.name}
                      className="w-full h-full"
                      arrowsMode="none"
                      showCounter={heroPhotos.length > 1}
                      counterPositionClass="bottom-3 right-3"
                      onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroPhotos[i % heroPhotos.length]}
                      alt={hotel.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  )}
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
              <SwipeablePhotoSlider
                photos={heroPhotos}
                alt={hotel.name}
                className="w-full h-full"
                controlledIndex={slideIdx}
                onIndexChange={setSlideIdx}
                arrowsMode="desktop-hover"
                showCounter={heroPhotos.length > 1}
                counterPositionClass="top-3 right-3"
                onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
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
              <SwipeablePhotoSlider
                photos={heroPhotos}
                alt={hotel.name}
                className="w-full h-full"
                controlledIndex={slideIdx}
                onIndexChange={setSlideIdx}
                arrowsMode="desktop-hover"
                showCounter={heroPhotos.length > 1}
                counterPositionClass="top-3 right-3"
                onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
              />
            </div>
          </section>
        );

      // #14 COMPACT DIRECT-BOOKING PRO
      case 'compact-direct':
        return (
          <section className="border-b" style={{ backgroundColor: subtleSurface, borderColor: cardBorder }}>
            <div className="max-w-7xl mx-auto px-4 @3xl:px-6 py-4 @3xl:py-6 space-y-4 @3xl:space-y-5">
              <div className="grid grid-cols-1 @3xl:grid-cols-12 gap-3 h-[210px] @3xl:h-[260px] rounded-xl overflow-hidden">
                <div className="@3xl:col-span-6 h-full overflow-hidden bg-slate-200">
                  <SwipeablePhotoSlider
                    photos={heroPhotos}
                    alt={hotel.name}
                    className="w-full h-full"
                    arrowsMode="desktop-hover"
                    showCounter={heroPhotos.length > 1}
                    counterPositionClass="top-3 right-3"
                    onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
                  />
                </div>
                <div
                  onClick={() => openLightbox(heroPhotos, 1 % heroPhotos.length, hotel.name)}
                  className="hidden @3xl:block @3xl:col-span-3 h-full overflow-hidden bg-slate-200 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhotos[1 % heroPhotos.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div
                  onClick={() => openLightbox(heroPhotos, 2 % heroPhotos.length, hotel.name)}
                  className="hidden @3xl:block @3xl:col-span-3 h-full overflow-hidden bg-slate-200 cursor-pointer"
                >
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
                    onClick={
                      i === 0 ? undefined : () => openLightbox(heroPhotos, i % heroPhotos.length, hotel.name)
                    }
                    className={`relative overflow-hidden border-2 bg-slate-200 ${
                      i === 0
                        ? 'col-span-2 @3xl:col-span-1 h-[240px] @3xl:h-full'
                        : 'h-[120px] @3xl:h-full cursor-pointer group'
                    }`}
                    style={{ borderColor: withAlpha(accentColor, 0.45) }}
                  >
                    {i === 0 ? (
                      <SwipeablePhotoSlider
                        photos={heroPhotos}
                        alt={hotel.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={heroPhotos.length > 1}
                        counterPositionClass="top-3 right-3"
                        onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroPhotos[i % heroPhotos.length]}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
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
                  <SwipeablePhotoSlider
                    photos={heroPhotos}
                    alt={hotel.name}
                    className="w-full h-full"
                    controlledIndex={slideIdx}
                    onIndexChange={setSlideIdx}
                    arrowsMode="desktop-hover"
                    showCounter={heroPhotos.length > 1}
                    counterPositionClass="top-3 right-3"
                    onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
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

      // #18 ROSEWOOD CINEMATIC TABBED HERO (Full-Bleed Atmospheric Photo + Wide-Tracked Sans Eyebrow + Poetic Serif + Solid Dark DISCOVER CTA)
      case 'rosewood-cinema-tabs': {
        const activeSlideNum = (slideIdx % heroPhotos.length) + 1;
        const discoverBg = isDarkColor(secondaryColor) ? secondaryColor : '#1A1A1A';
        return (
          <section className="relative w-full h-[430px] @3xl:h-[640px] @5xl:h-[720px] overflow-hidden bg-stone-900">
            <SwipeablePhotoSlider
              photos={heroPhotos}
              alt={hotel.name}
              className="w-full h-full"
              controlledIndex={slideIdx}
              onIndexChange={setSlideIdx}
              arrowsMode="desktop-hover"
              showCounter={false}
              onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
            />

            {/* Soft Heritage Lower-Half Scrim (pointer-events-none so finger swipe works effortlessly!) */}
            <div
              className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-12 @3xl:pb-20 px-6 text-center"
              style={{
                background:
                  'linear-gradient(180deg, rgba(15,15,15,0.12) 0%, rgba(15,15,15,0.34) 55%, rgba(15,15,15,0.68) 100%)',
              }}
            >
              <div className="max-w-3xl mx-auto space-y-3.5 @3xl:space-y-5">
                <p className="text-sm @3xl:text-2xl font-bold uppercase tracking-[0.22em] text-white font-sans drop-shadow-xs">
                  SANCTUARY AT {hotel.name}
                </p>
                <h1
                  className="text-2xl @3xl:text-[38px] font-light leading-[1.22] text-white/95 drop-shadow-xs"
                  style={{ fontFamily: fontStack }}
                >
                  {aboutData.subtitle && aboutData.subtitle !== `Welcome to ${hotel.name}`
                    ? aboutData.subtitle
                    : `Make the most of your stay at timeless ${hotel.name}`}
                </h1>
                <div className="pt-2">
                  <a
                    href={getReserveHref()}
                    className="pointer-events-auto inline-block px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white font-sans hover:opacity-90 transition-opacity shadow-md"
                    style={{
                      backgroundColor: discoverBg,
                      borderRadius: btnRadius,
                    }}
                  >
                    DISCOVER
                  </a>
                </div>
              </div>

              {/* Minimalist Rosewood Slide Counter ("1 · 3") */}
              {heroPhotos.length > 1 && (
                <div className="pointer-events-auto mt-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-white/90 font-sans">
                  <span>
                    {activeSlideNum} &middot; {heroPhotos.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {heroPhotos.slice(0, 6).map((_, idx) => {
                      const isCurr = idx === slideIdx % heroPhotos.length;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSlideIdx(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          className="h-[2px] transition-all cursor-pointer"
                          style={{
                            width: isCurr ? '28px' : '12px',
                            backgroundColor: isCurr ? '#ffffff' : 'rgba(255,255,255,0.4)',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      }

      // #17 BOUTIQUE NEIGHBORHOOD STORY HERO (Full-Bleed Swipeable Photo + Centered Serif Display & Editable Story Copy)
      case 'indigo-story-hero': {
        const inlineLinkColor = isDarkColor(accentColor) ? '#F59E0B' : accentColor;
        const activeSlide = slides.length > 0 ? slides[slideIdx % slides.length] : null;
        const heroHeadline =
          activeSlide?.headline && activeSlide.headline.trim()
            ? activeSlide.headline.trim()
            : hotel.name;
        return (
          <section className="relative w-full h-[420px] @3xl:h-[620px] @5xl:h-[700px] overflow-hidden bg-slate-900">
            <SwipeablePhotoSlider
              photos={heroPhotos}
              alt={hotel.name}
              className="w-full h-full"
              controlledIndex={slideIdx}
              onIndexChange={setSlideIdx}
              arrowsMode="desktop-hover"
              showCounter={heroPhotos.length > 1}
              counterPositionClass="bottom-4 right-4"
              onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
            />

            {/* Balanced Boutique Vignette (pointer-events-none so finger swipe works everywhere!) */}
            <div
              className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center px-5 @3xl:px-10 text-center"
              style={{
                background:
                  'linear-gradient(180deg, rgba(8,20,30,0.28) 0%, rgba(8,20,30,0.48) 55%, rgba(8,20,30,0.72) 100%)',
              }}
            >
              <div className="max-w-4xl mx-auto space-y-4 @3xl:space-y-5 mt-4 @3xl:mt-8">
                <h1
                  className="text-2xl @xl:text-3xl @3xl:text-5xl @5xl:text-6xl font-normal uppercase tracking-[0.08em] leading-tight text-white drop-shadow-md"
                  style={{ fontFamily: fontStack }}
                >
                  {heroHeadline}
                </h1>

                <div className="max-w-3xl mx-auto space-y-3 text-xs @3xl:text-[15px] leading-relaxed text-white/95 font-normal drop-shadow-xs">
                  <p>{aboutData.paragraphs[0] || aboutData.description}</p>
                  <p className="hidden @xl:block">
                    {aboutData.paragraphs[1] ? (
                      <>
                        {aboutData.paragraphs[1]}{' '}
                      </>
                    ) : (
                      <>
                        Thoughtful architecture, serene surroundings, and attentive hospitality shape
                        every stay at {hotel.name}.{' '}
                      </>
                    )}
                    <a
                      href="#neighborhood-story"
                      className="pointer-events-auto underline underline-offset-4 font-semibold hover:opacity-85"
                      style={{ color: inlineLinkColor }}
                    >
                      Discover our hotel story.
                    </a>
                  </p>
                  <p className="text-[11px] @3xl:text-sm">
                    Book directly on our official website for guaranteed lowest rates &amp; exclusive privileges.{' '}
                    <a
                      href={getReserveHref()}
                      className="pointer-events-auto underline underline-offset-4 font-semibold hover:opacity-85"
                      style={{ color: inlineLinkColor }}
                    >
                      Explore rooms &amp; live availability.
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      }

      // #01 CLASSIC FULL-BLEED SLIDER (Default)
      case 'full-slider':
      default:
        return (
          <section>
            <div className="relative w-full h-[270px] @3xl:h-[520px] @5xl:h-[600px] overflow-hidden bg-slate-900">
              <SwipeablePhotoSlider
                photos={heroPhotos}
                alt={hotel.name}
                className="w-full h-full"
                controlledIndex={slideIdx}
                onIndexChange={setSlideIdx}
                arrowsMode="always"
                showCounter={heroPhotos.length > 1}
                counterPositionClass="top-3 right-3"
                onTapPhoto={(idx) => openLightbox(heroPhotos, idx, hotel.name)}
              />
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
              {ui.sections.accommodationsEyebrow}
            </span>
            <h2
              className="text-xl @3xl:text-4xl font-bold tracking-wide"
              style={{ color: textColor, fontFamily: fontStack }}
            >
              {locale === 'th' ? `เลือกห้องพักที่ ${hotel.name}` : `Choose Your Stay at ${hotel.name}`}
            </h2>
          </div>

          {/* LAYOUT A: ZIG-ZAG ALTERNATING HORIZONTAL SHOWCASE (#02 & #08) */}
          {template.roomsLayout === 'zigzag-horizontal' && (
            <div className="space-y-6 @3xl:space-y-10">
              {rooms.map((room, idx) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const roomPhotos = photos.length ? photos : [cover];
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
                      className={`@5xl:col-span-7 aspect-[16/10] overflow-hidden relative bg-slate-200 ${
                        reversed ? '@5xl:order-2' : ''
                      }`}
                      style={{ borderRadius: btnRadius === '0px' ? '0px' : '14px' }}
                    >
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      />
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
                const roomPhotos = photos.length ? photos : [cover];
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
                    <div className="relative aspect-[16/10] @3xl:aspect-[4/3] overflow-hidden bg-slate-200">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      >
                        {(room.discount_pct ?? 0) > 0 && (
                          <span
                            className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md pointer-events-none"
                            style={{ backgroundColor: accentColor, color: accentText }}
                          >
                            -{room.discount_pct}% OFF
                          </span>
                        )}
                      </SwipeablePhotoSlider>
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
                  const roomPhotos = photos.length ? photos : [cover];
                  return (
                    <div
                      key={room.id}
                      className="border p-4 rounded-2xl grid grid-cols-1 @3xl:grid-cols-12 gap-4 @3xl:gap-5 items-center text-left"
                      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                    >
                      <div className="@3xl:col-span-5 aspect-[16/10] @3xl:aspect-[4/3] rounded-xl overflow-hidden relative bg-slate-200">
                        <SwipeablePhotoSlider
                          photos={roomPhotos}
                          alt={room.name}
                          className="w-full h-full"
                          arrowsMode="desktop-hover"
                          showCounter={roomPhotos.length > 1}
                          counterPositionClass="top-2.5 right-2.5"
                          onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                        />
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
                const roomPhotos = photos.length ? photos : [cover];
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
                    <div className="@5xl:col-span-4 aspect-[16/10] overflow-hidden bg-slate-200 rounded-lg">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-2.5 right-2.5"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      />
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
                const roomPhotos = photos.length ? photos : [cover];
                return (
                  <div
                    key={room.id}
                    className="py-6 @3xl:py-8 grid grid-cols-1 @3xl:grid-cols-12 gap-4 @3xl:gap-6 items-center text-left"
                    style={{ borderColor: cardBorder }}
                  >
                    <div className="hidden @3xl:block @3xl:col-span-1 text-xs font-mono opacity-55">
                      0{idx + 1}
                    </div>
                    <div className="@3xl:col-span-4 aspect-[16/10] overflow-hidden bg-slate-200">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-2.5 right-2.5"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      />
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
                const roomPhotos = photos.length ? photos : [cover];
                const thumbs = photos.length > 1 ? photos.slice(1, 5) : heroPhotos.slice(0, 4);
                return (
                  <div
                    key={room.id}
                    className="border rounded-2xl @3xl:rounded-3xl overflow-hidden shadow-md flex flex-col text-left"
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      />
                    </div>
                    {/* 4-Photo Mini Album Strip */}
                    <div
                      className="grid grid-cols-4 gap-1.5 p-2 border-b"
                      style={{ backgroundColor: subtleSurface, borderColor: cardBorder }}
                    >
                      {thumbs.map((tUrl, tIdx) => (
                        <div
                          key={tIdx}
                          onClick={() =>
                            openLightbox(
                              photos.length > 1 ? photos : heroPhotos,
                              photos.length > 1 ? tIdx + 1 : tIdx,
                              room.name
                            )
                          }
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
                          Reserve
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
                const roomPhotos = photos.length ? photos : [cover];
                return (
                  <div key={room.id} className="text-center space-y-3.5">
                    <div className="aspect-[4/4] @3xl:aspect-[4/5] rounded-t-[160px] @3xl:rounded-t-[200px] rounded-b-2xl overflow-hidden shadow-lg bg-slate-200">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="none"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="bottom-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
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
                const roomPhotos = photos.length ? photos : [cover];
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
                    <div className="aspect-[4/4] @3xl:aspect-[3/4] overflow-hidden bg-slate-800">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
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
                const roomPhotos = photos.length ? photos : [cover];
                return (
                  <div
                    key={room.id}
                    className="p-4 @3xl:p-6 grid grid-cols-1 @5xl:grid-cols-12 gap-4 @3xl:gap-5 items-center text-left"
                    style={{ borderColor: cardBorder }}
                  >
                    <div className="@5xl:col-span-4 flex flex-col @5xl:flex-row @5xl:items-center gap-3.5">
                      <div className="w-full aspect-[16/10] @5xl:w-32 @5xl:h-24 @5xl:aspect-auto rounded-lg overflow-hidden shrink-0 bg-slate-200">
                        <SwipeablePhotoSlider
                          photos={roomPhotos}
                          alt={room.name}
                          className="w-full h-full"
                          arrowsMode="none"
                          showCounter={roomPhotos.length > 1}
                          counterPositionClass="top-2 right-2"
                          onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                        />
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
                const roomPhotos = photos.length ? photos : [cover];
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
                    <div className="aspect-[16/10] overflow-hidden relative bg-slate-200">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      />
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

          {/* LAYOUT K: HOTEL INDIGO BOUTIQUE SUITES (#17 — Editorial Serif + Finger-Swipeable Gallery + Lowest Promo Rate) */}
          {template.roomsLayout === 'indigo-boutique-suites' && (
            <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-6 @3xl:gap-10">
              {rooms.map((room, idx) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const roomPhotos = photos.length ? photos : [cover];
                return (
                  <div
                    key={room.id}
                    className="overflow-hidden border shadow-sm hover:shadow-xl transition-all flex flex-col text-left group"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderRadius: btnRadius,
                    }}
                  >
                    <div className="aspect-[16/10] overflow-hidden relative bg-slate-200">
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="top-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      />
                      <span
                        className="absolute bottom-3 left-3 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] pointer-events-none shadow-sm"
                        style={{
                          backgroundColor: primaryColor,
                          color: primaryText,
                          borderRadius: btnRadius,
                        }}
                      >
                        Boutique Room 0{idx + 1}
                      </span>
                    </div>

                    <div className="p-5 @3xl:p-7 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h3
                          className="text-xl @3xl:text-2xl font-normal tracking-wide"
                          style={{ color: textColor, fontFamily: fontStack }}
                        >
                          {room.name}
                        </h3>
                        <div className="w-12 h-[2px]" style={{ backgroundColor: accentColor }} />
                        <p className="text-xs @3xl:text-[13px] leading-relaxed line-clamp-3" style={{ color: mutedText }}>
                          {room.description}
                        </p>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div
                          className="py-3 border-y flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ borderColor: cardBorder, color: mutedText }}
                        >
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

                        <div className="flex flex-wrap items-end justify-between gap-3">
                          {renderRoomPrice(room)}
                          <a
                            href={getReserveHref(room.id)}
                            className="px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap hover:opacity-90 transition-opacity shadow-sm"
                            style={{
                              backgroundColor: primaryColor,
                              color: primaryText,
                              borderRadius: btnRadius,
                            }}
                          >
                            BOOK NOW
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* LAYOUT L: ROSEWOOD PORTRAIT RESIDENCES (#18 — 3:4 Vertical Portrait Cards + Tracked Sans Title + Poetic Serif + Dual CTA) */}
          {template.roomsLayout === 'rosewood-portrait-residences' && (
            <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 gap-7 @3xl:gap-10">
              {rooms.map((room) => {
                const photos = (room.gallery || []).map(cleanImg).filter(Boolean);
                const cover = photos[0] || currentHeroImg;
                const roomPhotos = photos.length ? photos : [cover];
                return (
                  <div key={room.id} className="flex flex-col text-left group space-y-4">
                    <div
                      className="aspect-[3/4] w-full overflow-hidden relative bg-stone-200"
                      style={{ borderRadius: btnRadius }}
                    >
                      <SwipeablePhotoSlider
                        photos={roomPhotos}
                        alt={room.name}
                        className="w-full h-full"
                        arrowsMode="desktop-hover"
                        showCounter={roomPhotos.length > 1}
                        counterPositionClass="bottom-3 right-3"
                        onTapPhoto={(pIdx) => openLightbox(roomPhotos, pIdx, room.name)}
                      />
                    </div>

                    <div className="space-y-2.5 flex-1 flex flex-col justify-between pt-1">
                      <div className="space-y-2">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-[0.2em] block font-sans"
                          style={{ color: accentColor }}
                        >
                          {room.room_size} M² &middot; UP TO {room.max_guests} GUESTS &middot; {room.bed_type}
                        </span>
                        <h3
                          className="text-sm @3xl:text-base font-semibold uppercase tracking-[0.16em] font-sans"
                          style={{ color: textColor }}
                        >
                          {room.name}
                        </h3>
                        <p
                          className="text-sm @3xl:text-base font-light leading-relaxed line-clamp-3"
                          style={{ color: mutedText, fontFamily: fontStack }}
                        >
                          {room.description}
                        </p>
                      </div>

                      <div
                        className="pt-4 border-t flex flex-wrap items-end justify-between gap-3"
                        style={{ borderColor: cardBorder }}
                      >
                        {renderRoomPrice(room)}

                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => openLightbox(roomPhotos, 0, room.name)}
                            className="text-xs underline underline-offset-4 hover:opacity-70 cursor-pointer"
                            style={{ color: textColor, fontFamily: fontStack }}
                          >
                            Details
                          </button>
                          <a
                            href={getReserveHref(room.id)}
                            className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] font-sans hover:opacity-90 transition-opacity whitespace-nowrap"
                            style={{
                              backgroundColor: primaryColor,
                              color: primaryText,
                              borderRadius: btnRadius,
                            }}
                          >
                            RESERVE
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
    const renderHighlightIcon = (iconKey: HighlightIconKey) => {
      const cls = 'w-5 h-5 shrink-0';
      switch (iconKey) {
        case 'flag':
          return <Flag className={cls} />;
        case 'trees':
          return <Trees className={cls} />;
        case 'dumbbell':
          return <Dumbbell className={cls} />;
        case 'presentation':
          return <Presentation className={cls} />;
        case 'shopping':
          return <ShoppingBag className={cls} />;
        case 'car':
          return <Car className={cls} />;
        case 'waves':
          return <Waves className={cls} />;
        case 'utensils':
          return <Utensils className={cls} />;
        case 'plane':
          return <Plane className={cls} />;
        case 'wifi':
          return <Wifi className={cls} />;
        case 'mappin':
          return <MapPin className={cls} />;
        case 'sparkles':
        default:
          return <Sparkles className={cls} />;
      }
    };

    const renderHighlightsStrip = () => {
      if (!aboutData.highlights || aboutData.highlights.length === 0) return null;
      return (
        <div
          id="hotel-highlights"
          className="w-full p-5 @3xl:p-8 border shadow-2xs grid grid-cols-1 @xl:grid-cols-2 gap-x-10 gap-y-5 text-left"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
            borderRadius: btnRadius === '0px' ? '12px' : '16px',
          }}
        >
          {aboutData.highlights.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <div
                className="mt-0.5 p-2 rounded-lg shrink-0"
                style={{
                  backgroundColor: withAlpha(accentColor, 0.14),
                  color: isDark ? accentColor : primaryColor,
                }}
              >
                {renderHighlightIcon(item.icon)}
              </div>
              <div className="min-w-0">
                <h4
                  className="text-sm @3xl:text-[15px] font-semibold leading-snug font-sans"
                  style={{ color: textColor }}
                >
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p
                    className="text-xs @3xl:text-[13px] leading-relaxed mt-0.5 font-sans"
                    style={{ color: mutedText }}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };

    // #18 ROSEWOOD "SENSE OF PLACE / WHAT'S ON" 3-COL PORTRAIT OVERVIEW + FULL-WIDTH TABBED CAROUSEL
    if (template.aboutLayout === 'rosewood-sense-of-place') {
      const darkBtnBg = isDarkColor(secondaryColor) ? secondaryColor : '#1A1A1A';
      const discoveryCards = [0, 1, 2].map((idx) => ({
        tag:
          idx === 0
            ? 'SENSE OF PLACE · HERITAGE'
            : idx === 1
            ? 'CURATED COMFORT · SANCTUARY'
            : 'PRIVILEGES · DIRECT STAY',
        title:
          facilitiesData[idx]?.title ||
          (idx === 0
            ? 'Timeless Sanctuary'
            : idx === 1
            ? 'Bespoke Hospitality'
            : 'Direct Guest Privileges'),
        desc:
          facilitiesData[idx]?.desc ||
          aboutData.description,
        image:
          galleryPhotosPool[(idx + 1) % galleryPhotosPool.length] ||
          heroPhotos[idx % heroPhotos.length] ||
          aboutData.primaryImage,
      }));

      const carouselTabs = [
        {
          tabLabel: 'Offers & Direct Rates',
          eyebrow: `OFFERS AT ${hotel.name.toUpperCase()}`,
          subtitle:
            promotions[0]?.title
              ? `${promotions[0].title} — ${promotions[0].description || 'Exclusive privileges when reserving directly'}`
              : `Make the most of your stay with exclusive direct booking privileges at ${hotel.name}`,
          ctaLabel: 'DISCOVER',
          href: promotions.length > 0 && !isPreview ? `${tenantPrefix}/promotions` : getReserveHref(),
          image: galleryPhotosPool[0] || currentHeroImg,
        },
        {
          tabLabel: 'A Sense of Place',
          eyebrow: 'A SENSE OF TRANQUILITY',
          subtitle:
            aboutData.description.slice(0, 115) +
            (aboutData.description.length > 115 ? '…' : ''),
          ctaLabel: 'EXPLORE ROOMS',
          href: '#rooms',
          image: aboutData.primaryImage || galleryPhotosPool[1 % galleryPhotosPool.length] || currentHeroImg,
        },
        {
          tabLabel: 'Visual Journey',
          eyebrow: 'ARCHITECTURAL HARMONY',
          subtitle: `Immerse yourself in serene pools, lush tropical landscapes, and refined interiors at ${hotel.name}`,
          ctaLabel: 'VIEW GALLERY',
          href: isPreview ? '#gallery' : `${tenantPrefix}/gallery`,
          image: aboutData.secondaryImage || galleryPhotosPool[2 % galleryPhotosPool.length] || currentHeroImg,
        },
      ];
      const activeTab = carouselTabs[rosewoodTabIdx % carouselTabs.length];

      return (
        <>
          {/* PART 1: WARM IVORY "WHAT'S ON / SENSE OF PLACE" EDITORIAL + 3 PORTRAIT CARDS */}
          <section
            id="sense-of-place"
            className="w-full py-14 @3xl:py-24 px-5 @3xl:px-10"
            style={{ backgroundColor: bgColor }}
          >
            <div className="max-w-7xl mx-auto space-y-12 @3xl:space-y-16">
              {/* Centered Poetic Serif Header */}
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] block font-sans"
                  style={{ color: accentColor }}
                >
                  WHAT&rsquo;S ON &middot; SENSE OF PLACE
                </span>
                <h2
                  className="text-2xl @3xl:text-[40px] font-light leading-[1.24]"
                  style={{ color: textColor, fontFamily: fontStack }}
                >
                  Glimpses of {hotel.name}&rsquo;s magic&mdash;a tranquil destination of warm hospitality
                  and effortless discovery
                </h2>
              </div>

              {/* 3-Column 4:5 Portrait Editorial Cards */}
              <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-8 @3xl:gap-10">
                {discoveryCards.map((card, idx) => (
                  <div key={idx} className="flex flex-col text-left group space-y-4">
                    <div
                      onClick={() => openLightbox(galleryPhotosPool, idx, card.title)}
                      className="aspect-[4/5] w-full overflow-hidden bg-stone-200 cursor-pointer"
                      style={{ borderRadius: btnRadius }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.image}
                        alt={card.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    </div>

                    <div className="space-y-2.5 flex-1 flex flex-col justify-between pt-1">
                      <div className="space-y-2">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-[0.2em] block font-sans"
                          style={{ color: accentColor }}
                        >
                          {card.tag}
                        </span>
                        <h3
                          className="text-xl @3xl:text-2xl font-normal"
                          style={{ color: textColor, fontFamily: fontStack }}
                        >
                          {card.title}
                        </h3>
                        <p
                          className="text-xs @3xl:text-sm leading-relaxed line-clamp-3"
                          style={{ color: mutedText }}
                        >
                          {card.desc}
                        </p>
                      </div>

                      <div className="pt-3 flex items-center gap-5">
                        <a
                          href={getReserveHref()}
                          className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white font-sans hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: darkBtnBg,
                            borderRadius: btnRadius,
                          }}
                        >
                          DISCOVER
                        </a>
                        <a
                          href="#rooms"
                          className="text-xs underline underline-offset-4 hover:opacity-70"
                          style={{ color: textColor, fontFamily: fontStack }}
                        >
                          Details &rarr;
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PART 2: ROSEWOOD FULL-WIDTH TABBED FEATURE CAROUSEL (#full-width-carousel) */}
          <section id="full-width-carousel" className="w-full">
            {/* Top Minimalist Story Tabs */}
            <div
              className="w-full border-y px-4 overflow-x-auto"
              style={{ backgroundColor: bgColor, borderColor: cardBorder }}
            >
              <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 @3xl:gap-12">
                {carouselTabs.map((tab, idx) => {
                  const isActive = idx === rosewoodTabIdx % carouselTabs.length;
                  return (
                    <button
                      key={tab.tabLabel}
                      type="button"
                      onClick={() => setRosewoodTabIdx(idx)}
                      className="py-4 text-xs @3xl:text-[15px] whitespace-nowrap border-b-2 transition-all cursor-pointer"
                      style={{
                        fontFamily: fontStack,
                        color: isActive ? textColor : mutedText,
                        borderColor: isActive ? primaryColor : 'transparent',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {tab.tabLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full-Width Atmospheric Feature Frame */}
            <div className="relative w-full h-[360px] @3xl:h-[540px] overflow-hidden bg-stone-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeTab.image}
                alt={activeTab.eyebrow}
                className="w-full h-full object-cover transition-all duration-700"
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-end pb-10 @3xl:pb-16 px-6 text-center"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(12,12,12,0.12) 0%, rgba(12,12,12,0.58) 100%)',
                }}
              >
                <div className="max-w-2xl mx-auto space-y-3 @3xl:space-y-4">
                  <p className="text-sm @3xl:text-2xl font-bold uppercase tracking-[0.22em] text-white font-sans">
                    {activeTab.eyebrow}
                  </p>
                  <h3
                    className="text-xl @3xl:text-[34px] font-light leading-snug text-white/95"
                    style={{ fontFamily: fontStack }}
                  >
                    {activeTab.subtitle}
                  </h3>
                  <div className="pt-2">
                    <a
                      href={activeTab.href}
                      className="inline-block px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white font-sans hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: darkBtnBg,
                        borderRadius: btnRadius,
                      }}
                    >
                      {activeTab.ctaLabel}
                    </a>
                  </div>
                  <div className="pt-2 text-[11px] tracking-[0.22em] text-white/85 font-sans">
                    {(rosewoodTabIdx % carouselTabs.length) + 1} &middot; {carouselTabs.length}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      );
    }

    // #17 BOUTIQUE NEIGHBORHOOD 2-TIER EDITORIAL STORY (Authentic Property Photos) + FULL-BLEED 50/50 PHOTO MOSAIC
    if (template.aboutLayout === 'indigo-coastal-story') {
      const storyLinkColor = isDark ? accentColor : '#D95326';
      const customTiles = aboutData.customFeatures;
      const mosaicTiles = [
        {
          title:
            customTiles[0]?.title ||
            facilitiesData[0]?.title ||
            'Signature Dining & Refreshments',
          desc:
            customTiles[0]?.desc ||
            facilitiesData[0]?.desc ||
            `Enjoy curated dining, fresh local ingredients, and welcoming ambiance crafted daily at ${hotel.name}.`,
          image:
            cleanImg(customTiles[0]?.image_url) ||
            galleryPhotosPool[3 % galleryPhotosPool.length] ||
            aboutData.primaryImage,
          href: isPreview ? '#rooms' : getReserveHref(),
        },
        {
          title:
            customTiles[1]?.title ||
            facilitiesData[1]?.title ||
            'Leisure & Relaxation Spaces',
          desc:
            customTiles[1]?.desc ||
            facilitiesData[1]?.desc ||
            `Unwind in tranquil surroundings designed for restful mornings, leisurely afternoons, and effortless comfort.`,
          image:
            cleanImg(customTiles[1]?.image_url) ||
            galleryPhotosPool[4 % galleryPhotosPool.length] ||
            aboutData.secondaryImage,
          href: isPreview ? '#gallery' : `${tenantPrefix}/gallery`,
        },
        {
          title: customTiles[2]?.title || 'Curated Rooms & Suites',
          desc:
            customTiles[2]?.desc ||
            `Thoughtfully appointed accommodations featuring plush bedding, modern amenities, and peaceful views at ${hotel.name}.`,
          image:
            cleanImg(customTiles[2]?.image_url) ||
            cleanImg(rooms[0]?.gallery?.[0]) ||
            galleryPhotosPool[5 % galleryPhotosPool.length] ||
            currentHeroImg,
          href: '#rooms',
        },
        {
          title:
            customTiles[3]?.title ||
            facilitiesData[2]?.title ||
            'Official Direct Privileges',
          desc:
            customTiles[3]?.desc ||
            facilitiesData[2]?.desc ||
            `Reserve directly on our official website for guaranteed lowest rates, live room availability, and attentive guest care.`,
          image:
            cleanImg(customTiles[3]?.image_url) ||
            cleanImg(rooms[1]?.gallery?.[0]) ||
            galleryPhotosPool[6 % galleryPhotosPool.length] ||
            aboutData.primaryImage,
          href: getReserveHref(),
        },
      ];

      return (
        <>
          {/* TIER 1: BOUTIQUE EDITORIAL STORY + AUTHENTIC HOTEL ARCHITECTURAL PHOTO FRAME */}
          <section
            id="neighborhood-story"
            className="relative w-full overflow-hidden py-12 @3xl:py-20 px-5 @3xl:px-10"
            style={{ backgroundColor: bgColor }}
          >
            {/* Subtle Architectural Line Watermark (Original Minimalist Geometry) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full border opacity-[0.06]"
              style={{ borderColor: primaryColor }}
            />

            <div className="relative max-w-6xl mx-auto space-y-12 @3xl:space-y-16">
              <div className="grid grid-cols-1 @3xl:grid-cols-12 gap-8 @3xl:gap-12 items-center">
                {/* Left Editable Editorial Narrative */}
                <div className="@3xl:col-span-7 space-y-4 @3xl:space-y-5 text-left">
                  {aboutData.badge && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.24em] block"
                      style={{ color: accentColor }}
                    >
                      {aboutData.badge}
                    </span>
                  )}
                  <h2
                    className="text-3xl @3xl:text-[42px] font-normal leading-[1.16] tracking-tight whitespace-pre-line"
                    style={{ color: isDark ? textColor : primaryColor, fontFamily: fontStack }}
                  >
                    {aboutData.title === hotel.name
                      ? `Welcome to ${hotel.name}`
                      : aboutData.title}
                  </h2>

                  <div className="space-y-4 text-xs @3xl:text-[14px] leading-[1.8]" style={{ color: mutedText }}>
                    {aboutData.paragraphs.map((para: string, idx: number) => (
                      <p key={idx}>{para}</p>
                    ))}
                    {aboutData.paragraphs.length === 1 && (
                      <p>
                        {hotel.address ? (
                          <>
                            Conveniently located at{' '}
                            <strong style={{ color: textColor }}>{hotel.address}</strong>,{' '}
                            {hotel.name} offers spacious, well-appointed accommodations with
                            complimentary Wi-Fi and{' '}
                          </>
                        ) : (
                          <>
                            {hotel.name} offers spacious, well-appointed accommodations with
                            complimentary Wi-Fi and{' '}
                          </>
                        )}
                        <a
                          href="#rooms"
                          className="underline underline-offset-4 font-semibold hover:opacity-80"
                          style={{ color: storyLinkColor }}
                        >
                          guaranteed lowest direct rates
                        </a>{' '}
                        when booking on our official website.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Authentic Property Photo in Original Architectural Offset Frame */}
                <div className="@3xl:col-span-5 flex items-center justify-center">
                  <div className="relative w-full max-w-[420px] pt-3 pr-3">
                    <div
                      aria-hidden="true"
                      className="absolute top-0 right-0 w-[88%] h-[88%] border-2"
                      style={{
                        borderColor: withAlpha(accentColor, 0.45),
                        borderRadius: btnRadius,
                      }}
                    />
                    <div
                      onClick={() =>
                        openLightbox(
                          [aboutData.primaryImage, ...galleryPhotosPool],
                          0,
                          hotel.name
                        )
                      }
                      className="relative aspect-[4/3] w-full overflow-hidden shadow-lg cursor-pointer group bg-slate-200"
                      style={{ borderRadius: btnRadius }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={aboutData.primaryImage}
                        alt={aboutData.title || hotel.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div
                        className="absolute bottom-3 left-3 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-xs"
                        style={{
                          backgroundColor: withAlpha(primaryColor, 0.88),
                          color: primaryText,
                          borderRadius: btnRadius,
                        }}
                      >
                        {aboutData.subtitle || hotel.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HOTEL KEY HIGHLIGHTS BAR BELOW STORY ARTICLE */}
              {renderHighlightsStrip()}

              {/* TIER 2: INSET EDITORIAL SECONDARY STORY BLOCK + SECOND AUTHENTIC HOTEL PHOTO */}
              <div
                id="settle-in"
                className="p-6 @3xl:p-12 grid grid-cols-1 @3xl:grid-cols-12 gap-8 @3xl:gap-10 items-center"
                style={{
                  backgroundColor: subtleSurface,
                  borderRadius: btnRadius,
                }}
              >
                {/* Left Second Authentic Hotel Photo */}
                <div className="@3xl:col-span-5">
                  <div
                    onClick={() =>
                      openLightbox(
                        [aboutData.secondaryImage, ...galleryPhotosPool],
                        0,
                        hotel.name
                      )
                    }
                    className="relative aspect-[16/10] w-full overflow-hidden shadow-md cursor-pointer group bg-slate-200 border"
                    style={{
                      borderColor: cardBorder,
                      borderRadius: btnRadius,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aboutData.secondaryImage}
                      alt={`${hotel.name} sanctuary`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Right Editable Secondary Story Copy */}
                <div className="@3xl:col-span-7 space-y-4 text-left">
                  <h3
                    className="text-2xl @3xl:text-4xl font-normal tracking-tight"
                    style={{ color: isDark ? textColor : primaryColor, fontFamily: fontStack }}
                  >
                    {aboutData.story2Title}
                  </h3>
                  {aboutData.story2Paragraphs.length > 0 ? (
                    aboutData.story2Paragraphs.map((para: string, idx: number) => (
                      <p
                        key={idx}
                        className="text-xs @3xl:text-[14px] leading-[1.8]"
                        style={{ color: mutedText }}
                      >
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs @3xl:text-[14px] leading-[1.8]" style={{ color: mutedText }}>
                      Experience personalized comfort and seamless hospitality at{' '}
                      <strong style={{ color: textColor }}>{hotel.name}</strong>.
                    </p>
                  )}
                  <p className="text-xs @3xl:text-[14px] leading-[1.8]" style={{ color: mutedText }}>
                    Explore our{' '}
                    <a
                      href="#rooms"
                      className="underline underline-offset-4 font-semibold hover:opacity-80"
                      style={{ color: storyLinkColor }}
                    >
                      curated rooms &amp; live rates
                    </a>{' '}
                    to plan your stay, or view our{' '}
                    <a
                      href={isPreview ? '#location' : mapDirectionsHref}
                      target={isPreview ? undefined : '_blank'}
                      rel={isPreview ? undefined : 'noopener noreferrer'}
                      className="underline underline-offset-4 font-semibold hover:opacity-80"
                      style={{ color: storyLinkColor }}
                    >
                      exact GPS location &amp; directions
                    </a>{' '}
                    for effortless arrival.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* TIER 3: FULL-BLEED ZERO-GAP 50/50 PHOTO SHOWCASE MOSAIC (Edge-to-Edge) */}
          <section id="experience-mosaic" className="w-full grid grid-cols-1 @3xl:grid-cols-2 gap-0">
            {mosaicTiles.map((tile, idx) => (
              <div
                key={idx}
                className="relative min-h-[270px] @3xl:min-h-[400px] overflow-hidden group flex items-center justify-center p-6 @3xl:p-12 text-center bg-slate-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.image}
                  alt={tile.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(8,20,30,0.32) 0%, rgba(8,20,30,0.68) 100%)',
                  }}
                />
                <div className="relative z-10 max-w-lg mx-auto space-y-4">
                  <h3
                    className="text-2xl @3xl:text-4xl font-normal text-white tracking-wide drop-shadow-sm"
                    style={{ fontFamily: fontStack }}
                  >
                    {tile.title}
                  </h3>
                  <p className="text-xs @3xl:text-sm text-white/90 leading-relaxed line-clamp-3">
                    {tile.desc}
                  </p>
                  <div className="pt-1">
                    <a
                      href={tile.href}
                      className="inline-block px-7 py-2.5 text-xs font-bold uppercase tracking-[0.16em] shadow-md transition-transform group-hover:-translate-y-0.5"
                      style={{
                        backgroundColor: primaryColor,
                        color: primaryText,
                        borderRadius: btnRadius,
                      }}
                    >
                      VIEW MORE
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      );
    }

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
        <section className="py-10 @3xl:py-20 px-4 @3xl:px-6 border-b space-y-8" style={{ borderColor: cardBorder }}>
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
          {aboutData.highlights.length > 0 && (
            <div className="max-w-5xl mx-auto">{renderHighlightsStrip()}</div>
          )}
        </section>
      );
    }

    return (
      <section className="max-w-7xl mx-auto px-4 @3xl:px-6 py-10 @3xl:py-20 space-y-10">
        <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-8 @3xl:gap-12 items-center">
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
        </div>
        {renderHighlightsStrip()}
      </section>
    );
  };

  // =========================================================================
  // GALLERY STRIP (Mobile Finger-Swipeable Slider + Thumbnails | Desktop 4-Col Grid)
  // =========================================================================
  const renderGalleryStrip = () => {
    if (galleryPhotosPool.length < 2) return null;
    const safeGalleryIdx = galleryIdx % galleryPhotosPool.length;
    return (
      <section id="gallery" className="max-w-7xl mx-auto px-4 @3xl:px-6 py-10 @3xl:py-14 space-y-5 @3xl:space-y-8">
        <div className="flex items-end justify-between gap-3">
          <div className="text-left">
            <span
              className="text-[10px] @3xl:text-xs font-bold uppercase tracking-[0.25em] block"
              style={{ color: accentColor }}
            >
              {ui.sections.galleryEyebrow}
            </span>
            <h2 className="text-xl @3xl:text-3xl font-bold mt-1" style={{ color: textColor, fontFamily: fontStack }}>
              {ui.sections.galleryTitle}
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

        {/* MOBILE (< @3xl): Smooth Finger-Swipeable Carousel + Touch-Scrollable Thumbnail Strip */}
        <div className="@3xl:hidden space-y-2.5">
          <div
            className={`aspect-[4/3] overflow-hidden shadow-md bg-slate-200 ${
              template.id === 'mediterranean-arch'
                ? 'rounded-t-[130px] rounded-b-2xl'
                : btnRadius === '0px'
                ? ''
                : 'rounded-2xl'
            }`}
          >
            <SwipeablePhotoSlider
              photos={galleryPhotosPool}
              alt={hotel.name}
              className="w-full h-full"
              controlledIndex={safeGalleryIdx}
              onIndexChange={setGalleryIdx}
              arrowsMode="none"
              showCounter={true}
              counterPositionClass="top-3 right-3"
              onTapPhoto={(idx) => openLightbox(galleryPhotosPool, idx, hotel.name)}
            />
          </div>

          <div
            className="flex items-center gap-2 overflow-x-auto py-1"
            style={{ touchAction: 'pan-x', scrollbarWidth: 'none' }}
          >
            {galleryPhotosPool.map((url, idx) => {
              const active = idx === safeGalleryIdx;
              return (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  onClick={() => setGalleryIdx(idx)}
                  className="w-16 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer transition-all"
                  style={{
                    opacity: active ? 1 : 0.55,
                    border: active ? `2px solid ${accentColor}` : `1px solid ${cardBorder}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP (@3xl+): Crisp 4-Column Gallery Grid */}
        <div className="hidden @3xl:grid @3xl:grid-cols-4 gap-3">
          {galleryPhotosPool.slice(0, 8).map((url, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(galleryPhotosPool, idx, hotel.name)}
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

  const footerBg = isDark ? subtleSurface : primaryColor;
  const footerText = isDark ? textColor : primaryText;

  const renderFooter = () => {
    // #18 ROSEWOOD HERITAGE IVORY / ALABASTER ULTRA-LUXURY FOOTER
    if (template.id === 'rosewood-sanctuary') {
      const rwFooterBg = isDark ? subtleSurface : bgColor;
      const rwFooterText = textColor;
      const rwBorder = withAlpha(textColor, 0.14);
      const monogram =
        hotel.name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() || '')
          .join('') || 'RW';

      return (
        <footer
          className="pt-12 @3xl:pt-20 pb-12 @3xl:pb-16 px-4 @3xl:px-10 border-t"
          style={{
            backgroundColor: rwFooterBg,
            color: rwFooterText,
            borderColor: rwBorder,
          }}
        >
          <div className="max-w-7xl mx-auto space-y-10 @3xl:space-y-14">
            {/* Top Invitation Banner */}
            <div
              className="flex flex-col @3xl:flex-row items-start @3xl:items-center justify-between gap-6 pb-10 border-b"
              style={{ borderColor: rwBorder }}
            >
              <div className="space-y-2 text-left max-w-2xl">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.26em] block font-sans"
                  style={{ color: accentColor }}
                >
                  A SENSE OF PLACE &middot; OFFICIAL DIRECT RESERVATIONS
                </span>
                <h3
                  className="text-2xl @3xl:text-4xl font-light leading-snug"
                  style={{ fontFamily: fontStack, color: rwFooterText }}
                >
                  Stay connected to the world of {hotel.name}
                </h3>
              </div>
              <a
                href={bookingUrl}
                className="px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] font-sans hover:opacity-90 transition-opacity shrink-0"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryText,
                  borderRadius: btnRadius,
                }}
              >
                RESERVE YOUR STAY
              </a>
            </div>

            {/* 4-Column Ultra-Luxury Directory */}
            <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-8 text-left">
              <div className="space-y-3">
                <h4
                  className="text-[10px] font-semibold uppercase tracking-[0.24em] font-sans"
                  style={{ color: accentColor }}
                >
                  CONTACT US
                </h4>
                <div className="space-y-1.5 text-sm font-light" style={{ fontFamily: fontStack }}>
                  {hotel.phone && (
                    <a href={`tel:${hotel.phone}`} className="block hover:opacity-70">
                      Tel: {hotel.phone}
                    </a>
                  )}
                  {hotel.email && (
                    <a href={`mailto:${hotel.email}`} className="block hover:opacity-70 break-all">
                      {hotel.email}
                    </a>
                  )}
                  <a href={isPreview ? '#contact' : `${tenantPrefix}/contact`} className="block underline underline-offset-4 pt-1 text-xs">
                    Direct Concierge
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <h4
                  className="text-[10px] font-semibold uppercase tracking-[0.24em] font-sans"
                  style={{ color: accentColor }}
                >
                  DISCOVER
                </h4>
                <div className="space-y-1.5 text-sm font-light" style={{ fontFamily: fontStack }}>
                  {navLinks.map((l) => (
                    <a key={l.label} href={l.href} className="block hover:opacity-70">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4
                  className="text-[10px] font-semibold uppercase tracking-[0.24em] font-sans"
                  style={{ color: accentColor }}
                >
                  PRIVILEGES
                </h4>
                <div className="space-y-1.5 text-sm font-light" style={{ fontFamily: fontStack, color: mutedText }}>
                  <p>Best Direct Rate Guaranteed</p>
                  <p>Instant Channel Manager Sync</p>
                  <p>Exclusive Direct Offers</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4
                  className="text-[10px] font-semibold uppercase tracking-[0.24em] font-sans"
                  style={{ color: accentColor }}
                >
                  SANCTUARY ADDRESS
                </h4>
                <p className="text-sm font-light leading-relaxed" style={{ fontFamily: fontStack, color: mutedText }}>
                  {hotel.address || hotel.name}
                </p>
              </div>
            </div>

            {/* Centered Rosewood Monogram Crest & Hairline Divider */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-6">
                <div className="flex-1 h-px" style={{ backgroundColor: rwBorder }} />
                <div
                  className="w-12 h-12 border flex items-center justify-center text-lg italic font-light tracking-widest"
                  style={{ borderColor: rwBorder, fontFamily: fontStack, color: rwFooterText }}
                >
                  {monogram}
                </div>
                <div className="flex-1 h-px" style={{ backgroundColor: rwBorder }} />
              </div>

              <div className="flex flex-col @xl:flex-row justify-between items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-sans opacity-65 text-center @xl:text-left">
                <span>&copy; {new Date().getFullYear()} {hotel.name}</span>
                <span>OFFICIAL SANCTUARY &middot; DIRECT RESERVATIONS</span>
              </div>
            </div>
          </div>
        </footer>
      );
    }

    return (
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
            <span>© {new Date().getFullYear()} {hotel.name}. {ui.badges.allRightsReserved}</span>
            <span>{ui.badges.bestRateGuaranteed}</span>
          </div>
        </div>
      </footer>
    );
  };

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
      {template.id === 'indigo-neighborhood' && (
        <section className="max-w-7xl mx-auto px-4 @3xl:px-8 pt-4 @3xl:pt-8">
          <div className="relative w-full h-[260px] @3xl:h-[400px] overflow-hidden bg-slate-900 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryPhotosPool[0] || currentHeroImg}
              alt={`${hotel.name} Virtual Photo Tour`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Signature Hotel Indigo Deep-Teal / Primary Floating Tour Card */}
            <div
              className="absolute left-4 right-4 @xl:right-auto @3xl:left-12 bottom-4 @3xl:bottom-10 p-5 @3xl:p-8 shadow-2xl flex items-center gap-4 @3xl:gap-6 max-w-md text-left"
              style={{
                backgroundColor: withAlpha(primaryColor, 0.95),
                color: primaryText,
                borderRadius: btnRadius,
              }}
            >
              <div
                className="w-12 h-12 @3xl:w-14 @3xl:h-14 rounded-full border-2 flex flex-col items-center justify-center shrink-0"
                style={{ borderColor: withAlpha(primaryText, 0.5) }}
              >
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-wider mt-0.5">360°</span>
              </div>
              <div className="space-y-2.5">
                <h3
                  className="text-lg @3xl:text-2xl font-normal leading-snug"
                  style={{ fontFamily: fontStack, color: primaryText }}
                >
                  Explore Full Photo Tour
                </h3>
                <button
                  type="button"
                  onClick={() => openLightbox(galleryPhotosPool, 0, hotel.name)}
                  className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                  style={{
                    backgroundColor: accentColor,
                    color: accentText,
                    borderRadius: btnRadius,
                  }}
                >
                  CLICK VIEW
                </button>
              </div>
            </div>
          </div>
        </section>
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
              <div className="flex items-center gap-1.5 shrink-0">
                {!isPreview && <LanguageSwitcher color={textColor} compact />}
                <a
                  href={getReserveHref()}
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryText,
                    borderRadius: btnRadius,
                  }}
                >
                  {ui.cta.book}
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
                  {ui.badges.officialWebsite}
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

              {!isPreview && (
                <div>
                  <LanguageSwitcher color={textColor} borderColor={cardBorder} align="left" />
                </div>
              )}
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

      {/* SHARED SWIPEABLE PHOTO LIGHTBOX */}
      <SwipeableLightbox
        open={lightboxOpen}
        photos={lightboxPhotos}
        index={lightboxIdx}
        title={lightboxTitle}
        onIndexChange={setLightboxIdx}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
