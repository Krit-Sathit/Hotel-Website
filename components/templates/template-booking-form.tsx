'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Tag, ArrowRight, Sparkles } from 'lucide-react';
import type { HotelTheme } from '@/lib/db/mock-data';

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
  const [children, setChildren] = useState('0');
  const [promoCode, setPromoCode] = useState('');

  const radius = getButtonRadius(theme);

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

  // 1. VERTICAL CARD VARIANT (Used inside Hero Right-Overlay #10, Split Hero #02, Sticky Sidebar #05 & #14)
  if (variant === 'vertical-card') {
    const cardRadius = radius === '0px' ? '0px' : '20px';
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full p-6 shadow-2xl border space-y-4 text-left"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderColor: '#e2e8f0',
          borderRadius: cardRadius,
        }}
      >
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.22em] flex items-center gap-1.5"
            style={{ color: theme.accent_color }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Official Direct Booking
          </div>
          <h3
            className="text-lg font-bold tracking-wide"
            style={{ color: theme.primary_color }}
          >
            Check Availability
          </h3>
          <p className="text-[11px] text-slate-500">
            Best Rate Guaranteed at {hotelName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" style={{ color: theme.accent_color }} />
              Check-In
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-900 outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" style={{ color: theme.accent_color }} />
              Check-Out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-900 outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3" style={{ color: theme.accent_color }} />
              Guests
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-900 outline-none"
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Tag className="w-3 h-3" style={{ color: theme.accent_color }} />
              Promo Code
            </span>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-900 outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-5 text-xs font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 cursor-pointer shadow-md"
          style={{
            backgroundColor: theme.primary_color,
            color: '#ffffff',
            borderRadius: radius,
          }}
        >
          <span>Search Available Rooms</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    );
  }

  // 2. DARK COMMAND BAR (Cinema Noir #12)
  if (variant === 'dark-command') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-auto px-5 py-4 border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-2xl"
        style={{
          backgroundColor: '#111827',
          borderColor: `${theme.accent_color}50`,
          borderRadius: radius === '0px' ? '0px' : '12px',
          color: '#f8fafc',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          <label className="block text-left">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-1"
              style={{ color: theme.accent_color }}
            >
              Arrival Date
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-1 text-xs font-semibold outline-none"
              style={{ color: '#ffffff', backgroundColor: 'transparent' }}
            />
          </label>
          <label className="block text-left">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-1"
              style={{ color: theme.accent_color }}
            >
              Departure Date
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-1 text-xs font-semibold outline-none"
              style={{ color: '#ffffff', backgroundColor: 'transparent' }}
            />
          </label>
          <label className="block text-left col-span-2 md:col-span-1">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-1"
              style={{ color: theme.accent_color }}
            >
              Guests
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-1 text-xs font-semibold outline-none"
              style={{ color: '#ffffff', backgroundColor: '#111827' }}
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
          className="px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-90"
          style={{
            backgroundColor: theme.accent_color,
            color: '#090d16',
            borderRadius: radius,
          }}
        >
          <span>Reserve</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }

  // 3. MINIMAL ZEN HAIRLINE STRIP (#06 Zen Frame & #09 Magazine)
  if (variant === 'minimal-line') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full py-4 border-y flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        style={{ borderColor: `${theme.primary_color}22` }}
      >
        <div className="flex flex-wrap items-center gap-6 flex-1 text-left">
          <label className="flex items-center gap-2 text-xs">
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-semibold">
              Check-In:
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="bg-transparent font-semibold text-xs outline-none border-b border-slate-300 pb-0.5"
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-semibold">
              Check-Out:
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent font-semibold text-xs outline-none border-b border-slate-300 pb-0.5"
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-semibold">
              Guests:
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="bg-transparent font-semibold text-xs outline-none border-b border-slate-300 pb-0.5"
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
          className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer"
          style={{
            backgroundColor: theme.primary_color,
            color: '#ffffff',
            borderRadius: radius,
          }}
        >
          <span>Check Dates</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }

  // 4. FLOATING GLASS CAPSULE (#03 Floating Glass, #07 Curved Coastal, #13 Story Sanctuary)
  if (variant === 'floating-glass') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-auto p-3 md:px-6 md:py-3.5 shadow-2xl border backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(226, 232, 240, 0.9)',
          borderRadius: radius === '9999px' ? '9999px' : '20px',
          color: '#0f172a',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 md:divide-x md:divide-slate-200 text-left">
          <label className="px-2 block">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
              Check-In
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
          </label>
          <label className="px-2 md:pl-4 block">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
              Check-Out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
          </label>
          <label className="px-2 md:pl-4 block col-span-2 md:col-span-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
              Guests
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
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
          className="px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
          style={{
            backgroundColor: theme.primary_color,
            color: '#ffffff',
            borderRadius: radius,
          }}
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }

  // 5. STANDARD HORIZONTAL BAR
  return (
    <div
      className="w-full border-b py-3 px-6 shadow-xs"
      style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 shrink-0 hidden lg:inline">
          Book {hotelName}
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 flex-1">
          <label className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-left">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Check-In</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
          </label>
          <label className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-left">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Check-Out</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
          </label>
          <label className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-left">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Guests</span>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </label>
          <label className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-left">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Promo</span>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Code"
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          style={{
            backgroundColor: theme.primary_color,
            color: '#ffffff',
            borderRadius: radius,
          }}
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
