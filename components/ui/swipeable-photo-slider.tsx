'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface SwipeablePhotoSliderProps {
  photos: string[];
  alt: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  controlledIndex?: number;
  onIndexChange?: (index: number) => void;
  onTapPhoto?: (index: number) => void;
  arrowsMode?: 'always' | 'desktop-hover' | 'bottom-right' | 'none';
  showDots?: boolean;
  dotsBottomClass?: string;
  showCounter?: boolean;
  counterPositionClass?: string;
  children?: React.ReactNode;
}

/**
 * Smooth 60fps Touch + Pointer Drag Photo Slider.
 * - Native finger swipe on mobile (`touch-action: pan-y` preserves smooth vertical page scroll)
 * - Mouse drag support so Dashboard Mobile Preview can also be dragged on desktop
 * - Safe inline styles so `.dashboard-light-override` never hides white controls/dots
 */
export function SwipeablePhotoSlider({
  photos,
  alt,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  style,
  controlledIndex,
  onIndexChange,
  onTapPhoto,
  arrowsMode = 'desktop-hover',
  showDots = true,
  dotsBottomClass = 'bottom-3',
  showCounter = false,
  counterPositionClass = 'bottom-3 right-3',
  children,
}: SwipeablePhotoSliderProps) {
  const validPhotos = photos.filter(Boolean);
  const count = validPhotos.length;

  const [internalIdx, setInternalIdx] = useState(0);
  const activeIdx =
    count > 0
      ? ((controlledIndex !== undefined ? controlledIndex : internalIdx) % count + count) % count
      : 0;

  const setIndex = useCallback(
    (next: number) => {
      if (count <= 0) return;
      const wrapped = ((next % count) + count) % count;
      if (controlledIndex === undefined) {
        setInternalIdx(wrapped);
      }
      onIndexChange?.(wrapped);
    },
    [count, controlledIndex, onIndexChange]
  );

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const gestureRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startTime: number;
    axis: 'x' | 'y' | null;
    lastDx: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    axis: null,
    lastDx: 0,
  });

  const didSwipeRef = useRef(false);

  const finishGesture = useCallback(() => {
    const g = gestureRef.current;
    if (!g.active) return;
    g.active = false;
    setIsDragging(false);

    if (g.axis === 'x' && count > 1) {
      const elapsed = Math.max(1, Date.now() - g.startTime);
      const velocity = Math.abs(g.lastDx) / elapsed; // px/ms
      if (Math.abs(g.lastDx) > 36 || (Math.abs(g.lastDx) > 16 && velocity > 0.28)) {
        if (g.lastDx < 0) {
          setIndex(activeIdx + 1);
        } else {
          setIndex(activeIdx - 1);
        }
      }
    }

    setDragOffset(0);
  }, [activeIdx, count, setIndex]);

  // Touch handlers (Mobile phones & tablets)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    didSwipeRef.current = false;
    gestureRef.current = {
      active: true,
      startX: t.clientX,
      startY: t.clientY,
      startTime: Date.now(),
      axis: null,
      lastDx: 0,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (!g.active || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - g.startX;
    const dy = t.clientY - g.startY;

    if (g.axis === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      g.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      if (g.axis === 'x' && count > 1) {
        setIsDragging(true);
      }
    }

    if (g.axis === 'x') {
      didSwipeRef.current = true;
      g.lastDx = dx;
      if (count > 1) {
        setDragOffset(dx);
      }
    }
  };

  const handleTouchEnd = () => {
    finishGesture();
  };

  // Mouse drag handlers (Desktop & Dashboard Mobile Preview testing)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || count <= 1) return;
    didSwipeRef.current = false;
    gestureRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      axis: null,
      lastDx: 0,
    };

    const onWindowMouseMove = (ev: MouseEvent) => {
      const g = gestureRef.current;
      if (!g.active) return;
      const dx = ev.clientX - g.startX;
      const dy = ev.clientY - g.startY;

      if (g.axis === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        g.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        if (g.axis === 'x') setIsDragging(true);
      }

      if (g.axis === 'x') {
        didSwipeRef.current = true;
        g.lastDx = dx;
        setDragOffset(dx);
      }
    };

    const onWindowMouseUp = () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      finishGesture();
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (didSwipeRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didSwipeRef.current = false;
      return;
    }
    if (onTapPhoto) {
      onTapPhoto(activeIdx);
    }
  };

  const stopControlBubble = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  if (count === 0) return null;

  // Compute compact window of up to 7 pagination dots
  const maxDots = 7;
  let dotStart = 0;
  let dotEnd = count;
  if (count > maxDots) {
    dotStart = Math.max(0, Math.min(activeIdx - 3, count - maxDots));
    dotEnd = dotStart + maxDots;
  }

  return (
    <div
      className={`relative overflow-hidden select-none group/slider ${
        onTapPhoto ? 'cursor-pointer' : count > 1 ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
      style={{
        touchAction: 'pan-y',
        ...style,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {/* Horizontal Sliding Track */}
      <div
        className="flex w-full h-full will-change-transform"
        style={{
          transform: `translate3d(calc(-${activeIdx * 100}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {validPhotos.map((src, idx) => {
          const isNear =
            Math.abs(idx - activeIdx) <= 1 ||
            (activeIdx === 0 && idx === count - 1) ||
            (activeIdx === count - 1 && idx === 0);

          return (
            <div key={`${src}-${idx}`} className="w-full h-full shrink-0 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={idx === 0 ? alt : `${alt} ${idx + 1}`}
                loading={isNear ? 'eager' : 'lazy'}
                draggable={false}
                className={`${imgClassName} pointer-events-none select-none`}
              />
            </div>
          );
        })}
      </div>

      {/* Custom Badge / Overlay Slot */}
      {children}

      {/* Optional Photo Counter Pill (e.g. "1 / 6") */}
      {showCounter && count > 1 && (
        <span
          className={`absolute ${counterPositionClass} z-10 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide pointer-events-none backdrop-blur-xs`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.58)',
            color: '#ffffff',
          }}
        >
          {activeIdx + 1} / {count}
        </span>
      )}

      {/* Optional Arrow Controls */}
      {count > 1 && arrowsMode === 'bottom-right' && (
        <div
          className="absolute bottom-3.5 right-3.5 z-10 flex items-center gap-1.5"
          onTouchStart={stopControlBubble}
          onMouseDown={stopControlBubble}
          onClick={stopControlBubble}
        >
          <button
            type="button"
            onClick={() => setIndex(activeIdx - 1)}
            className="p-2 rounded-lg shadow-md cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#0f172a' }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIndex(activeIdx + 1)}
            className="p-2 rounded-lg shadow-md cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#0f172a' }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {count > 1 && (arrowsMode === 'always' || arrowsMode === 'desktop-hover') && (
        <>
          <button
            type="button"
            onTouchStart={stopControlBubble}
            onMouseDown={stopControlBubble}
            onClick={(e) => {
              e.stopPropagation();
              setIndex(activeIdx - 1);
            }}
            className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full cursor-pointer transition-opacity ${
              arrowsMode === 'desktop-hover'
                ? 'opacity-0 group-hover/slider:opacity-100 hidden sm:flex'
                : 'flex'
            } items-center justify-center`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.42)',
              color: '#ffffff',
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onTouchStart={stopControlBubble}
            onMouseDown={stopControlBubble}
            onClick={(e) => {
              e.stopPropagation();
              setIndex(activeIdx + 1);
            }}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full cursor-pointer transition-opacity ${
              arrowsMode === 'desktop-hover'
                ? 'opacity-0 group-hover/slider:opacity-100 hidden sm:flex'
                : 'flex'
            } items-center justify-center`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.42)',
              color: '#ffffff',
            }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Interactive Pagination Dots */}
      {showDots && count > 1 && (
        <div
          className={`absolute ${dotsBottomClass} left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.34)' }}
          onTouchStart={stopControlBubble}
          onMouseDown={stopControlBubble}
          onClick={stopControlBubble}
        >
          {validPhotos.slice(dotStart, dotEnd).map((_, offset) => {
            const realIdx = dotStart + offset;
            const isActive = realIdx === activeIdx;
            return (
              <button
                key={realIdx}
                type="button"
                onClick={() => setIndex(realIdx)}
                className="rounded-full transition-all duration-200 cursor-pointer"
                style={{
                  width: isActive ? '16px' : '6px',
                  height: '6px',
                  backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.52)',
                }}
                aria-label={`Go to photo ${realIdx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface SwipeableLightboxProps {
  open: boolean;
  photos: string[];
  index: number;
  title?: string;
  renderCaption?: (index: number) => React.ReactNode;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Full-Screen Lightbox Modal with Smooth Finger-Swipe, Mouse Drag, Keyboard Arrows & Thumbnail Strip.
 */
export function SwipeableLightbox({
  open,
  photos,
  index,
  title,
  renderCaption,
  onIndexChange,
  onClose,
}: SwipeableLightboxProps) {
  const validPhotos = photos.filter(Boolean);
  const count = validPhotos.length;
  const safeIdx = count > 0 ? ((index % count) + count) % count : 0;

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const thumbsContainerRef = useRef<HTMLDivElement>(null);

  const gestureRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startTime: number;
    lastDx: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    lastDx: 0,
  });

  const goTo = useCallback(
    (next: number) => {
      if (count <= 0) return;
      onIndexChange(((next % count) + count) % count);
    },
    [count, onIndexChange]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && count > 1) goTo(safeIdx - 1);
      else if (e.key === 'ArrowRight' && count > 1) goTo(safeIdx + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, count, safeIdx, goTo, onClose]);

  // Keep active thumbnail visible in horizontal strip
  useEffect(() => {
    if (!open || !thumbsContainerRef.current) return;
    const activeThumb = thumbsContainerRef.current.children[safeIdx] as HTMLElement | undefined;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [open, safeIdx]);

  const finishSwipe = useCallback(() => {
    const g = gestureRef.current;
    if (!g.active) return;
    g.active = false;
    setIsDragging(false);

    if (count > 1) {
      const elapsed = Math.max(1, Date.now() - g.startTime);
      const velocity = Math.abs(g.lastDx) / elapsed;
      if (Math.abs(g.lastDx) > 40 || (Math.abs(g.lastDx) > 18 && velocity > 0.28)) {
        if (g.lastDx < 0) goTo(safeIdx + 1);
        else goTo(safeIdx - 1);
      }
    }
    setDragOffset(0);
  }, [count, goTo, safeIdx]);

  if (!open || count === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    gestureRef.current = {
      active: true,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startTime: Date.now(),
      lastDx: 0,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const g = gestureRef.current;
    if (!g.active || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - g.startX;
    g.lastDx = dx;
    if (count > 1) setDragOffset(dx);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || count <= 1) return;
    gestureRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      lastDx: 0,
    };
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (!gestureRef.current.active) return;
      const dx = ev.clientX - gestureRef.current.startX;
      gestureRef.current.lastDx = dx;
      setDragOffset(dx);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      finishSwipe();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-6 select-none"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.94)' }}
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 z-20"
        style={{ color: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex items-center gap-2 text-xs sm:text-sm font-semibold">
          {title && <span className="truncate">{title}</span>}
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#ffffff' }}
          >
            {safeIdx + 1} / {count}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full cursor-pointer transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#ffffff' }}
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Swipeable Stage */}
      <div
        className="relative flex-1 w-full max-w-5xl mx-auto my-2 sm:my-4 overflow-hidden flex items-center justify-center rounded-xl"
        style={{ touchAction: 'none' }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={finishSwipe}
        onTouchCancel={finishSwipe}
        onMouseDown={handleMouseDown}
      >
        <div
          className="flex w-full h-full items-center will-change-transform"
          style={{
            transform: `translate3d(calc(-${safeIdx * 100}% + ${dragOffset}px), 0, 0)`,
            transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {validPhotos.map((src, idx) => {
            const isNear =
              Math.abs(idx - safeIdx) <= 1 ||
              (safeIdx === 0 && idx === count - 1) ||
              (safeIdx === count - 1 && idx === 0);
            return (
              <div
                key={`${src}-${idx}`}
                className="w-full h-full shrink-0 flex items-center justify-center px-1 sm:px-8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={title ? `${title} ${idx + 1}` : `Photo ${idx + 1}`}
                  loading={isNear ? 'eager' : 'lazy'}
                  draggable={false}
                  className="max-w-full max-h-[70vh] sm:max-h-[74vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
                />
              </div>
            );
          })}
        </div>

        {/* Left / Right Buttons (Optional convenience alongside finger swipe) */}
        {count > 1 && (
          <>
            <button
              type="button"
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                goTo(safeIdx - 1);
              }}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full cursor-pointer items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#ffffff' }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                goTo(safeIdx + 1);
              }}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full cursor-pointer items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#ffffff' }}
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Caption + Touch-Scrollable Thumbnail Strip */}
      <div
        className="w-full max-w-5xl mx-auto space-y-2.5 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {renderCaption && (
          <div className="text-center text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {renderCaption(safeIdx)}
          </div>
        )}

        {count > 1 && (
          <div
            ref={thumbsContainerRef}
            className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-1 px-1"
            style={{ touchAction: 'pan-x', scrollbarWidth: 'none' }}
          >
            {validPhotos.map((src, idx) => {
              const active = idx === safeIdx;
              return (
                <button
                  key={`${src}-thumb-${idx}`}
                  type="button"
                  onClick={() => goTo(idx)}
                  className="w-14 h-10 sm:w-16 sm:h-12 rounded-md overflow-hidden shrink-0 cursor-pointer transition-all"
                  style={{
                    opacity: active ? 1 : 0.45,
                    border: active ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
