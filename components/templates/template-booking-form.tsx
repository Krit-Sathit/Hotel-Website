'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Tag, ArrowRight, Sparkles } from 'lucide-react';
import type { HotelTheme } from '@/lib/db/mock-data';
import { deriveSurfacePalette, mixHex, withAlpha } from '@/lib/color-utils';

export type BookingFormVariant =
  | 'horizontal'
  | 'floating-glass'
  | 'vertical-card'
  | 'minimal-line'
  | 'dark-command';

interface TemplateBookingFormProps {
  hotelId: string;
  hotelName: string;
  bookingUrl: string;
  theme: HotelTheme;
  variant?: BookingFormVariant;
  isPreview?: boolean;
}

function getButtonRadius(theme: HotelTheme): string {
  if (theme.button_style === 'square') return '0px';
  if (theme.button_style === 'pill') return '9999px';
  return theme.border_radius || '8px';
}

function getFormattedDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function TemplateBookingForm({
  hotelId,
  hotelName,
  bookingUrl,
  theme,
  variant = 'horizontal',
  isPreview = false,
}: TemplateBookingFormProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(getFormattedDate(1));
  const [checkOut, setCheckOut] = useState(getFormattedDate(2));
  const [adults, setAdults] = useState('2');
  const [children] = useState('0');
  const [promoCode, setPromoCode] = useState('');

  const radius = getButtonRadius(theme);
  const palette = deriveSurfacePalette(theme);

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    const next = new Date(`${val}T00:00:00`);
    next.setDate(next.getDate() + 1);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    const d = String(next.getDate()).padStart(2, '0');
    setCheckOut(`${y}-${m}-${d}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;

    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          eventType: 'booking_click',
          pagePath: window.location.pathname,
        }),
      });
    } catch {
      // ignore
    }

    const params = new URLSearchParams();
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('adults', adults);
    params.set('children', children);
    if (promoCode.trim()) params.set('promoCode', promoCode.trim());

    let basePath = '/book';
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/sites/')) {
      const seg = window.location.pathname.split('/')[2];
      if (seg) basePath = `/sites/${seg}/book`;
    } else if (bookingUrl && bookingUrl.startsWith('/')) {
      basePath = bookingUrl;
    }

    router.push(`${basePath}?${params.toString()}`);
  };

  const inputSurfaceBg = palette.bgIsDark
    ? mixHex(palette.cardBg, '#ffffff', 0.06)
    : mixHex(palette.cardBg, palette.primary, 0.035);

  // 1. VERTICAL CARD VARIANT (Used inside Hero Right-Overlay #10, Split Hero #02, Sticky Sidebar #05)
  if (variant === 'vertical-card') {
    const cardRadius = radius === '0px' ? '0px' : '20px';
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full p-5 @3xl:p-6 shadow-2xl border space-y-3.5 text-left"
        style={{
          backgroundColor: palette.cardBg,
          color: palette.text,
          borderColor: palette.cardBorder,
          borderRadius: cardRadius,
        }}
      >
        <div className="space-y-1 border-b pb-3" style={{ borderColor: palette.cardBorder }}>
          <div
            className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5"
            style={{ color: palette.accent }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Official Direct Booking</span>
          </div>
          <h3 className="text-base @3xl:text-lg font-bold tracking-wide" style={{ color: palette.text }}>
            Check Availability
          </h3>
          <p className="text-[11px] truncate" style={{ color: palette.mutedText }}>
            Best Rate Guaranteed at {hotelName}
          </p>
        </div>

        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-2.5">
          <label className="block space-y-1 min-w-0">
            <span
              className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
              style={{ color: palette.mutedText }}
            >
              <Calendar className="w-3 h-3 shrink-0" style={{ color: palette.accent }} />
              Check-In
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full min-w-0 px-2.5 py-2 text-xs font-semibold border rounded-lg outline-none"
              style={{
                backgroundColor: inputSurfaceBg,
                color: palette.text,
                borderColor: palette.cardBorder,
                colorScheme: palette.bgIsDark ? 'dark' : 'light',
              }}
            />
          </label>
          <label className="block space-y-1 min-w-0">
            <span
              className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
              style={{ color: palette.mutedText }}
            >
              <Calendar className="w-3 h-3 shrink-0" style={{ color: palette.accent }} />
              Check-Out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full min-w-0 px-2.5 py-2 text-xs font-semibold border rounded-lg outline-none"
              style={{
                backgroundColor: inputSurfaceBg,
                color: palette.text,
                borderColor: palette.cardBorder,
                colorScheme: palette.bgIsDark ? 'dark' : 'light',
              }}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="block space-y-1 min-w-0">
            <span
              className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
              style={{ color: palette.mutedText }}
            >
              <Users className="w-3 h-3 shrink-0" style={{ color: palette.accent }} />
              Guests
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full min-w-0 px-2.5 py-2 text-xs font-semibold border rounded-lg outline-none"
              style={{
                backgroundColor: inputSurfaceBg,
                color: palette.text,
                borderColor: palette.cardBorder,
              }}
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </label>
          <label className="block space-y-1 min-w-0">
            <span
              className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
              style={{ color: palette.mutedText }}
            >
              <Tag className="w-3 h-3 shrink-0" style={{ color: palette.accent }} />
              Promo Code
            </span>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Optional"
              className="w-full min-w-0 px-2.5 py-2 text-xs font-semibold border rounded-lg outline-none"
              style={{
                backgroundColor: inputSurfaceBg,
                color: palette.text,
                borderColor: palette.cardBorder,
              }}
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-5 text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 cursor-pointer shadow-md"
          style={{
            backgroundColor: palette.primary,
            color: palette.primaryText,
            borderRadius: radius,
          }}
        >
          <span>Search Available Rooms</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </form>
    );
  }

  // 2. COMMAND BAR (Cinema #12 — Dynamically respects user colors!)
  if (variant === 'dark-command') {
    const barBg = palette.bgIsDark ? palette.cardBg : palette.secondary;
    const barText = palette.bgIsDark ? palette.text : palette.secondaryText;
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-auto px-4 @3xl:px-6 py-4 border flex flex-col @3xl:flex-row items-stretch @3xl:items-center justify-between gap-3.5 shadow-2xl"
        style={{
          backgroundColor: barBg,
          borderColor: withAlpha(palette.accent, 0.45),
          borderRadius: radius === '0px' ? '0px' : '14px',
          color: barText,
        }}
      >
        <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-3 gap-3.5 flex-1 min-w-0">
          <label className="block text-left min-w-0">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-1"
              style={{ color: palette.accent }}
            >
              Arrival Date
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full min-w-0 bg-transparent border-b pb-1 text-xs font-semibold outline-none"
              style={{
                color: barText,
                borderColor: withAlpha(barText, 0.25),
                colorScheme: 'dark',
              }}
            />
          </label>
          <label className="block text-left min-w-0">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-1"
              style={{ color: palette.accent }}
            >
              Departure Date
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full min-w-0 bg-transparent border-b pb-1 text-xs font-semibold outline-none"
              style={{
                color: barText,
                borderColor: withAlpha(barText, 0.25),
                colorScheme: 'dark',
              }}
            />
          </label>
          <label className="block text-left @sm:col-span-2 @3xl:col-span-1 min-w-0">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-1"
              style={{ color: palette.accent }}
            >
              Guests
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full min-w-0 border-b pb-1 text-xs font-semibold outline-none"
              style={{
                color: barText,
                backgroundColor: barBg,
                borderColor: withAlpha(barText, 0.25),
              }}
            >
              <option value="1">1 Guest • 1 Suite</option>
              <option value="2">2 Guests • 1 Suite</option>
              <option value="3">3 Guests • 1 Suite</option>
              <option value="4">4 Guests • 2 Suites</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-90"
          style={{
            backgroundColor: palette.accent,
            color: palette.accentText,
            borderRadius: radius,
          }}
        >
          <span>Reserve</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </form>
    );
  }

  // 3. MINIMAL ZEN HAIRLINE STRIP (#06 Zen Frame, #08 Sidebar, #09 Magazine)
  if (variant === 'minimal-line') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full py-4 border-y flex flex-col @3xl:flex-row items-stretch @3xl:items-center justify-between gap-3.5"
        style={{ borderColor: palette.cardBorder, color: palette.text }}
      >
        <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:flex @3xl:flex-wrap items-center gap-3.5 @3xl:gap-6 flex-1 text-left">
          <label className="flex items-center justify-between @3xl:justify-start gap-2 text-xs min-w-0">
            <span
              className="text-[10px] uppercase tracking-[0.18em] font-semibold shrink-0"
              style={{ color: palette.mutedText }}
            >
              Check-In:
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="bg-transparent font-semibold text-xs outline-none border-b pb-0.5 min-w-0"
              style={{
                color: palette.text,
                borderColor: palette.cardBorder,
                colorScheme: palette.bgIsDark ? 'dark' : 'light',
              }}
            />
          </label>
          <label className="flex items-center justify-between @3xl:justify-start gap-2 text-xs min-w-0">
            <span
              className="text-[10px] uppercase tracking-[0.18em] font-semibold shrink-0"
              style={{ color: palette.mutedText }}
            >
              Check-Out:
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent font-semibold text-xs outline-none border-b pb-0.5 min-w-0"
              style={{
                color: palette.text,
                borderColor: palette.cardBorder,
                colorScheme: palette.bgIsDark ? 'dark' : 'light',
              }}
            />
          </label>
          <label className="flex items-center justify-between @3xl:justify-start gap-2 text-xs @sm:col-span-2 @3xl:col-span-1 min-w-0">
            <span
              className="text-[10px] uppercase tracking-[0.18em] font-semibold shrink-0"
              style={{ color: palette.mutedText }}
            >
              Guests:
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="font-semibold text-xs outline-none border-b pb-0.5"
              style={{
                color: palette.text,
                backgroundColor: palette.bg,
                borderColor: palette.cardBorder,
              }}
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 cursor-pointer shrink-0"
          style={{
            backgroundColor: palette.primary,
            color: palette.primaryText,
            borderRadius: radius,
          }}
        >
          <span>Check Dates</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </form>
    );
  }

  // 4. FLOATING GLASS CAPSULE (#03 Floating Glass, #07 Curved Coastal, #11 Arch, #13 Story, #14 Direct, #16 Bento)
  if (variant === 'floating-glass') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-auto p-3.5 @3xl:px-6 @3xl:py-3.5 shadow-2xl border backdrop-blur-xl flex flex-col @3xl:flex-row items-stretch @3xl:items-center justify-between gap-3"
        style={{
          backgroundColor: withAlpha(palette.cardBg, 0.96, 'rgba(255,255,255,0.96)'),
          borderColor: palette.cardBorder,
          borderRadius: radius === '9999px' ? '24px' : '20px',
          color: palette.text,
        }}
      >
        <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-3 gap-2.5 @3xl:gap-3 flex-1 text-left min-w-0">
          <label
            className="px-2.5 py-1.5 @3xl:py-0 rounded-xl @3xl:rounded-none border @3xl:border-0 block min-w-0"
            style={{
              backgroundColor: inputSurfaceBg,
              borderColor: palette.cardBorder,
            }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-widest block"
              style={{ color: palette.accent }}
            >
              Check-In
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full min-w-0 bg-transparent text-xs font-bold outline-none"
              style={{
                color: palette.text,
                colorScheme: palette.bgIsDark ? 'dark' : 'light',
              }}
            />
          </label>
          <label
            className="px-2.5 py-1.5 @3xl:py-0 rounded-xl @3xl:rounded-none border @3xl:border-0 block min-w-0"
            style={{
              backgroundColor: inputSurfaceBg,
              borderColor: palette.cardBorder,
            }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-widest block"
              style={{ color: palette.accent }}
            >
              Check-Out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full min-w-0 bg-transparent text-xs font-bold outline-none"
              style={{
                color: palette.text,
                colorScheme: palette.bgIsDark ? 'dark' : 'light',
              }}
            />
          </label>
          <label
            className="px-2.5 py-1.5 @3xl:py-0 rounded-xl @3xl:rounded-none border @3xl:border-0 block @sm:col-span-2 @3xl:col-span-1 min-w-0"
            style={{
              backgroundColor: inputSurfaceBg,
              borderColor: palette.cardBorder,
            }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-widest block"
              style={{ color: palette.accent }}
            >
              Guests
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full min-w-0 text-xs font-bold outline-none"
              style={{
                color: palette.text,
                backgroundColor: inputSurfaceBg,
              }}
            >
              <option value="1">1 Adult • 1 Room</option>
              <option value="2">2 Adults • 1 Room</option>
              <option value="3">3 Adults • 1 Room</option>
              <option value="4">4 Adults • 2 Rooms</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer transition-opacity hover:opacity-90"
          style={{
            backgroundColor: palette.primary,
            color: palette.primaryText,
            borderRadius: radius,
          }}
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </form>
    );
  }

  // 5. STANDARD HORIZONTAL BAR (#01 Classic, #04 Grand Crest, #15 Triptych)
  return (
    <div
      className="w-full border-b py-3 px-4 @3xl:px-6 shadow-xs"
      style={{
        backgroundColor: palette.cardBg,
        borderColor: palette.cardBorder,
        color: palette.text,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto flex flex-col @3xl:flex-row items-stretch @3xl:items-center justify-between gap-2.5 @3xl:gap-3 text-xs"
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest shrink-0 hidden @5xl:inline truncate max-w-[180px]"
          style={{ color: palette.accent }}
        >
          Book {hotelName}
        </span>

        <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-4 gap-2 flex-1 min-w-0">
          <label
            className="border rounded-lg px-2.5 py-1.5 text-left min-w-0"
            style={{ backgroundColor: inputSurfaceBg, borderColor: palette.cardBorder }}
          >
            <span className="text-[9px] font-bold uppercase block" style={{ color: palette.mutedText }}>
              Check-In
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full min-w-0 bg-transparent text-xs font-bold outline-none"
              style={{ color: palette.text, colorScheme: palette.bgIsDark ? 'dark' : 'light' }}
            />
          </label>
          <label
            className="border rounded-lg px-2.5 py-1.5 text-left min-w-0"
            style={{ backgroundColor: inputSurfaceBg, borderColor: palette.cardBorder }}
          >
            <span className="text-[9px] font-bold uppercase block" style={{ color: palette.mutedText }}>
              Check-Out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full min-w-0 bg-transparent text-xs font-bold outline-none"
              style={{ color: palette.text, colorScheme: palette.bgIsDark ? 'dark' : 'light' }}
            />
          </label>
          <label
            className="border rounded-lg px-2.5 py-1.5 text-left min-w-0"
            style={{ backgroundColor: inputSurfaceBg, borderColor: palette.cardBorder }}
          >
            <span className="text-[9px] font-bold uppercase block" style={{ color: palette.mutedText }}>
              Guests
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full min-w-0 text-xs font-bold outline-none"
              style={{ color: palette.text, backgroundColor: inputSurfaceBg }}
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </label>
          <label
            className="border rounded-lg px-2.5 py-1.5 text-left min-w-0"
            style={{ backgroundColor: inputSurfaceBg, borderColor: palette.cardBorder }}
          >
            <span className="text-[9px] font-bold uppercase block" style={{ color: palette.mutedText }}>
              Promo
            </span>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Code"
              className="w-full min-w-0 bg-transparent text-xs font-bold outline-none"
              style={{ color: palette.text }}
            />
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-90"
          style={{
            backgroundColor: palette.primary,
            color: palette.primaryText,
            borderRadius: radius,
          }}
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </form>
    </div>
  );
}
