'use client';

import React, { useState, useEffect, useRef, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Building2,
  Loader2,
  Search,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import { loadAdminBundle } from '@/lib/admin-client-cache';

export interface HotelOption {
  id: string;
  name: string;
  slug?: string;
}

interface TenantSelectorProps {
  currentHotelId: string;
  currentHotelName: string;
  hotels?: HotelOption[];
}

interface ActiveHotelChangedDetail {
  hotelId: string;
  hotelName?: string;
  hotelSlug?: string;
}

export function ActiveTenantName({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ActiveHotelChangedDetail>).detail;
      if (detail?.hotelName) {
        setName(detail.hotelName);
      }
    };
    window.addEventListener('active-hotel-changed', handler);
    return () => window.removeEventListener('active-hotel-changed', handler);
  }, []);

  return <span className="text-accent font-bold">{name}</span>;
}

export function ActiveWebsiteLink({ initialSlug }: { initialSlug: string }) {
  const [slug, setSlug] = useState(initialSlug);

  useEffect(() => {
    setSlug(initialSlug);
  }, [initialSlug]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ActiveHotelChangedDetail>).detail;
      if (detail?.hotelSlug) {
        setSlug(detail.hotelSlug);
      }
    };
    window.addEventListener('active-hotel-changed', handler);
    return () => window.removeEventListener('active-hotel-changed', handler);
  }, []);

  return (
    <a
      href={`/sites/${slug}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold tracking-wider text-accent uppercase transition-colors"
    >
      <span>View Website</span>
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}

export default function TenantSelector({
  currentHotelId,
  currentHotelName,
  hotels,
}: TenantSelectorProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentHotelId);
  const [selectedName, setSelectedName] = useState(currentHotelName);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedId(currentHotelId);
    setSelectedName(currentHotelName);
  }, [currentHotelId, currentHotelName]);

  const hotelOptions = useMemo<HotelOption[]>(() => {
    const base =
      hotels && hotels.length > 0
        ? hotels
        : [{ id: currentHotelId, name: currentHotelName }];
    // Guarantee the active hotel is present in options
    if (
      currentHotelId &&
      !base.some(
        (h) =>
          h.id === currentHotelId ||
          h.name.trim().toLowerCase() === currentHotelName.trim().toLowerCase()
      )
    ) {
      return [{ id: currentHotelId, name: currentHotelName }, ...base];
    }
    return base;
  }, [hotels, currentHotelId, currentHotelName]);

  const filteredHotels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return hotelOptions;
    return hotelOptions.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        (opt.slug && opt.slug.toLowerCase().includes(q))
    );
  }, [hotelOptions, searchQuery]);

  // Auto-focus search box & scroll selected hotel into view when opened
  useEffect(() => {
    if (!isOpen) return;
    const activeIdx = filteredHotels.findIndex(
      (opt) =>
        opt.id === selectedId ||
        opt.name.trim().toLowerCase() === selectedName.trim().toLowerCase()
    );
    setHighlightedIndex(activeIdx >= 0 ? activeIdx : 0);

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
      if (activeIdx >= 0 && listRef.current) {
        const activeEl = listRef.current.querySelector<HTMLElement>(
          `[data-option-idx="${activeIdx}"]`
        );
        activeEl?.scrollIntoView({ block: 'nearest' });
      }
    }, 10);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset keyboard highlight to top match when typing search query
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectHotel = (option: HotelOption) => {
    setIsOpen(false);
    setSearchQuery('');

    if (!option.id || option.id === selectedId) return;

    // 0ms optimistic update for selector, header badge, and active view
    setSelectedId(option.id);
    setSelectedName(option.name);

    document.cookie = `active_hotel_id=${encodeURIComponent(
      option.id
    )}; path=/; max-age=31536000; SameSite=Lax`;

    const eventDetail: ActiveHotelChangedDetail = {
      hotelId: option.id,
      hotelName: option.name,
      hotelSlug: option.slug,
    };

    void loadAdminBundle({ hotelId: option.id, force: true }).then((bundle) => {
      window.dispatchEvent(
        new CustomEvent('active-hotel-changed', {
          detail: {
            hotelId: bundle?.hotel?.id || option.id,
            hotelName: bundle?.hotel?.name || option.name,
            hotelSlug: bundle?.hotel?.slug || option.slug,
          },
        })
      );
    });
    window.dispatchEvent(
      new CustomEvent('active-hotel-changed', { detail: eventDetail })
    );

    startTransition(() => {
      router.refresh();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = Math.min(prev + 1, Math.max(filteredHotels.length - 1, 0));
        listRef.current
          ?.querySelector<HTMLElement>(`[data-option-idx="${next}"]`)
          ?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        listRef.current
          ?.querySelector<HTMLElement>(`[data-option-idx="${next}"]`)
          ?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredHotels[highlightedIndex];
      if (target) {
        selectHotel(target);
      }
    }
  };

  const activeDisplayName =
    hotelOptions.find((h) => h.id === selectedId)?.name || selectedName;

  return (
    <div ref={containerRef} className="relative w-full text-xs" onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            if (prev) setSearchQuery('');
            return !prev;
          });
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 transition-colors flex items-center gap-2 text-left cursor-pointer ${
          isOpen
            ? 'border-accent ring-2 ring-accent/15 bg-white'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
        <div className="flex-grow min-w-0 pr-4">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block -mb-0.5">
            Select Hotel
          </span>
          <span className="font-bold text-slate-800 block truncate py-0.5">
            {activeDisplayName}
          </span>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
          ) : (
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isOpen ? 'rotate-180 text-accent' : ''
              }`}
            />
          )}
        </div>
      </button>

      {/* Searchable Popover Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Sticky Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อโรงแรม..."
                className="w-full bg-white border border-slate-200 focus:border-accent rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] text-slate-400 font-medium">
              <span>รายการโรงแรม</span>
              <span>
                {filteredHotels.length} / {hotelOptions.length}
              </span>
            </div>
          </div>

          {/* Filtered Hotel Options */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-50"
          >
            {filteredHotels.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                ไม่พบโรงแรมที่ตรงกับ &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredHotels.map((opt, idx) => {
                const isSelected =
                  opt.id === selectedId ||
                  opt.name.trim().toLowerCase() ===
                    activeDisplayName.trim().toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-option-idx={idx}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => selectHotel(opt)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-accent/10 text-slate-900 font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt.name}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
