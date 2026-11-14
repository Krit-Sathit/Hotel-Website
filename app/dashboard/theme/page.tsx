'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  Check,
  Sparkles,
  Monitor,
  Smartphone,
  Maximize2,
  X,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  Users,
  BedDouble,
} from 'lucide-react';
import { saveThemeSettingsAction } from '@/lib/db/actions';
import {
  peekAdminBundle,
  loadAdminBundle,
  invalidateAdminCache,
} from '@/lib/admin-client-cache';
import type { Hotel, HotelTheme, Room, HeroSlide } from '@/lib/db/mock-data';
import {
  HOTEL_WEBSITE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  findMatchingTemplate,
  type TemplateCategory,
  type HotelWebsiteTemplate,
} from '@/lib/hotel-templates';

const DEFAULT_THEME: HotelTheme = HOTEL_WEBSITE_TEMPLATES[0].theme;

function getButtonRadius(theme: HotelTheme): string {
  if (theme.button_style === 'square') return '0px';
  if (theme.button_style === 'pill') return '9999px';
  return theme.border_radius || '8px';
}

function normalizePreviewImageUrl(url?: string | null): string {
  if (!url) return '';
  return url.replace(/^http:\/\/flowstay\.live\//i, 'https://flowstay.live/');
}

interface WebsiteLiveMockupProps {
  theme: HotelTheme;
  hotel: Hotel | null;
  heroImageUrl: string;
  sampleRooms: Array<{ name: string; price: number; bed: string; image: string }>;
  viewMode: 'desktop' | 'mobile';
  isFullScreen?: boolean;
}

function WebsiteLiveMockup({
  theme,
  hotel,
  heroImageUrl,
  sampleRooms,
  viewMode,
  isFullScreen = false,
}: WebsiteLiveMockupProps) {
  const radius = getButtonRadius(theme);
  const cardRadius =
    theme.button_style === 'square'
      ? '0px'
      : theme.button_style === 'pill'
      ? '16px'
      : theme.border_radius || '10px';
  const isDark = Boolean(theme.dark_mode);
  const bgColor = theme.background_color || (isDark ? '#0b0f19' : '#ffffff');
  const textColor = theme.text_color || (isDark ? '#f8fafc' : '#0f172a');
  const subTextColor = isDark ? 'rgba(248,250,252,0.68)' : '#64748b';
  const cardBg = isDark ? '#131b2e' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const fontStack = `'${theme.font_family || 'Inter'}', sans-serif`;

  const hotelName = hotel?.name || 'Luxury Resort & Villa';
  const hotelPhone = hotel?.phone || '076 510 960';
  const hotelAddress = hotel?.address || 'Phuket, Thailand';
  const isMobile = viewMode === 'mobile';

  return (
    <div
      className={`mx-auto transition-all duration-300 overflow-hidden shadow-inner border border-slate-200 ${
        isMobile ? 'max-w-[340px] rounded-[24px] border-4 border-slate-800' : 'w-full rounded-b-xl'
      }`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: fontStack,
      }}
    >
      {/* 1. TOP UTILITY CONTACT BAR */}
      {!isMobile && (
        <div
          className="px-4 py-1.5 flex items-center justify-between text-[9px] tracking-wider"
          style={{
            backgroundColor: theme.primary_color,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" style={{ color: theme.accent_color }} />
              {hotelPhone}
            </span>
          </div>
          <span className="flex items-center gap-1 truncate max-w-[200px]">
            <MapPin className="w-2.5 h-2.5 shrink-0" style={{ color: theme.accent_color }} />
            <span className="truncate">{hotelAddress}</span>
          </span>
        </div>
      )}

      {/* 2. HEADER LAYOUT (minimal / centered / luxury) */}
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor:
            theme.header_layout === 'luxury'
              ? theme.primary_color
              : isDark
              ? '#0f172a'
              : '#ffffff',
          borderColor:
            theme.header_layout === 'luxury'
              ? `${theme.accent_color}40`
              : cardBorder,
        }}
      >
        {theme.header_layout === 'centered' ? (
          <div className="text-center space-y-2">
            <div>
              <div
                className={`${
                  isFullScreen ? 'text-lg' : 'text-xs'
                } font-bold uppercase tracking-[0.2em]`}
                style={{
                  color: isDark ? '#ffffff' : theme.primary_color,
                  fontFamily: fontStack,
                }}
              >
                {hotelName}
              </div>
              <div
                className="text-[7px] uppercase tracking-[0.25em] font-semibold"
                style={{ color: theme.accent_color }}
              >
                Official Hotel Website
              </div>
            </div>
            {!isMobile && (
              <div
                className="flex items-center justify-center gap-4 pt-2 border-t text-[8px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  color: isDark ? 'rgba(255,255,255,0.75)' : '#475569',
                }}
              >
                <span style={{ color: theme.accent_color }}>Home</span>
                <span>Rooms</span>
                <span>Promotions</span>
                <span>Gallery</span>
                <span>Contact</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div>
              <div
                className={`${
                  isFullScreen ? 'text-base' : 'text-[11px]'
                } font-bold uppercase tracking-widest`}
                style={{
                  color:
                    theme.header_layout === 'luxury'
                      ? theme.accent_color
                      : isDark
                      ? '#ffffff'
                      : theme.primary_color,
                  fontFamily: fontStack,
                }}
              >
                {hotelName}
              </div>
              <div
                className="text-[7px] uppercase tracking-widest"
                style={{
                  color:
                    theme.header_layout === 'luxury'
                      ? 'rgba(255,255,255,0.65)'
                      : '#94a3b8',
                }}
              >
                Official Hotel Website
              </div>
            </div>

            {!isMobile && (
              <div
                className="flex items-center gap-3 text-[8px] font-semibold uppercase tracking-wider"
                style={{
                  color:
                    theme.header_layout === 'luxury'
                      ? 'rgba(255,255,255,0.88)'
                      : isDark
                      ? 'rgba(255,255,255,0.8)'
                      : '#475569',
                }}
              >
                <span style={{ color: theme.accent_color }}>Home</span>
                <span>Rooms</span>
                <span>Gallery</span>
                <span>Contact</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. STICKY BOOKING BAR */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between gap-2"
        style={{
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: cardBorder,
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="px-2 py-1 border flex items-center gap-1 text-[8px]"
            style={{
              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
              borderColor: cardBorder,
              borderRadius: radius === '9999px' ? '9999px' : '6px',
              color: textColor,
            }}
          >
            <Calendar className="w-2.5 h-2.5" style={{ color: theme.accent_color }} />
            <span>15 Nov → 16 Nov</span>
          </div>
          {!isMobile && (
            <div
              className="px-2 py-1 border flex items-center gap-1 text-[8px]"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                borderColor: cardBorder,
                borderRadius: radius === '9999px' ? '9999px' : '6px',
                color: textColor,
              }}
            >
              <Users className="w-2.5 h-2.5" style={{ color: theme.accent_color }} />
              <span>2 Guests • 1 Room</span>
            </div>
          )}
        </div>

        <span
          className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider shrink-0"
          style={{
            backgroundColor: theme.primary_color,
            color: '#ffffff',
            borderRadius: radius,
          }}
        >
          Book Now →
        </span>
      </div>

      {/* 4. CLEAN HERO BANNER (No dark overlay, matching live site!) */}
      <div className={`relative w-full ${isFullScreen ? 'aspect-[21/9]' : 'aspect-[16/8]'} overflow-hidden bg-slate-200`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl}
          alt={hotelName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 5. WELCOME / ABOUT SECTION */}
      <div
        className={`${isFullScreen ? 'px-8 py-8' : 'px-4 py-5'} border-b`}
        style={{ backgroundColor: bgColor, borderColor: cardBorder }}
      >
        <div className="max-w-xl mx-auto text-center space-y-2">
          <span
            className="inline-block text-[7px] font-bold uppercase tracking-[0.25em] px-2.5 py-0.5 border"
            style={{
              color: theme.accent_color,
              backgroundColor: `${theme.accent_color}14`,
              borderColor: `${theme.accent_color}35`,
              borderRadius: '9999px',
            }}
          >
            Official Hotel Sanctuary
          </span>
          <h3
            className={`${isFullScreen ? 'text-2xl' : 'text-base'} font-semibold tracking-wide`}
            style={{ color: textColor, fontFamily: fontStack }}
          >
            Welcome to {hotelName}
          </h3>
          <div
            className="w-10 h-[1.5px] mx-auto"
            style={{ backgroundColor: theme.accent_color }}
          />
          <p
            className={`${isFullScreen ? 'text-xs' : 'text-[9px]'} leading-relaxed`}
            style={{ color: subTextColor }}
          >
            สัมผัสประสบการณ์การพักผ่อนแสนพิเศษ ห้องพักออกแบบอย่างพิถีพิถัน พร้อมจองตรงราคาดีที่สุดบนเว็บไซต์ทางการของโรงแรม
          </p>
        </div>
      </div>

      {/* 6. ACCOMMODATIONS / ROOM CARDS */}
      <div
        className={`${isFullScreen ? 'px-8 py-8' : 'px-4 py-5'}`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="text-center mb-3.5 space-y-1">
          <div
            className="text-[7px] font-bold uppercase tracking-[0.25em]"
            style={{ color: theme.accent_color }}
          >
            Bespoke Sanctuaries
          </div>
          <div
            className={`${isFullScreen ? 'text-xl' : 'text-sm'} font-semibold`}
            style={{ color: textColor, fontFamily: fontStack }}
          >
            Our Accommodations
          </div>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
          {sampleRooms.slice(0, isMobile ? 1 : 2).map((rm, idx) => (
            <div
              key={idx}
              className="overflow-hidden border shadow-xs flex flex-col"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                borderRadius: cardRadius,
              }}
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-slate-200 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rm.image}
                  alt={rm.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-between text-left">
                <div>
                  <div
                    className={`${isFullScreen ? 'text-sm' : 'text-[10px]'} font-bold truncate`}
                    style={{ color: textColor, fontFamily: fontStack }}
                  >
                    {rm.name}
                  </div>
                  <div
                    className="flex items-center gap-2 text-[8px] mt-0.5"
                    style={{ color: subTextColor }}
                  >
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-2.5 h-2.5" style={{ color: theme.accent_color }} />
                      {rm.bed}
                    </span>
                  </div>
                </div>

                <div
                  className="pt-2 border-t flex items-center justify-between"
                  style={{ borderColor: cardBorder }}
                >
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: theme.accent_color }}
                  >
                    ฿{Number(rm.price || 1800).toLocaleString()}
                    <span className="text-[7px] font-normal opacity-75"> / คืน</span>
                  </span>
                  <span
                    className="px-2.5 py-1 text-[7px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: theme.primary_color,
                      color: '#ffffff',
                      borderRadius: radius,
                    }}
                  >
                    Reserve
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. FOOTER PREVIEW */}
      <div
        className="px-4 py-4"
        style={{
          backgroundColor: theme.primary_color,
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        {theme.footer_layout === 'luxury' ? (
          <div className="text-center space-y-1.5">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: theme.accent_color, fontFamily: fontStack }}
            >
              {hotelName}
            </div>
            <div
              className="w-8 h-[1px] mx-auto"
              style={{ backgroundColor: `${theme.accent_color}80` }}
            />
            <div className="text-[7px] opacity-65">
              Official Direct Booking • Best Rate Guaranteed
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-[8px]">
            <span
              className="font-bold uppercase tracking-widest truncate"
              style={{ color: theme.accent_color, fontFamily: fontStack }}
            >
              {hotelName}
            </span>
            <span className="opacity-60 text-[7px] shrink-0">
              © Direct Booking Website
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateThumbnailCardProps {
  template: HotelWebsiteTemplate;
  isSelected: boolean;
  isSavedActive: boolean;
  heroPhoto: string;
  hotelName: string;
  onSelect: () => void;
}

function TemplateThumbnailCard({
  template,
  isSelected,
  isSavedActive,
  heroPhoto,
  hotelName,
  onSelect,
}: TemplateThumbnailCardProps) {
  const { theme } = template;
  const radius = getButtonRadius(theme);
  const isDark = Boolean(theme.dark_mode);
  const bg = theme.background_color || '#ffffff';
  const txt = theme.text_color || '#0f172a';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group text-left rounded-2xl border-2 transition-all duration-150 overflow-hidden flex flex-col bg-white cursor-pointer ${
        isSelected
          ? 'border-blue-600 ring-4 ring-blue-600/15 shadow-lg -translate-y-0.5'
          : isSavedActive
          ? 'border-emerald-500/70 hover:border-emerald-600 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* MINIATURE VISUAL WEBSITE MOCKUP */}
      <div
        className="w-full border-b border-slate-100 overflow-hidden relative"
        style={{ backgroundColor: bg }}
      >
        {/* Top utility strip */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: theme.primary_color }}
        />

        {/* Mini Header */}
        <div
          className="px-2.5 py-1.5 flex items-center justify-between border-b"
          style={{
            backgroundColor:
              theme.header_layout === 'luxury'
                ? theme.primary_color
                : isDark
                ? '#0f172a'
                : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
          }}
        >
          {theme.header_layout === 'centered' ? (
            <div className="w-full text-center">
              <div
                className="text-[8px] font-bold uppercase tracking-[0.18em] truncate"
                style={{
                  color: isDark ? '#ffffff' : theme.primary_color,
                }}
              >
                {hotelName}
              </div>
            </div>
          ) : (
            <>
              <span
                className="text-[8px] font-bold uppercase tracking-wider truncate max-w-[65%]"
                style={{
                  color:
                    theme.header_layout === 'luxury'
                      ? theme.accent_color
                      : isDark
                      ? '#ffffff'
                      : theme.primary_color,
                }}
              >
                {hotelName}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="w-2.5 h-1 rounded-full opacity-50"
                  style={{
                    backgroundColor:
                      theme.header_layout === 'luxury' || isDark ? '#ffffff' : '#64748b',
                  }}
                />
                <span
                  className="px-1.5 py-0.5 text-[6px] font-bold uppercase"
                  style={{
                    backgroundColor:
                      theme.header_layout === 'luxury'
                        ? theme.accent_color
                        : theme.primary_color,
                    color: '#ffffff',
                    borderRadius: radius,
                  }}
                >
                  Book
                </span>
              </div>
            </>
          )}
        </div>

        {/* Mini Hero Photo */}
        <div className="relative h-20 w-full overflow-hidden bg-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPhoto || template.fallbackHeroImage}
            alt={template.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.78)',
                color: '#ffffff',
              }}
            >
              #{String(template.number).padStart(2, '0')}
            </span>
            {isSavedActive && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-xs"
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                }}
              >
                <Check className="w-2.5 h-2.5" />
                ใช้งานอยู่
              </span>
            )}
          </div>

          {isSelected && !isSavedActive && (
            <span
              className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
              }}
            >
              กำลังดูตัวอย่าง
            </span>
          )}
        </div>

        {/* Mini Body Section Preview */}
        <div className="p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div
                className="h-1 w-8 rounded-full"
                style={{ backgroundColor: theme.accent_color }}
              />
              <div
                className="text-[9px] font-semibold truncate"
                style={{ color: txt }}
              >
                Our Accommodations
              </div>
            </div>
            <span
              className="px-2 py-0.5 text-[7px] font-bold uppercase shrink-0"
              style={{
                backgroundColor: theme.primary_color,
                color: '#ffffff',
                borderRadius: radius,
              }}
            >
              Reserve
            </span>
          </div>
        </div>
      </div>

      {/* TEMPLATE INFO FOOTER */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-white">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {template.categoryLabel}
            </span>
            {/* Color Swatches */}
            <div className="flex items-center -space-x-1">
              {[
                template.theme.primary_color,
                template.theme.secondary_color,
                template.theme.accent_color,
                template.theme.background_color,
              ].map((color, idx) => (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {template.nameTh}
          </h4>
          <p className="text-[11px] font-medium text-slate-400 -mt-0.5">
            {template.name}
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 pt-0.5">
            {template.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 pt-1">
          {template.features.map((feat) => (
            <span
              key={feat}
              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function ThemePage() {
  const initialBundle = peekAdminBundle();
  const initialHotel = initialBundle?.hotel || null;

  const [hotel, setHotel] = useState<Hotel | null>(initialHotel);
  const [hotelId, setHotelId] = useState(initialHotel?.id || '');
  const [slides, setSlides] = useState<HeroSlide[]>(initialBundle?.slides || []);
  const [rooms, setRooms] = useState<Room[]>(initialBundle?.rooms || []);

  const [theme, setTheme] = useState<HotelTheme>(
    initialHotel?.theme ? { ...DEFAULT_THEME, ...initialHotel.theme } : { ...DEFAULT_THEME }
  );
  const [savedTheme, setSavedTheme] = useState<HotelTheme>(
    initialHotel?.theme ? { ...DEFAULT_THEME, ...initialHotel.theme } : { ...DEFAULT_THEME }
  );

  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isLoading, setIsLoading] = useState(!initialHotel?.theme);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const syncBundle = async () => {
      try {
        const cached = peekAdminBundle();
        if (cached?.hotel) {
          setHotel(cached.hotel);
          setHotelId(cached.hotel.id);
          const nextTheme = { ...DEFAULT_THEME, ...(cached.hotel.theme || {}) };
          setTheme(nextTheme);
          setSavedTheme(nextTheme);
          if (cached.slides) setSlides(cached.slides);
          if (cached.rooms) setRooms(cached.rooms);
          setIsLoading(false);
          if (!cached.complete) {
            const full = await loadAdminBundle({ hotelId: cached.hotel.id });
            if (full?.slides) setSlides(full.slides);
            if (full?.rooms) setRooms(full.rooms);
          }
          return;
        }

        setIsLoading(true);
        const data = await loadAdminBundle();
        if (data?.hotel) {
          setHotel(data.hotel);
          setHotelId(data.hotel.id);
          const nextTheme = { ...DEFAULT_THEME, ...(data.hotel.theme || {}) };
          setTheme(nextTheme);
          setSavedTheme(nextTheme);
          setSlides(data.slides || []);
          setRooms(data.rooms || []);
        }
      } catch (err) {
        console.error('Failed to load theme via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void syncBundle();
    window.addEventListener('active-hotel-changed', syncBundle);
    return () => window.removeEventListener('active-hotel-changed', syncBundle);
  }, []);

  const selectedTemplate = useMemo(() => findMatchingTemplate(theme), [theme]);
  const savedTemplate = useMemo(() => findMatchingTemplate(savedTheme), [savedTheme]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return HOTEL_WEBSITE_TEMPLATES;
    return HOTEL_WEBSITE_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  // Real hotel cover image & sample rooms for realistic preview
  const heroImageUrl = useMemo(() => {
    const firstSlide = normalizePreviewImageUrl(slides[0]?.image_url);
    if (firstSlide) return firstSlide;
    const firstRoomPhoto = normalizePreviewImageUrl(rooms[0]?.gallery?.[0]);
    if (firstRoomPhoto) return firstRoomPhoto;
    return (
      selectedTemplate?.fallbackHeroImage ||
      HOTEL_WEBSITE_TEMPLATES[0].fallbackHeroImage
    );
  }, [slides, rooms, selectedTemplate]);

  const sampleRooms = useMemo(() => {
    if (rooms.length > 0) {
      return rooms.slice(0, 2).map((r) => ({
        name: r.name,
        price: r.price || 2200,
        bed: r.bed_type || 'King Bed',
        image:
          normalizePreviewImageUrl(r.gallery?.[0]) ||
          heroImageUrl,
      }));
    }
    return [
      {
        name: 'Deluxe Double Suite',
        price: 2400,
        bed: 'King Bed • Max 2',
        image:
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Premier Pool Access',
        price: 3200,
        bed: 'Twin / King • Max 3',
        image:
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }, [rooms, heroImageUrl]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(theme) !== JSON.stringify(savedTheme);
  }, [theme, savedTheme]);

  const handleSelectTemplate = (tpl: HotelWebsiteTemplate) => {
    setTheme({ ...tpl.theme });
    setNotification(null);
  };

  const handleApplyTheme = async () => {
    if (!hotelId) return;
    setIsSaving(true);
    setNotification(null);

    const result = await saveThemeSettingsAction(hotelId, theme);

    if (result.success) {
      setSavedTheme({ ...theme });
      invalidateAdminCache(hotelId);
      void loadAdminBundle({ hotelId, force: true });
      setNotification({
        type: 'success',
        message: `บันทึกใช้งาน "${
          selectedTemplate ? selectedTemplate.nameTh : 'ดีไซน์ที่ปรับแต่งเอง'
        }" เรียบร้อยแล้ว! หน้าเว็บไซต์โรงแรมอัปเดตทันที`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'เกิดข้อผิดพลาดในการบันทึกดีไซน์ กรุณาลองใหม่อีกครั้ง',
      });
    }
    setIsSaving(false);
  };

  const fontImportName = (theme.font_family || 'Inter').replace(/ /g, '+');

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 font-medium">
        กำลังโหลดรายการเทมเพลตเว็บไซต์...
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6 text-left pb-16">
      {/* Load active preview Google Font dynamically */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${fontImportName}:wght@300;400;500;600;700&display=swap`}
      />

      {/* TOP HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Sparkles className="w-3 h-3" />
              16 Website Templates
            </span>
            {savedTemplate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3" />
                ใช้งานอยู่: {savedTemplate.nameTh}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            เลือกเทมเพลตเว็บไซต์โรงแรม (Design & Templates)
          </h1>
          <p className="text-xs text-slate-500">
            คลิกเลือกแบบเว็บไซต์จาก 16 สไตล์ด้านซ้าย เพื่อดูตัวอย่างหน้าเว็บจริงของ{' '}
            <strong className="text-slate-700">{hotel?.name || 'โรงแรม'}</strong> ทางด้านขวา แล้วกดปุ่ม{' '}
            <strong className="text-slate-700">&ldquo;บันทึกใช้งาน Template นี้&rdquo;</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {hotel?.slug && (
            <a
              href={`/sites/${hotel.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span>ดูเว็บจริง</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={handleApplyTheme}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
            style={{
              backgroundColor: hasUnsavedChanges ? '#2563eb' : '#059669',
              color: '#ffffff',
            }}
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? 'กำลังบันทึก...'
                : hasUnsavedChanges
                ? `บันทึกใช้งาน "${selectedTemplate?.nameTh || 'ดีไซน์นี้'}"`
                : 'บันทึกซ้ำ / ใช้งานอยู่แล้ว'}
            </span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <p className="text-xs font-semibold">{notification.message}</p>
        </div>
      )}

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TEMPLATE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              style={
                isActive
                  ? { backgroundColor: '#0f172a', color: '#ffffff' }
                  : undefined
              }
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* MAIN WORKSPACE: LEFT TEMPLATE GALLERY (7 cols) | RIGHT LIVE WEBSITE PREVIEW (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 16 VISUAL TEMPLATE CARDS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              const isSavedActive = savedTemplate?.id === tpl.id;
              return (
                <TemplateThumbnailCard
                  key={tpl.id}
                  template={tpl}
                  isSelected={isSelected}
                  isSavedActive={isSavedActive}
                  heroPhoto={heroImageUrl}
                  hotelName={hotel?.name || 'Luxury Hotel'}
                  onSelect={() => handleSelectTemplate(tpl)}
                />
              );
            })}
          </div>

          {/* COLLAPSIBLE OPTIONAL ADVANCED FINE-TUNING */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    ปรับแต่งสีและฟอนต์เพิ่มเติมเอง (ไม่บังคับ)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    หากต้องการเปลี่ยนเฉพาะสีหลัก ฟอนต์ หรือทรงปุ่ม ต่อจากเทมเพลตที่เลือก
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAdvanced && (
              <div className="p-5 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/40">
                {/* Simple Color Pickers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'primary_color', label: 'สีหลัก (หัวเว็บ/ปุ่ม)' },
                    { key: 'accent_color', label: 'สีเน้น (ทอง/ไฮไลท์)' },
                    { key: 'background_color', label: 'สีพื้นหลังเว็บ' },
                    { key: 'text_color', label: 'สีตัวอักษรหลัก' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 cursor-pointer block"
                    >
                      <span className="text-[11px] font-bold text-slate-700 block">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(theme as any)[item.key] || '#000000'}
                          onChange={(e) =>
                            setTheme({
                              ...theme,
                              template_id: undefined,
                              [item.key]: e.target.value,
                            })
                          }
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-slate-500 uppercase">
                          {(theme as any)[item.key]}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Simple Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      ฟอนต์เว็บไซต์ (Font)
                    </label>
                    <select
                      value={theme.font_family}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          template_id: undefined,
                          font_family: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <option value="Inter">Inter (คลีนทันสมัย)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (รีสอร์ทโปร่งสบาย)</option>
                      <option value="Outfit">Outfit (โมเดิร์นบูทีค)</option>
                      <option value="DM Sans">DM Sans (มินิมอลอ่านง่าย)</option>
                      <option value="Montserrat">Montserrat (เรียบคมชัด)</option>
                      <option value="Playfair Display">Playfair Display (หรูหราคลาสสิก)</option>
                      <option value="Cormorant Garamond">Cormorant Garamond (ลักชัวรีรีสอร์ท)</option>
                      <option value="Bodoni Moda">Bodoni Moda (แกรนด์พาเลซ)</option>
                      <option value="Lora">Lora (อบอุ่นธรรมชาติ)</option>
                      <option value="Noto Serif">Noto Serif (เซนมินิมอล)</option>
                      <option value="Cinzel">Cinzel (อิมพีเรียลสง่างาม)</option>
                      <option value="Marcellus">Marcellus (บูทีคร่วมสมัย)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      รูปทรงปุ่มกด (Buttons)
                    </label>
                    <select
                      value={theme.button_style}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          template_id: undefined,
                          button_style: e.target.value as HotelTheme['button_style'],
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <option value="rounded">มุมมนมาตรฐาน (Rounded)</option>
                      <option value="pill">ทรงแคปซูลโค้งมน (Pill)</option>
                      <option value="square">มุมเหลี่ยมคมชัด (Square)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      รูปแบบหัวเว็บ (Header)
                    </label>
                    <select
                      value={theme.header_layout}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          template_id: undefined,
                          header_layout: e.target.value as HotelTheme['header_layout'],
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <option value="minimal">โลโก้ซ้าย-เมนูขวา (Minimal)</option>
                      <option value="centered">โลโก้และเมนูกึ่งกลาง (Centered)</option>
                      <option value="luxury">แถบสีเข้มพรีเมียม (Luxury)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE INTERACTIVE WEBSITE PREVIEW */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            {/* Preview Top Controls Bar */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    ตัวอย่าง: {selectedTemplate ? selectedTemplate.nameTh : 'ดีไซน์ปรับแต่งเอง'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    แสดงผลด้วยชื่อและรูปจริงของ {hotel?.name || 'โรงแรม'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Desktop / Mobile Toggle */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'desktop'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    style={
                      viewMode === 'desktop'
                        ? { backgroundColor: '#0f172a', color: '#ffffff' }
                        : undefined
                    }
                    title="มุมมองคอมพิวเตอร์"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'mobile'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    style={
                      viewMode === 'mobile'
                        ? { backgroundColor: '#0f172a', color: '#ffffff' }
                        : undefined
                    }
                    title="มุมมองมือถือ"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expand Full-Screen Modal */}
                <button
                  type="button"
                  onClick={() => setFullScreenPreview(true)}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="ขยายดูตัวอย่างเต็มจอ"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>ขยาย</span>
                </button>
              </div>
            </div>

            {/* Browser Chrome URL Bar */}
            {viewMode === 'desktop' && (
              <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-0.5 text-[10px] text-slate-500 truncate">
                  https://{hotel?.custom_domain || `${hotel?.slug || 'hotel'}.com`}
                </div>
              </div>
            )}

            {/* Scrollable Realistic Website Canvas */}
            <div
              className={`max-h-[560px] overflow-y-auto ${
                viewMode === 'mobile' ? 'p-4 bg-slate-100' : ''
              }`}
            >
              <WebsiteLiveMockup
                theme={theme}
                hotel={hotel}
                heroImageUrl={heroImageUrl}
                sampleRooms={sampleRooms}
                viewMode={viewMode}
              />
            </div>

            {/* Bottom Sticky Apply Action inside Preview Card */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-600 min-w-0">
                {hasUnsavedChanges ? (
                  <span className="text-blue-700 font-semibold">
                    เลือก <strong>{selectedTemplate?.nameTh || 'ดีไซน์ใหม่'}</strong> แล้ว — กดบันทึกเพื่อใช้งานจริง
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    เทมเพลตนี้กำลังใช้งานอยู่บนหน้าเว็บจริง
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleApplyTheme}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-opacity disabled:opacity-60"
                style={{
                  backgroundColor: hasUnsavedChanges ? '#2563eb' : '#059669',
                  color: '#ffffff',
                }}
              >
                {isSaving ? 'กำลังบันทึก...' : 'ใช้ Template นี้'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN LIVE PREVIEW MODAL */}
      {fullScreenPreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.82)' }}
        >
          {/* Modal Top Switcher Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">
                ตัวอย่างเต็มจอ: {selectedTemplate?.nameTh || 'ดีไซน์ปรับแต่งเอง'}
              </span>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const found = HOTEL_WEBSITE_TEMPLATES.find(
                    (t) => t.id === e.target.value
                  );
                  if (found) handleSelectTemplate(found);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {HOTEL_WEBSITE_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    #{String(tpl.number).padStart(2, '0')} — {tpl.nameTh} ({tpl.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('desktop')}
                  className="px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                  style={
                    viewMode === 'desktop'
                      ? { backgroundColor: '#0f172a', color: '#ffffff' }
                      : { color: '#475569' }
                  }
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('mobile')}
                  className="px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                  style={
                    viewMode === 'mobile'
                      ? { backgroundColor: '#0f172a', color: '#ffffff' }
                      : { color: '#475569' }
                  }
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await handleApplyTheme();
                  setFullScreenPreview(false);
                }}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกใช้งาน Template นี้'}</span>
              </button>

              <button
                type="button"
                onClick={() => setFullScreenPreview(false)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Full-Width Preview Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <WebsiteLiveMockup
                theme={theme}
                hotel={hotel}
                heroImageUrl={heroImageUrl}
                sampleRooms={sampleRooms}
                viewMode={viewMode}
                isFullScreen={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
