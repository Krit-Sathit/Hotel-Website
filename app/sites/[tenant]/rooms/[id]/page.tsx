import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Maximize2, Users, BedDouble, Check, ArrowRight } from 'lucide-react';
import { getHotelBySlug, getRoomById, trackAnalyticsEvent } from '@/lib/db/mock-data';
import BookingWidget from '@/components/booking-widget';

interface RoomDetailPageProps {
  params: Promise<{ tenant: string; id: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { tenant, id } = await params;
  const hotel = await getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const room = await getRoomById(id);
  if (!room || room.hotel_id !== hotel.id) {
    notFound();
  }

  // Track room-specific page view analytics on the server
  await trackAnalyticsEvent(hotel.id, 'page_view', `/rooms/${id}`, id);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* BACK TO LIST & BREADCRUMB */}
        <div className="text-left">
          <Link 
            href="/rooms" 
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Accommodations
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
              {room.price && (
                <p className="text-sm tracking-widest font-semibold uppercase text-accent">
                  From ${room.price} / Night
                </p>
              )}
              <div className="w-16 h-[1px] bg-accent/60" />
            </div>

            {/* Room Image Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {room.gallery.map((img, index) => (
                <div 
                  key={index} 
                  className={`relative rounded-hotel overflow-hidden shadow-sm bg-slate-200 border border-slate-200/20 ${
                    index === 0 && room.gallery.length % 2 !== 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img} 
                    alt={`${room.name} gallery ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>

            {/* Room Description */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold tracking-widest uppercase text-primary/80 font-sans">
                The Experience
              </h3>
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400">
                {room.description}
              </p>
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400">
                Designed for absolute serenity, our suites offer a seamless blend of luxury aesthetics and modern performance. Features include custom designer furnishings, ambient acoustic panels, premium climate control systems, and a fully stocked wellness bar.
              </p>
            </div>

            {/* Technical Specs Summary */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-200/50 dark:border-slate-800/60 py-5 text-center text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-medium">
              <div className="flex flex-col items-center gap-1">
                <Maximize2 className="w-5 h-5 text-accent" />
                <span className="font-bold text-primary mt-1">{room.room_size} m²</span>
                <span className="text-[9px] text-slate-450">Room Size</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-bold text-primary mt-1">Up to {room.max_guests} Guests</span>
                <span className="text-[9px] text-slate-450">Capacity</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <BedDouble className="w-5 h-5 text-accent" />
                <span className="font-bold text-primary mt-1">{room.bed_type}</span>
                <span className="text-[9px] text-slate-450">Bedding Config</span>
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-widest uppercase text-primary/80 font-sans">
                Premium Amenities
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
              variant="inline" 
            />

            {/* Standard Help Prompt */}
            <div className="p-6 bg-white dark:bg-slate-950 rounded-hotel border border-slate-150/40 dark:border-slate-900 text-left space-y-3 shadow-sm">
              <h4 className="text-xs font-bold tracking-widest uppercase text-primary font-sans">Need Assistance?</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-405 leading-relaxed">
                Our reservation specialists are available 24 hours a day to assist with custom packages, private transfers, or special requests.
              </p>
              <a 
                href="/contact" 
                className="text-[10px] font-bold text-accent tracking-widest uppercase hover:underline flex items-center gap-1"
              >
                Contact Concierge
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
