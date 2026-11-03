'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Maximize2,
  Users,
  BedDouble,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Room } from '@/lib/db/mock-data';

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

  const openRoomLightbox = (room: Room) => {
    const photos = (room.gallery || []).map(normalizePhotoUrl).filter(Boolean);
    if (photos.length === 0) return;
    setLightboxPhotos(photos);
    setLightboxIdx(0);
    setLightboxTitle(room.name);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft' && lightboxPhotos.length > 1) {
        setLightboxIdx((prev) => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length);
      } else if (e.key === 'ArrowRight' && lightboxPhotos.length > 1) {
        setLightboxIdx((prev) => (prev + 1) % lightboxPhotos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxPhotos.length]);

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
                {/* Room Image Container (Clickable to open Lightbox) */}
                <div
                  onClick={() => openRoomLightbox(room)}
                  className="relative aspect-[16/10] overflow-hidden bg-slate-200 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImg}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                  />

                  {photos.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/85 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm transition-colors">
                      {photos.length} photos
                    </span>
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
                      href={`${tenantPrefix}/rooms/${room.id}`}
                      className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-accent transition-colors flex items-center gap-1 group/btn"
                    >
                      Explore Suite
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href={bookingUrl}
                      className="bg-primary hover:bg-primary/95 text-white font-semibold text-[10px] md:text-xs tracking-[0.15em] uppercase py-3 px-6 rounded-hotel transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Reserve
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROOM PHOTOS LIGHTBOX MODAL */}
      {lightboxOpen && lightboxPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white mb-3">
              <div className="text-sm font-medium">
                {lightboxTitle} ({lightboxIdx + 1} / {lightboxPhotos.length})
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative w-full aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxPhotos[lightboxIdx]}
                alt={`${lightboxTitle} photo ${lightboxIdx + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {lightboxPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIdx(
                        (lightboxIdx - 1 + lightboxPhotos.length) % lightboxPhotos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIdx((lightboxIdx + 1) % lightboxPhotos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {lightboxPhotos.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto max-w-full py-1 px-1">
                {lightboxPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIdx(idx)}
                    className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === lightboxIdx
                        ? 'border-white opacity-100 scale-105'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`${lightboxTitle} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
