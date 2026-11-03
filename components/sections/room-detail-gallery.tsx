'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        setLightboxIdx((prev) => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        setLightboxIdx((prev) => (prev + 1) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, photos.length]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {lightboxOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 z-55 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length);
              }}
              className="absolute left-4 md:left-8 p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10 cursor-pointer"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Image Container */}
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center gap-4 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIdx]}
              alt={`${roomName} Photo ${lightboxIdx + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Caption */}
            <div className="text-center text-white/85 text-xs md:text-sm tracking-wide">
              <span className="text-accent/90 font-bold uppercase tracking-widest text-[10px] mr-2">
                [ROOMS - {roomName}]
              </span>
              <span className="mr-2">
                {roomName} Photo {lightboxIdx + 1}
              </span>
              <span className="text-white/40">
                ({lightboxIdx + 1} of {photos.length})
              </span>
            </div>
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((lightboxIdx + 1) % photos.length);
              }}
              className="absolute right-4 md:right-8 p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10 cursor-pointer"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
