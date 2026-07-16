'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import { HeroSlide } from '@/lib/db/mock-data';

interface HeroSliderProps {
  slides: HeroSlide[];
  hotelId: string;
}

export default function HeroSlider({ slides, hotelId }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirst = currentIndex === 0;
    const newIndex = isFirst ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = useCallback(() => {
    const isLast = currentIndex === slides.length - 1;
    const newIndex = isLast ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  // Autoplay functionality: rotates slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, nextSlide]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  // Helper to convert hex overlay color to rgb/rgba
  const getOverlayStyle = (hex: string, opacity: number) => {
    return {
      backgroundColor: hex || '#000000',
      opacity: opacity !== undefined ? opacity : 0.4,
    };
  };

  return (
    <section className="relative w-full h-[88vh] md:h-[92vh] overflow-hidden bg-slate-900 select-none">
      
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
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.image_url}
              alt={slide.headline || 'Hotel Slide'}
              className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-10000"
            />
          )}

          {/* Color Overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={getOverlayStyle(slide.overlay_color, slide.overlay_opacity)}
          />

          {/* CONTENT CARD (Centering on the screen) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-6">
            <div className="max-w-4xl space-y-4 md:space-y-6 flex flex-col items-center">
              
              {/* Animated Subtitle */}
              {slide.subheadline && (
                <p className="text-xs md:text-sm tracking-[0.3em] font-semibold text-white/80 uppercase animate-fade-in font-sans">
                  {slide.subheadline}
                </p>
              )}

              {/* Animated Headline */}
              {slide.headline && (
                <h1 className="text-3xl md:text-6xl font-light tracking-widest text-white leading-tight font-hotel capitalize">
                  {slide.headline}
                </h1>
              )}

              {/* Decorative Divider */}
              <div className="w-12 h-[1px] bg-accent/80 my-2" />

              {/* Action Button */}
              {slide.button_text && (
                <a
                  href={slide.button_link || '#rooms'}
                  className="inline-flex items-center gap-2 border border-white/30 bg-white/5 hover:bg-white text-white hover:text-primary transition-all duration-300 font-semibold text-[10px] md:text-xs tracking-[0.2em] uppercase py-3.5 px-8 rounded-hotel mt-4 shadow-lg backdrop-blur-sm"
                >
                  {slide.button_text}
                  <MousePointerClick className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* CAROUSEL NAVIGATION CONTROLS */}
      {slides.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-2 border border-white/20 bg-black/10 hover:bg-white hover:text-primary text-white rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-2 border border-white/20 bg-black/10 hover:bg-white hover:text-primary text-white rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-accent w-6' : 'bg-white/40'
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
