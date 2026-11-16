'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useHotelLocale } from '@/components/hotel-locale-provider';
import type { HotelLocale } from '@/lib/i18n/hotel-locale';

const LOCALE_OPTIONS: Array<{ code: HotelLocale; label: string; flag: string }> = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export interface LanguageSwitcherProps {
  color?: string;
  borderColor?: string;
  compact?: boolean;
  align?: 'left' | 'right';
}

export default function LanguageSwitcher({
  color,
  borderColor,
  compact = false,
  align = 'right',
}: LanguageSwitcherProps) {
  const { locale, setLocale, isSwitching } = useHotelLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Switch Language"
        className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider transition-opacity hover:opacity-80 cursor-pointer ${
          compact ? 'px-2 py-1.5 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'
        } ${borderColor ? 'border' : ''} ${isSwitching ? 'opacity-65' : ''}`}
        style={{
          ...(color ? { color } : {}),
          ...(borderColor ? { borderColor } : {}),
        }}
      >
        <Globe className={compact ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />
        <span>{locale.toUpperCase()}</span>
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1.5 w-36 rounded-lg bg-white text-slate-800 shadow-xl border border-slate-200/80 py-1 z-50 ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {LOCALE_OPTIONS.map((opt) => {
            const active = locale === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                  active ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </span>
                {active && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
