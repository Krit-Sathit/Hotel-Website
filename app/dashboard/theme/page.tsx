'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  Check,
  LayoutTemplate,
  Monitor,
  Smartphone,
  Maximize2,
  X,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { saveThemeSettingsAction } from '@/lib/db/actions';
import {
  peekAdminBundle,
  loadAdminBundle,
  invalidateAdminCache,
} from '@/lib/admin-client-cache';
import type {
  Hotel,
  HotelTheme,
  Room,
  HeroSlide,
  HomepageSection,
  Promotion,
} from '@/lib/db/mock-data';
import {
  HOTEL_WEBSITE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplateByTheme,
  type TemplateCategory,
  type HotelWebsiteTemplate,
} from '@/lib/hotel-templates';
import HotelTemplateHome from '@/components/templates/hotel-template-home';

const DEFAULT_THEME: HotelTheme = HOTEL_WEBSITE_TEMPLATES[0].theme;

function normalizeImg(url?: string | null): string {
  if (!url) return '';
  return url.replace(/^http:\/\/flowstay\.live\//i, 'https://flowstay.live/');
}

/**
 * Visual Structural Blueprint Thumbnail — distinctly illustrates each of the 16 page layouts!
 */
function LayoutBlueprintThumbnail({
  template,
  photos,
}: {
  template: HotelWebsiteTemplate;
  photos: string[];
}) {
  const { theme } = template;
  const p0 = photos[0] || template.fallbackHeroImage;
  const p1 = photos[1 % photos.length] || p0;
  const p2 = photos[2 % photos.length] || p0;
  const isDark = Boolean(theme.dark_mode);
  const bg = theme.background_color || '#ffffff';
  const line = isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1';
  const block = isDark ? '#1e293b' : '#f1f5f9';

  // #08 LEFT SIDEBAR ATELIER
  if (template.shellStyle === 'left-sidebar') {
    return (
      <div className="h-36 w-full flex overflow-hidden" style={{ backgroundColor: bg }}>
        <div
          className="w-1/4 h-full border-r p-2 flex flex-col justify-between"
          style={{ backgroundColor: isDark ? '#111827' : '#f8fafc', borderColor: line }}
        >
          <div className="space-y-1">
            <div className="h-2 w-10 rounded-xs" style={{ backgroundColor: theme.primary_color }} />
            <div className="h-1 w-8 rounded-xs bg-slate-300" />
            <div className="h-1 w-7 rounded-xs bg-slate-300" />
            <div className="h-1 w-9 rounded-xs bg-slate-300" />
          </div>
          <div className="h-3 w-full rounded-xs" style={{ backgroundColor: theme.primary_color }} />
        </div>
        <div className="flex-1 p-2 space-y-2">
          <div className="grid grid-cols-3 gap-1 h-16">
            <img src={p0} alt="" className="col-span-2 w-full h-full object-cover" />
            <img src={p1} alt="" className="col-span-1 w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 h-12">
            <img src={p2} alt="" className="w-full h-full object-cover" />
            <div className="p-1.5 space-y-1" style={{ backgroundColor: block }}>
              <div className="h-1.5 w-12 bg-slate-400" />
              <div className="h-1 w-16 bg-slate-300" />
              <div className="h-2.5 w-8 mt-1" style={{ backgroundColor: theme.primary_color }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // #02 SPLIT-SCREEN 50/50 + ZIG-ZAG
  if (template.heroLayout === 'split-screen') {
    return (
      <div className="h-36 w-full flex flex-col overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="h-3 border-b px-2 flex items-center justify-between" style={{ borderColor: line }}>
          <div className="h-1.5 w-10" style={{ backgroundColor: theme.primary_color }} />
          <div className="flex gap-1">
            <span className="w-3 h-1 bg-slate-300" />
            <span className="w-3 h-1 bg-slate-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 h-20 border-b" style={{ borderColor: line }}>
          <div className="p-2.5 flex flex-col justify-center space-y-1.5">
            <div className="h-2 w-16" style={{ backgroundColor: theme.primary_color }} />
            <div className="h-1 w-20 bg-slate-300" />
            <div className="p-1.5 border rounded-xs space-y-1 bg-white" style={{ borderColor: line }}>
              <div className="h-1 w-12 bg-slate-300" />
              <div className="h-2.5 w-full" style={{ backgroundColor: theme.primary_color }} />
            </div>
          </div>
          <img src={p0} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 flex-1 items-center">
          <img src={p1} alt="" className="w-full h-8 object-cover" />
          <div className="space-y-1">
            <div className="h-1.5 w-14 bg-slate-400" />
            <div className="h-1 w-10 bg-slate-300" />
          </div>
        </div>
      </div>
    );
  }

  // #05 5-PHOTO MOSAIC + STICKY RIGHT SIDEBAR
  if (template.heroLayout === 'photo-mosaic') {
    return (
      <div className="h-36 w-full p-2 space-y-2 overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="grid grid-cols-4 gap-1 h-16 rounded-lg overflow-hidden">
          <img src={p0} alt="" className="col-span-2 row-span-2 w-full h-full object-cover" />
          <img src={p1} alt="" className="w-full h-full object-cover" />
          <img src={p2} alt="" className="w-full h-full object-cover" />
          <img src={p2} alt="" className="w-full h-full object-cover" />
          <img src={p0} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-3 gap-2 h-14">
          <div className="col-span-2 space-y-1.5">
            <div className="h-6 rounded border p-1 flex gap-1.5 items-center" style={{ borderColor: line }}>
              <div className="w-6 h-full bg-slate-300 rounded-xs" />
              <div className="h-1.5 w-14 bg-slate-400" />
            </div>
            <div className="h-6 rounded border p-1 flex gap-1.5 items-center" style={{ borderColor: line }}>
              <div className="w-6 h-full bg-slate-300 rounded-xs" />
              <div className="h-1.5 w-12 bg-slate-400" />
            </div>
          </div>
          <div className="col-span-1 border rounded-lg p-1.5 flex flex-col justify-between bg-white shadow-xs" style={{ borderColor: line }}>
            <div className="h-1.5 w-full bg-slate-300" />
            <div className="h-2 w-full bg-slate-100" />
            <div className="h-3 w-full rounded-xs" style={{ backgroundColor: theme.primary_color }} />
          </div>
        </div>
      </div>
    );
  }

  // #10 HERO WITH RIGHT FLOATING BOOKING CARD
  if (template.heroLayout === 'booking-card-hero') {
    return (
      <div className="h-36 w-full flex flex-col overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="relative h-24 w-full overflow-hidden">
          <img src={p0} alt="" className="w-full h-full object-cover" />
          <div className="absolute right-2.5 top-2 bottom-2 w-24 bg-white rounded-lg shadow-lg p-1.5 flex flex-col justify-between">
            <div className="h-1.5 w-12" style={{ backgroundColor: theme.accent_color }} />
            <div className="grid grid-cols-2 gap-0.5">
              <div className="h-2.5 bg-slate-100 rounded-2xs" />
              <div className="h-2.5 bg-slate-100 rounded-2xs" />
            </div>
            <div className="h-3 w-full rounded-xs" style={{ backgroundColor: theme.primary_color }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 flex-1">
          <div className="h-full rounded border bg-white p-1 flex gap-1" style={{ borderColor: line }}>
            <img src={p1} alt="" className="w-8 h-full object-cover rounded-xs" />
            <div className="space-y-1 pt-0.5">
              <div className="h-1.5 w-10 bg-slate-500" />
              <div className="h-1 w-8 bg-slate-300" />
            </div>
          </div>
          <div className="h-full rounded border bg-white p-1 flex gap-1" style={{ borderColor: line }}>
            <img src={p2} alt="" className="w-8 h-full object-cover rounded-xs" />
            <div className="space-y-1 pt-0.5">
              <div className="h-1.5 w-10 bg-slate-500" />
              <div className="h-1 w-8 bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // #11 MEDITERRANEAN 3 ARCHES
  if (template.heroLayout === 'arched-courtyard') {
    return (
      <div className="h-36 w-full p-2.5 space-y-2 overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="h-2 w-20 mx-auto rounded-full" style={{ backgroundColor: theme.primary_color }} />
        <div className="grid grid-cols-3 gap-2 h-20 pt-1">
          <img src={p0} alt="" className="w-full h-full object-cover rounded-t-full" />
          <img src={p1} alt="" className="w-full h-full object-cover rounded-t-full -mt-1" />
          <img src={p2} alt="" className="w-full h-full object-cover rounded-t-full" />
        </div>
        <div className="h-4 w-3/4 mx-auto rounded-full bg-white border shadow-xs flex items-center justify-end px-1" style={{ borderColor: line }}>
          <span className="h-2.5 w-8 rounded-full" style={{ backgroundColor: theme.primary_color }} />
        </div>
      </div>
    );
  }

  // #15 3-PANEL VERTICAL TRIPTYCH
  if (template.heroLayout === 'triptych-panels') {
    return (
      <div className="h-36 w-full flex flex-col overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="h-4 flex items-center justify-center" style={{ backgroundColor: theme.primary_color }}>
          <span className="h-1.5 w-16" style={{ backgroundColor: theme.accent_color }} />
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-2 h-24">
          <img src={p0} alt="" className="w-full h-full object-cover border" style={{ borderColor: theme.accent_color }} />
          <img src={p1} alt="" className="w-full h-full object-cover border" style={{ borderColor: theme.accent_color }} />
          <img src={p2} alt="" className="w-full h-full object-cover border" style={{ borderColor: theme.accent_color }} />
        </div>
        <div className="grid grid-cols-2 gap-2 px-2 pb-2 flex-1">
          <div className="border-2 h-full" style={{ borderColor: `${theme.accent_color}80` }} />
          <div className="border-2 h-full" style={{ borderColor: `${theme.accent_color}80` }} />
        </div>
      </div>
    );
  }

  // #16 MODULAR BENTO CARD-STACK
  if (template.shellStyle === 'card-stack-canvas') {
    return (
      <div className="h-36 w-full p-2 space-y-1.5 overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
        <div className="bg-white rounded-xl p-1.5 grid grid-cols-3 gap-1.5 h-16 shadow-2xs">
          <img src={p0} alt="" className="col-span-2 w-full h-full object-cover rounded-lg" />
          <div className="rounded-lg p-1.5 flex flex-col justify-between" style={{ backgroundColor: theme.primary_color }}>
            <span className="h-1.5 w-8 bg-white/80 rounded-full" />
            <span className="h-2 w-full rounded-full" style={{ backgroundColor: theme.accent_color }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-1.5 grid grid-cols-3 gap-1.5 h-14 shadow-2xs">
          {[p0, p1, p2].map((u, i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-slate-100">
              <img src={u} alt="" className="w-full h-7 object-cover" />
              <div className="h-1.5 w-8 bg-slate-300 m-1 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // #12 DARK CINEMA 21:9 + 3:4 POSTERS
  if (template.heroLayout === 'widescreen-noir') {
    return (
      <div className="h-36 w-full p-2 space-y-2 overflow-hidden" style={{ backgroundColor: '#0b0f19' }}>
        <div className="h-12 w-full overflow-hidden border" style={{ borderColor: `${theme.accent_color}50` }}>
          <img src={p0} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="h-3.5 w-5/6 mx-auto border px-1.5 flex items-center justify-between" style={{ backgroundColor: '#111827', borderColor: `${theme.accent_color}50` }}>
          <span className="h-1 w-16 bg-white/40" />
          <span className="h-2 w-8" style={{ backgroundColor: theme.accent_color }} />
        </div>
        <div className="grid grid-cols-3 gap-1.5 h-14 px-2">
          {[p0, p1, p2].map((u, i) => (
            <img key={i} src={u} alt="" className="w-full h-full object-cover rounded-xs opacity-90" />
          ))}
        </div>
      </div>
    );
  }

  // #13 STORY & BOOKING ABOVE HERO
  if (template.heroLayout === 'story-above-hero') {
    return (
      <div className="h-36 w-full p-2.5 space-y-1.5 text-center overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="h-2 w-24 mx-auto rounded-xs" style={{ backgroundColor: theme.primary_color }} />
        <div className="h-1 w-32 mx-auto bg-slate-300 rounded-full" />
        <div className="h-4 w-4/5 mx-auto rounded-full bg-white border shadow-2xs flex items-center justify-end px-1" style={{ borderColor: line }}>
          <span className="h-2.5 w-8 rounded-full" style={{ backgroundColor: theme.primary_color }} />
        </div>
        <img src={p0} alt="" className="w-full h-18 object-cover rounded-xl shadow-xs" />
      </div>
    );
  }

  // #14 DIRECT-BOOKING RATE TABLE PRO
  if (template.roomsLayout === 'rate-table-pro') {
    return (
      <div className="h-36 w-full p-2 space-y-1.5 overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="grid grid-cols-3 gap-1 h-10 rounded overflow-hidden">
          <img src={p0} alt="" className="w-full h-full object-cover" />
          <img src={p1} alt="" className="w-full h-full object-cover" />
          <img src={p2} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="border rounded-lg overflow-hidden bg-white divide-y" style={{ borderColor: line }}>
          <div className="h-3 px-2 flex items-center" style={{ backgroundColor: theme.primary_color }}>
            <span className="h-1 w-12 bg-white/80" />
          </div>
          {[0, 1].map((r) => (
            <div key={r} className="p-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <img src={r === 0 ? p1 : p2} alt="" className="w-7 h-5 object-cover rounded-2xs" />
                <div className="space-y-0.5">
                  <div className="h-1.5 w-12 bg-slate-600" />
                  <div className="h-1 w-16 bg-emerald-500/60" />
                </div>
              </div>
              <span className="h-3 w-8 rounded-2xs" style={{ backgroundColor: theme.primary_color }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // #09 MAGAZINE 3-COLUMN MASTHEAD
  if (template.heroLayout === 'magazine-masthead') {
    return (
      <div className="h-36 w-full p-2 space-y-1.5 overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="border-y py-1 text-center" style={{ borderColor: line }}>
          <div className="h-2 w-24 mx-auto" style={{ backgroundColor: theme.primary_color }} />
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-22">
          <div className="col-span-1 space-y-1 border-r pr-1" style={{ borderColor: line }}>
            <div className="h-1.5 w-8" style={{ backgroundColor: theme.accent_color }} />
            <div className="h-1 w-full bg-slate-300" />
            <img src={p1} alt="" className="w-full h-10 object-cover mt-1" />
          </div>
          <img src={p0} alt="" className="col-span-2 w-full h-full object-cover" />
          <div className="col-span-1 space-y-1 border-l pl-1" style={{ borderColor: line }}>
            <img src={p2} alt="" className="w-full h-10 object-cover" />
            <div className="h-1.5 w-8" style={{ backgroundColor: theme.accent_color }} />
            <div className="h-1 w-full bg-slate-300" />
          </div>
        </div>
      </div>
    );
  }

  // #03 FLOATING PILL NAV + GLASS DOCK + 3-COL
  if (template.heroLayout === 'floating-dock') {
    return (
      <div className="h-36 w-full p-2 space-y-1.5 overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="h-3.5 rounded-full bg-white border px-2 flex items-center justify-between shadow-2xs" style={{ borderColor: line }}>
          <span className="h-1.5 w-10 rounded-full" style={{ backgroundColor: theme.primary_color }} />
          <span className="h-2 w-6 rounded-full" style={{ backgroundColor: theme.primary_color }} />
        </div>
        <div className="relative h-16 rounded-xl overflow-hidden">
          <img src={p0} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="-mt-3 relative z-10 h-4 w-4/5 mx-auto rounded-full bg-white shadow-md border flex items-center justify-end px-1" style={{ borderColor: line }}>
          <span className="h-2.5 w-7 rounded-full" style={{ backgroundColor: theme.primary_color }} />
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {[p0, p1, p2].map((u, i) => (
            <img key={i} src={u} alt="" className="w-full h-7 object-cover rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  // #04 GRAND CREST FLANKED CINEMA + FULL ROWS
  if (template.heroLayout === 'cinema-crest') {
    return (
      <div className="h-36 w-full p-2 space-y-1.5 overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="h-2.5 w-16 mx-auto" style={{ backgroundColor: theme.primary_color }} />
        <div className="grid grid-cols-6 gap-1 h-16">
          <img src={p1} alt="" className="col-span-1 w-full h-full object-cover opacity-70" />
          <img src={p0} alt="" className="col-span-4 w-full h-full object-cover" />
          <img src={p2} alt="" className="col-span-1 w-full h-full object-cover opacity-70" />
        </div>
        <div className="border p-1 flex items-center justify-between bg-white" style={{ borderColor: line }}>
          <div className="flex items-center gap-1.5">
            <img src={p1} alt="" className="w-8 h-6 object-cover" />
            <div className="h-1.5 w-14 bg-slate-500" />
          </div>
          <span className="h-3 w-8" style={{ backgroundColor: theme.primary_color }} />
        </div>
      </div>
    );
  }

  // #06 ZEN FRAMED WHITESPACE + HAIRLINE LIST
  if (template.heroLayout === 'zen-framed') {
    return (
      <div className="h-36 w-full px-4 py-2.5 space-y-2 overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="flex gap-2 h-18">
          <div className="w-1.5 h-full" style={{ backgroundColor: `${theme.accent_color}70` }} />
          <img src={p0} alt="" className="flex-1 h-full object-cover" />
        </div>
        <div className="border-y py-1 flex justify-between items-center" style={{ borderColor: line }}>
          <span className="h-1 w-20 bg-slate-400" />
          <span className="h-2.5 w-8" style={{ backgroundColor: theme.primary_color }} />
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[8px] font-mono text-slate-400">01</span>
          <div className="h-1.5 w-24 bg-slate-400" />
          <span className="h-2 w-6 border" style={{ borderColor: theme.primary_color }} />
        </div>
      </div>
    );
  }

  // #07 CURVED COASTAL + MULTI-THUMB VILLAS
  if (template.heroLayout === 'curved-coastal') {
    return (
      <div className="h-36 w-full overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="h-18 w-full rounded-b-[28px] overflow-hidden">
          <img src={p0} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="-mt-2.5 h-4 w-3/4 mx-auto rounded-full bg-white shadow border flex items-center justify-end px-1 relative z-10" style={{ borderColor: line }}>
          <span className="h-2.5 w-7 rounded-full" style={{ backgroundColor: theme.primary_color }} />
        </div>
        <div className="grid grid-cols-2 gap-2 p-2">
          {[p1, p2].map((u, i) => (
            <div key={i} className="border rounded-lg p-1 bg-white space-y-0.5" style={{ borderColor: line }}>
              <img src={u} alt="" className="w-full h-6 object-cover rounded-xs" />
              <div className="grid grid-cols-4 gap-0.5">
                <span className="h-1.5 bg-slate-200" />
                <span className="h-1.5 bg-slate-200" />
                <span className="h-1.5 bg-slate-200" />
                <span className="h-1.5 bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // #01 CLASSIC FULL-BLEED SLIDER + 2-COL GRID
  return (
    <div className="h-36 w-full flex flex-col overflow-hidden" style={{ backgroundColor: bg }}>
      <div className="h-2.5" style={{ backgroundColor: theme.primary_color }} />
      <div className="h-3.5 bg-white border-b px-2 flex items-center justify-between" style={{ borderColor: line }}>
        <span className="h-1.5 w-12" style={{ backgroundColor: theme.primary_color }} />
        <span className="h-2 w-8 rounded-2xs" style={{ backgroundColor: theme.primary_color }} />
      </div>
      <img src={p0} alt="" className="w-full h-18 object-cover" />
      <div className="grid grid-cols-2 gap-2 p-2 flex-1">
        <img src={p1} alt="" className="w-full h-full object-cover rounded-xs" />
        <img src={p2} alt="" className="w-full h-full object-cover rounded-xs" />
      </div>
    </div>
  );
}

/**
 * Scaled Live Desktop/Mobile Viewport Container so true 1280px desktop layouts (Left Sidebar, 50/50 Split, 5-Photo Mosaic, 3-Col Bento)
 * render at real desktop proportions inside the side preview panel!
 */
function ScaledLiveViewport({
  viewMode,
  children,
}: {
  viewMode: 'desktop' | 'mobile';
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(480);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (viewMode === 'mobile') {
    return (
      <div ref={wrapRef} className="p-4 bg-slate-100 flex justify-center max-h-[600px] overflow-y-auto">
        <div className="w-[375px] rounded-[28px] border-[6px] border-slate-800 bg-white overflow-hidden shadow-xl">
          {children}
        </div>
      </div>
    );
  }

  const targetDesktopWidth = 1280;
  const scale = Math.min(1, Math.max(0.28, containerWidth / targetDesktopWidth));

  return (
    <div
      ref={wrapRef}
      className="w-full max-h-[600px] overflow-y-auto overflow-x-hidden bg-slate-100"
    >
      <div
        style={{
          width: `${targetDesktopWidth}px`,
          zoom: scale,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ThemePage() {
  const initialBundle = peekAdminBundle();
  const initialHotel = initialBundle?.hotel || null;

  const [hotel, setHotel] = useState<Hotel | null>(initialHotel);
  const [hotelId, setHotelId] = useState(initialHotel?.id || '');
  const [slides, setSlides] = useState<HeroSlide[]>(initialBundle?.slides || []);
  const [rooms, setRooms] = useState<Room[]>(initialBundle?.rooms || []);
  const [sections, setSections] = useState<HomepageSection[]>(initialBundle?.sections || []);
  const [promotions, setPromotions] = useState<Promotion[]>(initialBundle?.promotions || []);
  const [media, setMedia] = useState<any[]>(initialBundle?.media || []);

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
          if (cached.sections) setSections(cached.sections);
          if (cached.promotions) setPromotions(cached.promotions);
          if (cached.media) setMedia(cached.media);
          setIsLoading(false);

          if (!cached.complete) {
            const full = await loadAdminBundle({ hotelId: cached.hotel.id });
            if (full) {
              setSlides(full.slides || []);
              setRooms(full.rooms || []);
              setSections(full.sections || []);
              setPromotions(full.promotions || []);
              setMedia(full.media || []);
            }
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
          setSections(data.sections || []);
          setPromotions(data.promotions || []);
          setMedia(data.media || []);
        }
      } catch (err) {
        console.error('Failed to load templates bundle:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void syncBundle();
    window.addEventListener('active-hotel-changed', syncBundle);
    return () => window.removeEventListener('active-hotel-changed', syncBundle);
  }, []);

  const selectedTemplate = useMemo(() => getTemplateByTheme(theme), [theme]);
  const savedTemplate = useMemo(() => getTemplateByTheme(savedTheme), [savedTheme]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return HOTEL_WEBSITE_TEMPLATES;
    return HOTEL_WEBSITE_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  // Build gallery & fallback sample data so Live Preview is ALWAYS rich and realistic
  const previewGallery = useMemo(() => {
    return (media || []).map((m: any, i: number) => ({
      id: m.id || `g-${i}`,
      hotel_id: hotelId,
      image_url: normalizeImg(m.url),
      category: m.category || 'General',
      alt_text: m.altText || '',
      sort_order: i,
    }));
  }, [media, hotelId]);

  const blueprintPhotos = useMemo(() => {
    const list: string[] = [];
    for (const s of slides) {
      const u = normalizeImg(s.image_url);
      if (u && !list.includes(u)) list.push(u);
    }
    for (const r of rooms) {
      for (const g of r.gallery || []) {
        const u = normalizeImg(g);
        if (u && !list.includes(u) && list.length < 6) list.push(u);
      }
    }
    if (list.length === 0) {
      list.push(
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      );
    }
    return list;
  }, [slides, rooms]);

  const previewRooms: Room[] = useMemo(() => {
    if (rooms.length > 0) return rooms;
    return [
      {
        id: 'sample-1',
        hotel_id: hotelId,
        name: 'Deluxe Double Suite',
        description: 'Spacious suite featuring natural daylight, plush king bedding, and private balcony.',
        gallery: [blueprintPhotos[1 % blueprintPhotos.length]],
        amenities: ['Free Wi-Fi', 'Air Conditioning', 'Balcony'],
        max_guests: 2,
        room_size: 36,
        bed_type: 'King Bed',
        price: 2400,
        sort_order: 0,
      },
      {
        id: 'sample-2',
        hotel_id: hotelId,
        name: 'Premier Pool Villa',
        description: 'Exclusive villa accommodation with direct pool access and curated amenities.',
        gallery: [blueprintPhotos[2 % blueprintPhotos.length]],
        amenities: ['Pool Access', 'Smart TV', 'Breakfast'],
        max_guests: 3,
        room_size: 48,
        bed_type: 'King / Twin',
        price: 3500,
        sort_order: 1,
      },
      {
        id: 'sample-3',
        hotel_id: hotelId,
        name: 'Family Garden Residence',
        description: 'Generous living space surrounded by lush tropical gardens for families and groups.',
        gallery: [blueprintPhotos[0]],
        amenities: ['Garden View', 'Living Area', 'Free Wi-Fi'],
        max_guests: 4,
        room_size: 62,
        bed_type: '2 Queen Beds',
        price: 4200,
        sort_order: 2,
      },
    ];
  }, [rooms, hotelId, blueprintPhotos]);

  const previewHotel: Hotel = useMemo(
    () =>
      hotel || {
        id: 'preview',
        name: 'Luxury Resort & Villa',
        slug: 'hotel',
        custom_domain: null,
        status: 'active',
        logo_url: null,
        favicon_url: null,
        email: 'reservations@hotel.com',
        phone: '076 510 960',
        address: 'Phuket, Thailand',
        google_map_url: '',
        social_links: { facebook: '', instagram: '', whatsapp: '', twitter: '' },
        theme,
        homepage_layout: ['hero', 'about', 'rooms', 'gallery', 'contact'],
      },
    [hotel, theme]
  );

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(theme) !== JSON.stringify(savedTheme),
    [theme, savedTheme]
  );

  const handleSelectTemplate = (tpl: HotelWebsiteTemplate) => {
    setTheme({ ...tpl.theme });
    setNotification(null);
  };

  const handleApplyTheme = async () => {
    if (!hotelId) return;
    setIsSaving(true);
    setNotification(null);

    const payloadTheme: HotelTheme = {
      ...theme,
      template_id: theme.template_id || selectedTemplate.id,
    };

    const result = await saveThemeSettingsAction(hotelId, payloadTheme);

    if (result.success) {
      setTheme(payloadTheme);
      setSavedTheme(payloadTheme);
      invalidateAdminCache(hotelId);
      void loadAdminBundle({ hotelId, force: true });
      setNotification({
        type: 'success',
        message: `บันทึกใช้งาน "${selectedTemplate.nameTh}" เรียบร้อยแล้ว! หน้าเว็บไซต์จริงเปลี่ยน Layout และดีไซน์ตามที่เลือกทันที`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'ไม่สามารถบันทึกเทมเพลตได้ กรุณาลองใหม่อีกครั้ง',
      });
    }
    setIsSaving(false);
  };

  const fontImportName = (theme.font_family || 'Inter').replace(/ /g, '+');

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 font-medium">
        กำลังโหลดรายการ Website Design & Layout ทั้ง 16 แบบ...
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6 text-left pb-16">
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${fontImportName}:wght@300;400;500;600;700&display=swap`}
      />

      {/* TOP HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <LayoutTemplate className="w-3 h-3" />
              16 Website Layouts & Designs
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3 h-3" />
              ใช้งานอยู่: {savedTemplate.nameTh}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            เลือกรูปแบบดีไซน์และโครงสร้างเว็บไซต์ (Website Layout Templates)
          </h1>
          <p className="text-xs text-slate-500">
            แต่ละแบบมี <strong>โครงสร้างหน้าเว็บ การจัดวางเมนู ภาพปก ฟอร์มจอง และการโชว์ห้องพักที่แตกต่างกัน</strong> — คลิกเพื่อดูตัวอย่างหน้าเว็บจริงด้านขวาได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {hotel?.slug && (
            <a
              href={`/sites/${hotel.slug}?preview_template=${selectedTemplate.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              title="เปิดดูตัวอย่างเทมเพลตนี้แบบเต็มหน้าจอในแท็บใหม่"
            >
              <span>เปิดดูในแท็บใหม่</span>
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
                ? `ใช้ Layout "${selectedTemplate.nameTh}"`
                : 'ใช้งาน Layout นี้อยู่'}
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

      {/* LAYOUT CATEGORY FILTER PILLS */}
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
                isActive ? { backgroundColor: '#0f172a', color: '#ffffff' } : undefined
              }
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* SPLIT WORKSPACE: LEFT 16 STRUCTURAL TEMPLATES (7 cols) | RIGHT TRUE-SCALE LIVE WEBSITE PREVIEW (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: 16 STRUCTURAL LAYOUT CARDS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              const isSavedActive = savedTemplate.id === tpl.id;

              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`group text-left rounded-2xl border-2 transition-all duration-150 overflow-hidden flex flex-col bg-white cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 ring-4 ring-blue-600/15 shadow-lg -translate-y-0.5'
                      : isSavedActive
                      ? 'border-emerald-500/70 hover:border-emerald-600 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* STRUCTURAL BLUEPRINT DIAGRAM */}
                  <div className="relative border-b border-slate-100 w-full">
                    <LayoutBlueprintThumbnail template={tpl} photos={blueprintPhotos} />

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold shadow-xs"
                        style={{ backgroundColor: 'rgba(15,23,42,0.85)', color: '#ffffff' }}
                      >
                        #{String(tpl.number).padStart(2, '0')}
                      </span>
                      {isSavedActive && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-xs"
                          style={{ backgroundColor: '#059669', color: '#ffffff' }}
                        >
                          <Check className="w-2.5 h-2.5" />
                          ใช้งานอยู่
                        </span>
                      )}
                    </div>

                    {isSelected && !isSavedActive && (
                      <span
                        className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs"
                        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                      >
                        กำลังดูตัวอย่าง
                      </span>
                    )}
                  </div>

                  {/* CARD DESCRIPTION */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-white">
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                        {tpl.layoutBadge}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
                        {tpl.nameTh}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {tpl.tagline}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {tpl.features.map((feat) => (
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
            })}
          </div>

          {/* OPTIONAL ADVANCED COLOR / FONT FINE-TUNING */}
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
                    ปรับแต่งสีและฟอนต์เพิ่มเติมบน Layout ที่เลือก (ไม่บังคับ)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    คงโครงสร้าง Layout ของ &ldquo;{selectedTemplate.nameTh}&rdquo; ไว้ แต่เปลี่ยนสีแบรนด์หรือฟอนต์ได้ตามต้องการ
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
              <div className="p-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'primary_color', label: 'สีหลัก (ปุ่ม/แถบบน)' },
                    { key: 'accent_color', label: 'สีเน้น (ไฮไลท์)' },
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
                              template_id: selectedTemplate.id,
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      ฟอนต์เว็บไซต์ (Font Family)
                    </label>
                    <select
                      value={theme.font_family}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          template_id: selectedTemplate.id,
                          font_family: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <option value="Inter">Inter (คลีนมาตรฐาน)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (รีสอร์ทโปร่งสบาย)</option>
                      <option value="Outfit">Outfit (โมเดิร์นสถาปัตย์)</option>
                      <option value="DM Sans">DM Sans (มินิมอลร่วมสมัย)</option>
                      <option value="Playfair Display">Playfair Display (นิตยสารหรู)</option>
                      <option value="Cormorant Garamond">Cormorant Garamond (แกรนด์พาเลซ)</option>
                      <option value="Bodoni Moda">Bodoni Moda (แฟชั่นエディทอเรียล)</option>
                      <option value="Lora">Lora (อบอุ่นธรรมชาติ)</option>
                      <option value="Noto Serif">Noto Serif (เซนมินิมอล)</option>
                      <option value="Cinzel">Cinzel (ซีเนม่าคลาสสิก)</option>
                      <option value="Marcellus">Marcellus (บูทีครีทรีต)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      รูปทรงปุ่มกด (Button Shape)
                    </label>
                    <select
                      value={theme.button_style}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          template_id: selectedTemplate.id,
                          button_style: e.target.value as HotelTheme['button_style'],
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <option value="rounded">มุมมน (Rounded)</option>
                      <option value="pill">ทรงแคปซูลโค้งมน (Pill)</option>
                      <option value="square">มุมเหลี่ยมคมชัด (Square)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: STICKY REAL-LAYOUT LIVE PREVIEW */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            {/* Preview Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {selectedTemplate.nameTh}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold truncate">
                    โครงสร้าง: {selectedTemplate.layoutBadge}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className="p-1.5 rounded-md transition-colors cursor-pointer"
                    style={
                      viewMode === 'desktop'
                        ? { backgroundColor: '#0f172a', color: '#ffffff' }
                        : { color: '#64748b' }
                    }
                    title="มุมมอง Desktop 1280px"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className="p-1.5 rounded-md transition-colors cursor-pointer"
                    style={
                      viewMode === 'mobile'
                        ? { backgroundColor: '#0f172a', color: '#ffffff' }
                        : { color: '#64748b' }
                    }
                    title="มุมมองมือถือ"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setFullScreenPreview(true)}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>ดูเต็มจอ</span>
                </button>
              </div>
            </div>

            {/* Browser Chrome Bar */}
            {viewMode === 'desktop' && (
              <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-0.5 text-[10px] text-slate-500 truncate">
                  https://{hotel?.custom_domain || `${hotel?.slug || 'hotel'}.com`} — เลื่อนลงเพื่อดู Layout ทั้งหน้า
                </div>
              </div>
            )}

            {/* TRUE 1280px SCALED REAL WEBSITE RENDERER */}
            <ScaledLiveViewport viewMode={viewMode}>
              <HotelTemplateHome
                hotel={previewHotel}
                themeOverride={theme}
                templateOverride={selectedTemplate}
                slides={slides}
                sections={sections}
                rooms={previewRooms}
                promotions={promotions}
                gallery={previewGallery}
                bookingUrl={`/sites/${previewHotel.slug}/book`}
                isPreview={true}
              />
            </ScaledLiveViewport>

            {/* Bottom Sticky Action */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-[11px] min-w-0">
                {hasUnsavedChanges ? (
                  <span className="text-blue-700 font-semibold">
                    กำลังดูตัวอย่าง <strong>{selectedTemplate.nameTh}</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Layout นี้กำลังแสดงผลบนเว็บไซต์จริง
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleApplyTheme}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer disabled:opacity-60"
                style={{
                  backgroundColor: hasUnsavedChanges ? '#2563eb' : '#059669',
                  color: '#ffffff',
                }}
              >
                {isSaving ? 'กำลังบันทึก...' : 'ใช้ Layout นี้'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN INTERACTIVE PREVIEW MODAL */}
      {fullScreenPreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                สลับดู Layout:
              </span>
              <select
                value={selectedTemplate.id}
                onChange={(e) => {
                  const found = HOTEL_WEBSITE_TEMPLATES.find((t) => t.id === e.target.value);
                  if (found) handleSelectTemplate(found);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 cursor-pointer"
              >
                {HOTEL_WEBSITE_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.nameTh} — [{tpl.layoutBadge}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('desktop')}
                  className="px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                  className="px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกใช้งาน Layout นี้'}</span>
              </button>

              <button
                type="button"
                onClick={() => setFullScreenPreview(false)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="ปิดตัวอย่างเต็มจอ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-900/50 p-4 md:p-8">
            <div
              className={`mx-auto rounded-2xl overflow-hidden shadow-2xl ${
                viewMode === 'mobile' ? 'max-w-[390px]' : 'max-w-7xl'
              }`}
            >
              <HotelTemplateHome
                hotel={previewHotel}
                themeOverride={theme}
                templateOverride={selectedTemplate}
                slides={slides}
                sections={sections}
                rooms={previewRooms}
                promotions={promotions}
                gallery={previewGallery}
                bookingUrl={`/sites/${previewHotel.slug}/book`}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
