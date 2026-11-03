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
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white mb-3">
              <div className="text-sm font-medium">
                {roomName} ({lightboxIdx + 1} / {photos.length})
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
                src={photos[lightboxIdx]}
                alt={`${roomName} photo ${lightboxIdx + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIdx((lightboxIdx + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto max-w-full py-1 px-1">
                {photos.map((photo, idx) => (
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
                      alt={`${roomName} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
