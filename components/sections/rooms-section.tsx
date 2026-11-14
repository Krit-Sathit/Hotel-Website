'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Maximize2,
  Users,
  BedDouble,
  ArrowRight,
} from 'lucide-react';
import { Room } from '@/lib/db/mock-data';
import { SwipeablePhotoSlider, SwipeableLightbox } from '@/components/ui/swipeable-photo-slider';

interface RoomsSectionProps {
  rooms: Room[];
  tenantPrefix?: string;
  bookingUrl: string;
}

function normalizePhotoUrl(url: string | undefined): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/(www\.)?flowstay\.live\/storage\//i, '/storage/')
    .replace(/^http:\/\/flowstay\.live\//i, 'https://flowstay.live/');
}

export default function RoomsSection({
  rooms,
  tenantPrefix = '',
  bookingUrl,
}: RoomsSectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const openRoomLightbox = (room: Room, startIdx = 0) => {
    const photos = (room.gallery || []).map(normalizePhotoUrl).filter(Boolean);
    if (photos.length === 0) return;
    setLightboxPhotos(photos);
    setLightboxIdx(startIdx);
    setLightboxTitle(room.name);
    setLightboxOpen(true);
  };

  return (
    <section id="rooms" className="w-full py-20 md:py-28 bg-white text-slate-800 px-6">
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
          {rooms.map((room) => {
            const photos = (room.gallery || []).map(normalizePhotoUrl).filter(Boolean);
            const coverImg =
              photos[0] ||
              'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={room.id}
                className="bg-white dark:bg-slate-950 rounded-hotel overflow-hidden shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-900 transition-all duration-300 flex flex-col group"
              >
                {/* Room Image Container (Swipeable with finger on mobile + Tap to open Lightbox) */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                  <SwipeablePhotoSlider
                    photos={photos.length > 0 ? photos : [coverImg]}
                    alt={room.name}
                    className="w-full h-full"
                    arrowsMode="desktop-hover"
                    showCounter={photos.length > 1}
                    counterPositionClass="top-3 right-3"
                    onTapPhoto={(idx) => openRoomLightbox(room, idx)}
                  />
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

                  {/* Footer Price + Buttons Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div>
                      {(room.price ?? 0) > 0 ? (
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                              Lowest Direct Rate
                            </span>
                            {room.discount_pct && room.discount_pct > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold">
                                -{room.discount_pct}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            {room.original_price && room.original_price > (room.price ?? 0) && (
                              <span className="text-xs text-slate-400 line-through">
                                ฿{room.original_price.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xl font-bold text-primary">
                              ฿{Number(room.price ?? 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400">/ night</span>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={`${tenantPrefix}/rooms/${room.id}`}
                          className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-accent transition-colors flex items-center gap-1 group/btn"
                        >
                          Explore Suite
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {(room.price ?? 0) > 0 && (
                        <Link
                          href={`${tenantPrefix}/rooms/${room.id}`}
                          className="text-[11px] font-bold tracking-wider uppercase text-slate-500 hover:text-accent transition-colors"
                        >
                          Details
                        </Link>
                      )}
                      <Link
                        href={`${bookingUrl}${bookingUrl.includes('?') ? '&' : '?'}roomTypeId=${encodeURIComponent(room.id)}`}
                        className="bg-primary hover:bg-primary/95 text-white font-semibold text-[10px] md:text-xs tracking-[0.15em] uppercase py-3 px-6 rounded-hotel transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                      >
                        Reserve
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SWIPEABLE ROOM PHOTOS LIGHTBOX MODAL */}
      <SwipeableLightbox
        open={lightboxOpen}
        photos={lightboxPhotos}
        index={lightboxIdx}
        title={lightboxTitle}
        onIndexChange={setLightboxIdx}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}
