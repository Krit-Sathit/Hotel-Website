'use client';

import React, { useState } from 'react';
import { SwipeablePhotoSlider, SwipeableLightbox } from '@/components/ui/swipeable-photo-slider';

interface RoomDetailGalleryProps {
  gallery: string[];
  roomName: string;
}

function normalizePhotoUrl(url: string | undefined): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/(www\.)?flowstay\.live\/storage\//i, '/storage/')
    .replace(/^http:\/\/flowstay\.live\//i, 'https://flowstay.live/');
}

export default function RoomDetailGallery({ gallery, roomName }: RoomDetailGalleryProps) {
  const photos = (gallery || []).map(normalizePhotoUrl).filter(Boolean);
  const [mobileIdx, setMobileIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  if (photos.length === 0) return null;

  return (
    <>
      {/* MOBILE (< md): Finger-Swipeable Slider + Touch-Scrollable Thumbnail Strip */}
      <div className="md:hidden space-y-2.5">
        <div className="aspect-[4/3] rounded-hotel overflow-hidden shadow-sm bg-slate-200 border border-slate-200/20">
          <SwipeablePhotoSlider
            photos={photos}
            alt={roomName}
            className="w-full h-full"
            controlledIndex={mobileIdx}
            onIndexChange={setMobileIdx}
            arrowsMode="none"
            showCounter={photos.length > 1}
            counterPositionClass="top-3 right-3"
            onTapPhoto={(idx) => {
              setLightboxIdx(idx);
              setLightboxOpen(true);
            }}
          />
        </div>

        {photos.length > 1 && (
          <div
            className="flex items-center gap-2 overflow-x-auto py-1"
            style={{ touchAction: 'pan-x', scrollbarWidth: 'none' }}
          >
            {photos.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMobileIdx(idx)}
                className={`w-16 h-12 rounded-md overflow-hidden shrink-0 cursor-pointer transition-all ${
                  idx === mobileIdx ? 'ring-2 ring-primary opacity-100' : 'opacity-55'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP (md+): Editorial Multi-Photo Grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        {photos.map((img, index) => (
          <div
            key={index}
            onClick={() => {
              setLightboxIdx(index);
              setLightboxOpen(true);
            }}
            className={`relative rounded-hotel overflow-hidden shadow-sm bg-slate-200 border border-slate-200/20 cursor-pointer group ${
              index === 0 && photos.length % 2 !== 0
                ? 'md:col-span-2 aspect-[21/9]'
                : 'aspect-[4/3]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={`${roomName} gallery ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {index === 0 && photos.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
                {photos.length} photos
              </span>
            )}
          </div>
        ))}
      </div>

      {/* SWIPEABLE LIGHTBOX */}
      <SwipeableLightbox
        open={lightboxOpen}
        photos={photos}
        index={lightboxIdx}
        title={roomName}
        onIndexChange={setLightboxIdx}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
