'use client';

import React, { useState } from 'react';
import { Calendar, Users, Home, Tag, ArrowRight } from 'lucide-react';

interface BookingWidgetProps {
  hotelId: string;
  hotelName: string;
  variant?: 'inline' | 'sticky-header' | 'sticky-bottom';
}

export default function BookingWidget({ hotelId, hotelName, variant = 'inline' }: BookingWidgetProps) {
  // Initialize dates: tomorrow and day after tomorrow
  const getFormattedDate = (daysAhead = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getFormattedDate(1));
  const [checkOut, setCheckOut] = useState(getFormattedDate(2));
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [rooms, setRooms] = useState('1');
  const [promoCode, setPromoCode] = useState('');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const handleBookNow = (e: React.FormEvent) => {
    e.preventDefault();

    // Log a booking click event locally for our CMS analytics before redirecting
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
    } catch (err) {
      console.error('Failed to log analytics event:', err);
    }

    // Construct FlowStay Booking Engine URL
    const baseUrl = 'https://booking.flowstay.com/';
    const params = new URLSearchParams({
      hotel_id: hotelId,
      checkin: checkIn,
      checkout: checkOut,
      adults,
      children,
      rooms,
    });
    if (promoCode.trim()) {
      params.append('promo', promoCode.trim());
    }

    // Open booking engine in a new tab
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
    setIsMobileModalOpen(false);
  };

  // ---------------------------------------------------------------------------
  // 1. STICKY HEADER VARIANT (Desktop horizontal strip)
  // ---------------------------------------------------------------------------
  if (variant === 'sticky-header') {
    return (
      <div className="hidden lg:block w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 py-3 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <form onSubmit={handleBookNow} className="flex items-center justify-between gap-4 text-xs">
            {/* Logo/Name indicator */}
            <div className="flex-shrink-0 mr-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 tracking-wider uppercase text-[10px]">
                Book {hotelName}
              </span>
            </div>

            {/* Check-In */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-2 py-1.5 flex-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-medium uppercase">Check In</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={getFormattedDate(0)}
                  className="bg-transparent border-none outline-none font-medium text-slate-700 dark:text-slate-300 w-24 [color-scheme:light]"
                  required
                />
              </div>
            </div>

            {/* Check-Out */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-2 py-1.5 flex-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-medium uppercase">Check Out</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || getFormattedDate(1)}
                  className="bg-transparent border-none outline-none font-medium text-slate-700 dark:text-slate-300 w-24 [color-scheme:light]"
                  required
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-2 py-1.5">
              <Users className="w-3.5 h-3.5 text-accent" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-medium uppercase">Guests</span>
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <select value={adults} onChange={(e) => setAdults(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer">
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Ad</option>)}
                  </select>
                  <span className="text-slate-300">/</span>
                  <select value={children} onChange={(e) => setChildren(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer">
                    {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Ch</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-2 py-1.5">
              <Home className="w-3.5 h-3.5 text-accent" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-medium uppercase">Rooms</span>
                <select value={rooms} onChange={(e) => setRooms(e.target.value)} className="bg-transparent border-none outline-none font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Rm</option>)}
                </select>
              </div>
            </div>

            {/* Promo Code */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-2 py-1.5 w-24">
              <Tag className="w-3.5 h-3.5 text-accent" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-medium uppercase">Promo</span>
                <input
                  type="text"
                  placeholder="CODE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-transparent border-none outline-none font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400 w-full uppercase"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-primary text-white hover:opacity-90 transition-opacity font-medium px-5 py-2.5 rounded-hotel tracking-wider uppercase text-[10px] flex items-center gap-1.5 shadow-sm"
            >
              Book Now
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. STICKY BOTTOM VARIANT (Mobile floating quick bar)
  // ---------------------------------------------------------------------------
  if (variant === 'sticky-bottom') {
    return (
      <>
        {/* Floating trigger bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">FlowStay Booking</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Guaranteed Best Rates</p>
          </div>
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="bg-primary text-white font-semibold text-xs px-6 py-3 rounded-hotel uppercase tracking-wider shadow-sm flex items-center gap-2"
          >
            Check Availability
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Full-screen Mobile Booking Sheet */}
        {isMobileModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Book Your Stay</h3>
                  <p className="text-xs text-slate-500">{hotelName}</p>
                </div>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium px-2 py-1"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleBookNow} className="space-y-4">
                {/* Check In & Out */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col text-left bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded p-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1">Check In</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={getFormattedDate(0)}
                      className="bg-transparent border-none outline-none font-semibold text-slate-800 dark:text-slate-200 w-full text-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-col text-left bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded p-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1">Check Out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || getFormattedDate(1)}
                      className="bg-transparent border-none outline-none font-semibold text-slate-800 dark:text-slate-200 w-full text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col text-left bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded p-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1">Adults</label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className="bg-transparent border-none outline-none font-semibold text-slate-850 dark:text-slate-150 text-sm cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Adults</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col text-left bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded p-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1">Children</label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      className="bg-transparent border-none outline-none font-semibold text-slate-850 dark:text-slate-150 text-sm cursor-pointer"
                    >
                      {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Children</option>)}
                    </select>
                  </div>
                </div>

                {/* Rooms & Promo */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col text-left bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded p-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1">Rooms</label>
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="bg-transparent border-none outline-none font-semibold text-slate-850 dark:text-slate-150 text-sm cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Room{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col text-left bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded p-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1">Promo Code</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-transparent border-none outline-none font-semibold text-slate-800 dark:text-slate-200 text-sm w-full uppercase"
                    />
                  </div>
                </div>

                {/* Book Button */}
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-4 rounded-hotel uppercase tracking-widest text-xs mt-4 shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Book Stay Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. INLINE VARIANT (Default: spacious card for hero/homepage/pages)
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full bg-white dark:bg-slate-950 rounded-hotel shadow-xl border border-slate-100 dark:border-slate-900 p-6 lg:p-8 transition-all duration-300">
      <form onSubmit={handleBookNow} className="space-y-6">
        <div className="text-center lg:text-left border-b border-slate-100 dark:border-slate-900 pb-4">
          <h3 className="text-lg font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-hotel">
            Book Your Experience
          </h3>
          <p className="text-xs text-slate-400">Integrated with FlowStay™ Booking Engine</p>
        </div>

        {/* Date Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check In */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded px-4 py-3 focus-within:border-accent transition-colors">
            <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex flex-col text-left flex-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Check-In Date</span>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={getFormattedDate(0)}
                className="bg-transparent border-none outline-none font-semibold text-slate-750 dark:text-slate-200 w-full text-sm [color-scheme:light]"
                required
              />
            </div>
          </div>

          {/* Check Out */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded px-4 py-3 focus-within:border-accent transition-colors">
            <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex flex-col text-left flex-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Check-Out Date</span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || getFormattedDate(1)}
                className="bg-transparent border-none outline-none font-semibold text-slate-750 dark:text-slate-200 w-full text-sm [color-scheme:light]"
                required
              />
            </div>
          </div>
        </div>

        {/* Guest and Room Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Adults */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded px-4 py-3">
            <Users className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex flex-col text-left flex-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Adults</span>
              <select
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-slate-750 dark:text-slate-200 w-full text-sm cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Adult{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded px-4 py-3">
            <Users className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex flex-col text-left flex-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Children</span>
              <select
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-slate-750 dark:text-slate-200 w-full text-sm cursor-pointer"
              >
                {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Child{n !== 1 ? 'ren' : ''}</option>)}
              </select>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded px-4 py-3">
            <Home className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex flex-col text-left flex-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Rooms</span>
              <select
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-slate-750 dark:text-slate-200 w-full text-sm cursor-pointer"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n} Room{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Promo Code & Submit Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Promo Code */}
          <div className="md:col-span-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded px-4 py-3 focus-within:border-accent transition-colors">
            <Tag className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex flex-col text-left flex-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Promo Code</span>
              <input
                type="text"
                placeholder="Optional"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-slate-750 dark:text-slate-200 w-full text-sm placeholder-slate-400 uppercase"
              />
            </div>
          </div>

          {/* Book Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-primary text-white hover:opacity-95 transition-opacity font-semibold py-4 px-6 rounded-hotel uppercase tracking-widest text-xs shadow-md flex items-center justify-center gap-2.5 active:scale-[0.99] transition-transform"
            >
              Book My Stay
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
