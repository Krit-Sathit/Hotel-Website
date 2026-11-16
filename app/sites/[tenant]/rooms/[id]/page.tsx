import React from 'react';
import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';

import Link from 'next/link';
import { ChevronLeft, Maximize2, Users, BedDouble, Check, ArrowRight } from 'lucide-react';
import { getHotelBySlug, getRooms, getRoomById } from '@/lib/db/mock-data';
import BookingWidget from '@/components/booking-widget';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import RoomDetailGallery from '@/components/sections/room-detail-gallery';
import { getBookingEngineUrl, resolveTenantPrefix } from '@/lib/booking-engine';
import {
  HOTEL_LOCALE_COOKIE,
  parseHotelLocale,
  localizeHotel,
  localizeRooms,
  getHotelUiText,
} from '@/lib/i18n/hotel-locale';

interface RoomDetailPageProps {
  params: Promise<{ tenant: string; id: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { tenant, id } = await params;
  const [rawHotel, headerList, cookieStore] = await Promise.all([
    getHotelBySlug(tenant),
    headers(),
    cookies(),
  ]);

  if (!rawHotel || rawHotel.status !== 'active') {
    notFound();
  }

  const locale = parseHotelLocale(cookieStore.get(HOTEL_LOCALE_COOKIE)?.value);
  const hotel = localizeHotel(rawHotel, locale);
  const ui = getHotelUiText(locale);

  const hotelRooms = localizeRooms(await getRooms(hotel.id), locale);
  const fallbackRoom = hotelRooms.length === 0 ? await getRoomById(id) : null;
  const room =
    hotelRooms.find((r) => String(r.id) === String(id)) ||
    (fallbackRoom ? localizeRooms([fallbackRoom], locale)[0] : null);
  if (!room) {
    notFound();
  }

  // Compute tenantPrefix for internal navigation links
  const rawHost = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const tenantPrefix = resolveTenantPrefix(rawHost, tenant);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200 py-12 px-6">
      <PageViewTracker hotelId={hotel.id} pagePath={`/rooms/${id}`} roomId={id} />
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* BACK TO LIST & BREADCRUMB */}
        <div className="text-left">
          <Link 
            href={`${tenantPrefix}/rooms`} 
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {ui.sections.backToRooms}
          </Link>
        </div>

        {/* ROOM DETAILS MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start">
          
          {/* LEFT COLUMN: IMAGES & AMENITIES (8 cols) */}
          <div className="lg:col-span-8 space-y-8 text-left">
            
            {/* Main Room Info */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-light tracking-wide text-primary font-hotel capitalize">
                {room.name}
              </h1>
              <div className="w-16 h-[1px] bg-accent/60" />
            </div>

            {/* Room Image Gallery Grid */}
            <RoomDetailGallery gallery={room.gallery} roomName={room.name} />

            {/* Room Description */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold tracking-widest uppercase text-primary/80 font-sans">
                {ui.sections.theExperience}
              </h3>
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400">
                {room.description}
              </p>
            </div>

            {/* Technical Specs Summary */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-200/50 dark:border-slate-800/60 py-5 text-center text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-medium">
              <div className="flex flex-col items-center gap-1">
                <Maximize2 className="w-5 h-5 text-accent" />
                <span className="font-bold text-primary mt-1">{room.room_size} m²</span>
                <span className="text-[9px] text-slate-450">{ui.sections.roomSize}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-bold text-primary mt-1">{ui.sections.upToGuests(room.max_guests)}</span>
                <span className="text-[9px] text-slate-450">{ui.sections.capacity}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <BedDouble className="w-5 h-5 text-accent" />
                <span className="font-bold text-primary mt-1">{room.bed_type}</span>
                <span className="text-[9px] text-slate-450">{ui.sections.beddingConfig}</span>
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-widest uppercase text-primary/80 font-sans">
                {ui.sections.premiumAmenities}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <div className="p-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: BOOKING WIDGET & INQUIRY (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            
            {/* Inline Booking Card */}
            <BookingWidget 
              hotelId={hotel.id} 
              hotelName={hotel.name} 
              bookingUrl={getBookingEngineUrl(hotel.slug, tenantPrefix)}
              variant="inline" 
            />

            {/* Standard Help Prompt */}
            <div className="p-6 bg-white dark:bg-slate-950 rounded-hotel border border-slate-150/40 dark:border-slate-900 text-left space-y-3 shadow-sm">
              <h4 className="text-xs font-bold tracking-widest uppercase text-primary font-sans">
                {locale === 'th' ? 'ต้องการความช่วยเหลือ?' : 'Need Assistance?'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-405 leading-relaxed">
                {locale === 'th'
                  ? 'ทีมงานของโรงแรมพร้อมดูแลและให้ข้อมูลเพิ่มเติมเกี่ยวกับการสำรองห้องพักและคำขอพิเศษตลอดเวลาครับ'
                  : 'Our reservation specialists are available to assist with group stays, transfers, or special requests.'}
              </p>
              <Link 
                href={`${tenantPrefix}/contact`} 
                className="text-[10px] font-bold text-accent tracking-widest uppercase hover:underline flex items-center gap-1"
              >
                {ui.nav.contact}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
