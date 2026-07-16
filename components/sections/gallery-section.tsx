'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { GalleryPhoto } from '@/lib/db/mock-data';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  limit?: number;
  showFilters?: boolean;
}

export default function GallerySection({ photos, limit, showFilters = true }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Helper to determine if alt text is a user-entered description vs auto-generated filename
  const isValidAltText = (text?: string) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    if (
      lower.startsWith('image-') || 
      lower.startsWith('upload-') || 
      lower.includes('.webp') || 
      lower.includes('.jpg') || 
      lower.includes('.png') ||
      lower.includes('.jpeg')
    ) {
      return false;
    }
    return true;
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

        {/* PHOTOS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(photo.id)}
              className="relative aspect-[4/3] rounded-hotel overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-900 group cursor-pointer bg-slate-200"
            >
              {/* Image element with native loading="lazy" for performance optimization */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image_url}
                alt={photo.alt_text || 'Resort Photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                loading="lazy"
              />
              
              {/* Elegant Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div className="absolute bottom-4 left-4 text-left">
                  <span className="text-[9px] tracking-widest font-bold uppercase text-accent/90">{photo.category}</span>
                  {isValidAltText(photo.alt_text) && <p className="text-xs text-white/90 font-medium">{photo.alt_text}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LIGHTBOX MODAL */}
        {lightboxIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-55 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 md:left-8 p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current Image Container */}
            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center gap-4 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filteredPhotos[lightboxIndex].image_url}
                alt={filteredPhotos[lightboxIndex].alt_text || 'Resort Photo'}
                className="max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent closing
              />
              
              {/* Caption */}
              <div className="text-center text-white/85 text-xs md:text-sm tracking-wide">
                <span className="text-accent/90 font-bold uppercase tracking-widest text-[10px] mr-2">
                  [{filteredPhotos[lightboxIndex].category}]
                </span>
                {isValidAltText(filteredPhotos[lightboxIndex].alt_text) && (
                  <span className="mr-2">{filteredPhotos[lightboxIndex].alt_text}</span>
                )}
                <span className="text-white/40">
                  ({lightboxIndex + 1} of {filteredPhotos.length})
                </span>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-4 md:right-8 p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
