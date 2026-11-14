'use client';

import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { GalleryPhoto } from '@/lib/db/mock-data';
import { SwipeablePhotoSlider, SwipeableLightbox } from '@/components/ui/swipeable-photo-slider';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  limit?: number;
  showFilters?: boolean;
  rooms?: any[];
}

export default function GallerySection({ photos, limit, showFilters = true, rooms = [] }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [mobileSliderIdx, setMobileSliderIdx] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Helper to determine if alt text is a user-entered description vs auto-generated filename / machine ID
  const isValidAltText = (text?: string): boolean => {
    if (!text) return false;
    const trimmed = text.trim();
    if (!trimmed) return false;

    // Never show anything that has file extensions
    if (/\.(webp|jpg|jpeg|png|gif|avif|svg)$/i.test(trimmed) || /\.(webp|jpg|jpeg|png|gif|avif|svg)/i.test(trimmed)) {
      return false;
    }

    // Never show anything with underscores (typical in filenames like file_..., img_..., my_photo)
    if (trimmed.includes('_')) {
      return false;
    }

    const lower = trimmed.toLowerCase();

    // Never show common machine/file prefixes
    if (
      lower.startsWith('file') ||
      lower.startsWith('img') ||
      lower.startsWith('dsc') ||
      lower.startsWith('image') ||
      lower.startsWith('upload') ||
      lower.startsWith('photo') ||
      lower.startsWith('pic') ||
      lower.startsWith('asset') ||
      lower.startsWith('media') ||
      lower.startsWith('attachment') ||
      lower.startsWith('screenshot') ||
      lower.startsWith('sam_') ||
      lower.startsWith('wp-')
    ) {
      return false;
    }

    // Never show generic placeholder alt texts
    if (
      lower === 'resort photo' ||
      lower === 'resort custom upload asset' ||
      lower === 'hotel photo' ||
      lower === 'gallery photo' ||
      lower === 'photo' ||
      lower === 'image'
    ) {
      return false;
    }

    // Never show purely numeric timestamps/IDs (e.g. 1784209896326)
    if (/^\d+$/.test(trimmed)) {
      return false;
    }

    // Never show hex/UUID/hash patterns (e.g. 000000008d9881fbb617abca009d37dc or 550e8400-e29b-41d4-a716-446655440000)
    if (/^[0-9a-f-]{8,}$/i.test(trimmed)) {
      return false;
    }

    // If it has no spaces and no Thai characters and length > 12, it's almost certainly a code/slug/filename
    const hasThai = /[\u0E00-\u0E7F]/.test(trimmed);
    if (!trimmed.includes(' ') && !hasThai && trimmed.length > 12) {
      return false;
    }

    // If it's a kebab-case slug like "deluxe-room-with-balcony-view" without spaces
    if (trimmed.includes('-') && !trimmed.includes(' ') && !hasThai) {
      return false;
    }

    return true;
  };

  // Helper to find if an image is associated with a specific room type
  const getPhotoRoomTypeName = (imageUrl: string): string | null => {
    if (!rooms || rooms.length === 0) return null;
    const matchingRoom = rooms.find(room => {
      if (!room.gallery || !Array.isArray(room.gallery)) return false;
      return room.gallery.some((url: string) => {
        if (!url || !imageUrl) return false;
        const cleanUrl = (u: string) => {
          try {
            const parsed = new URL(u);
            return parsed.pathname;
          } catch {
            return u;
          }
        };
        const pathA = cleanUrl(url);
        const pathB = cleanUrl(imageUrl);
        if (pathA === pathB) return true;
        const fileA = pathA.substring(pathA.lastIndexOf('/') + 1);
        const fileB = pathB.substring(pathB.lastIndexOf('/') + 1);
        return fileA && fileB && fileA === fileB;
      });
    });
    return matchingRoom ? matchingRoom.name : null;
  };

  // Extract unique categories from photos
  const categories = ['All', ...Array.from(new Set(photos.map(p => p.category)))];

  // Filter photos based on active category
  const filteredPhotos = activeCategory === 'All' 
    ? photos 
    : photos.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  // Apply a rendering limit if specified
  const displayedPhotos = limit ? filteredPhotos.slice(0, limit) : filteredPhotos;

  const openLightbox = (photoId: string) => {
    // Find index of the clicked photo within the CURRENT FILTERED list
    const index = filteredPhotos.findIndex(p => p.id === photoId);
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    const isLast = lightboxIndex === filteredPhotos.length - 1;
    setLightboxIndex(isLast ? 0 : lightboxIndex + 1);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    const isFirst = lightboxIndex === 0;
    setLightboxIndex(isFirst ? filteredPhotos.length - 1 : lightboxIndex - 1);
  };

  return (
    <section id="gallery" className="w-full py-20 md:py-28 bg-hotel-bg text-hotel-text px-6">
      <div className="max-w-7xl mx-auto space-y-10 md:space-y-12">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
            Visual Journeys
          </p>
          <h2 className="text-3xl md:text-5xl font-light tracking-wide font-hotel capitalize">
            Our Gallery
          </h2>
          <div className="w-12 h-[1px] bg-accent/60 mx-auto" />
        </div>

        {/* CATEGORY FILTERS */}
        {showFilters && categories.length > 2 && (
          <div className="flex flex-wrap justify-center items-center gap-2.5 md:gap-4 text-[10px] md:text-xs font-bold tracking-widest uppercase">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-hotel transition-all border ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-slate-950 text-slate-500 border-slate-200/50 dark:border-slate-850 hover:border-accent/40 hover:text-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* MOBILE FEATURED FINGER-SWIPEABLE CAROUSEL (< sm) */}
        {displayedPhotos.length > 1 && (
          <div className="sm:hidden space-y-2.5">
            <div className="aspect-[4/3] rounded-hotel overflow-hidden shadow-md bg-slate-200">
              <SwipeablePhotoSlider
                photos={displayedPhotos.map((p) => p.image_url)}
                alt={`${activeCategory} Gallery`}
                className="w-full h-full"
                controlledIndex={mobileSliderIdx % displayedPhotos.length}
                onIndexChange={setMobileSliderIdx}
                arrowsMode="none"
                showCounter={true}
                counterPositionClass="top-3 right-3"
                onTapPhoto={(idx) => {
                  const target = displayedPhotos[idx];
                  if (target) openLightbox(target.id);
                }}
              />
            </div>
            <div
              className="flex items-center gap-2 overflow-x-auto py-1"
              style={{ touchAction: 'pan-x', scrollbarWidth: 'none' }}
            >
              {displayedPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setMobileSliderIdx(idx)}
                  className={`w-16 h-12 rounded-md overflow-hidden shrink-0 cursor-pointer transition-all ${
                    idx === mobileSliderIdx % displayedPhotos.length
                      ? 'ring-2 ring-primary opacity-100'
                      : 'opacity-55'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image_url}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PHOTOS GRID */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPhotos.map((photo) => {
            const roomTypeName = photo.category.toLowerCase() === 'rooms' ? getPhotoRoomTypeName(photo.image_url) : null;
            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo.id)}
                className="relative aspect-[4/3] rounded-hotel overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-900 group cursor-pointer bg-slate-200"
              >
                {/* Image element with native loading="lazy" for performance optimization */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image_url}
                  alt={isValidAltText(photo.alt_text) ? photo.alt_text : `${photo.category} Photo`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                  loading="lazy"
                />
                
                {/* Elegant Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div className="absolute bottom-4 left-4 text-left">
                    <span className="text-[9px] tracking-widest font-bold uppercase text-accent/90">
                      {photo.category}
                      {roomTypeName ? ` - ${roomTypeName}` : ''}
                    </span>
                    {isValidAltText(photo.alt_text) && <p className="text-xs text-white/90 font-medium">{photo.alt_text}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SWIPEABLE LIGHTBOX MODAL */}
        <SwipeableLightbox
          open={lightboxIndex !== null && filteredPhotos.length > 0}
          photos={filteredPhotos.map((p) => p.image_url)}
          index={lightboxIndex ?? 0}
          title={activeCategory === 'All' ? 'Gallery' : activeCategory}
          renderCaption={(idx) => {
            const currentPhoto = filteredPhotos[idx];
            if (!currentPhoto) return null;
            const roomTypeName =
              currentPhoto.category.toLowerCase() === 'rooms'
                ? getPhotoRoomTypeName(currentPhoto.image_url)
                : null;
            return (
              <>
                <span className="text-accent/90 font-bold uppercase tracking-widest text-[10px] mr-2">
                  [{currentPhoto.category}
                  {roomTypeName ? ` - ${roomTypeName}` : ''}]
                </span>
                {isValidAltText(currentPhoto.alt_text) && (
                  <span className="mr-2">{currentPhoto.alt_text}</span>
                )}
              </>
            );
          }}
          onIndexChange={(idx) => setLightboxIndex(idx)}
          onClose={closeLightbox}
        />

      </div>
    </section>
  );
}
