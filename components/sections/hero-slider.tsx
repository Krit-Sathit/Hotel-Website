'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '@/lib/db/mock-data';

interface HeroSliderProps {
  slides: HeroSlide[];
  hotelId: string;
  bookingUrl: string;
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);

  const prevSlide = () => {
    const isFirst = currentIndex === 0;
    const newIndex = isFirst ? slides.length - 1 : currentIndex - 1;
    setPreviousIndex(currentIndex);
    setCurrentIndex(newIndex);
  };

  const nextSlide = useCallback(() => {
    const isLast = currentIndex === slides.length - 1;
    const newIndex = isLast ? 0 : currentIndex + 1;
    setPreviousIndex(currentIndex);
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  // Autoplay functionality: rotates slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, nextSlide]);

  // Keep the first screen light: only render the active and outgoing images,
  // then warm up the next one after the page has become interactive.
  useEffect(() => {
    const nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    const nextSlideImage = slides[nextIndex]?.image_url;
    if (!nextSlideImage) return;

    const image = new window.Image();
    image.src = nextSlideImage;
  }, [currentIndex, slides]);

  const touchStartXRef = React.useRef<number | null>(null);
  const touchDeltaXRef = React.useRef<number>(0);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="relative w-full h-auto aspect-video md:h-[92vh] md:aspect-auto overflow-hidden bg-slate-900 select-none"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          touchStartXRef.current = e.touches[0].clientX;
          touchDeltaXRef.current = 0;
        }
      }}
      onTouchMove={(e) => {
        if (touchStartXRef.current !== null && e.touches.length === 1) {
          touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
        }
      }}
      onTouchEnd={() => {
        if (touchStartXRef.current !== null && slides.length > 1) {
          if (touchDeltaXRef.current < -36) nextSlide();
          else if (touchDeltaXRef.current > 36) prevSlide();
        }
        touchStartXRef.current = null;
        touchDeltaXRef.current = 0;
      }}
    >
      {/* BACKGROUND SLIDES */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image / Video */}
          {slide.video_url ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={slide.video_url} type="video/mp4" />
            </video>
          ) : index === currentIndex || index === previousIndex ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image_url}
                alt={slide.headline || 'Hotel Slide'}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className="absolute inset-0 w-full h-full object-contain md:object-cover md:scale-105 transition-transform duration-10000"
              />
            </>
          ) : null}
        </div>
      ))}

      {/* CAROUSEL NAVIGATION CONTROLS */}
      {slides.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-2 border border-white/30 bg-black/25 hover:bg-white hover:text-primary text-white rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-2 border border-white/30 bg-black/25 hover:bg-white hover:text-primary text-white rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setPreviousIndex(currentIndex);
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex ? 'bg-accent w-6' : 'bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
