import React from 'react';
import Link from 'next/link';
import { Maximize2, Users, BedDouble, ArrowRight } from 'lucide-react';
import { Room } from '@/lib/db/mock-data';

interface RoomsSectionProps {
  rooms: Room[];
}

export default function RoomsSection({ rooms }: RoomsSectionProps) {
  return (
    <section id="rooms" className="w-full py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 px-6">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
            Bespoke Sanctuaries
          </p>
          <h2 className="text-3xl md:text-5xl font-light tracking-wide font-hotel capitalize">
            Our Accommodations
          </h2>
          <div className="w-12 h-[1px] bg-accent/60 mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immerse yourself in complete comfort and luxury crafted down to the finest detail.
          </p>
        </div>

        {/* ROOMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {rooms.map((room) => (
            <div 
              key={room.id} 
              className="bg-white dark:bg-slate-950 rounded-hotel overflow-hidden shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-900 transition-all duration-300 flex flex-col group"
            >
              
              {/* Room Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={room.gallery[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'} 
                  alt={room.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                />
                
                {/* Floating price tag */}
                {room.price && (
                  <div className="absolute top-4 right-4 bg-primary/90 text-white/90 text-[11px] tracking-widest font-semibold uppercase px-4 py-2 backdrop-blur-sm shadow-md rounded-hotel border border-white/10">
                    From ${room.price} / Night
                  </div>
                )}
              </div>

              {/* Room Body Details */}
              <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-6">
                <div className="space-y-3 text-left">
                  <h3 className="text-xl font-semibold tracking-wide text-primary font-hotel">
                    {room.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                {/* Technical Specs Row */}
                <div className="flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-900 py-3 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-medium">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-accent flex-shrink-0" />
                    {room.room_size} m² / {Math.round(room.room_size * 10.764)} sq ft
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-accent flex-shrink-0" />
                    Max {room.max_guests} Guests
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-accent flex-shrink-0" />
                    {room.bed_type}
                  </span>
                </div>

                {/* Footer Buttons Row */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <Link 
                    href={`/rooms/${room.id}`}
                    className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-accent transition-colors flex items-center gap-1 group/btn"
                  >
                    Explore Suite
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <a 
                    href="#booking"
                    className="bg-primary hover:bg-primary/95 text-white font-semibold text-[10px] md:text-xs tracking-[0.15em] uppercase py-3 px-6 rounded-hotel transition-all shadow-sm flex items-center gap-1.5"
                  >
                    Reserve
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
