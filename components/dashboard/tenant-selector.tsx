'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2, Loader2 } from 'lucide-react';
import { loadAdminBundle } from '@/lib/admin-client-cache';

interface TenantSelectorProps {
  currentHotelId: string;
  currentHotelName: string;
  hotels?: Array<{ id: string; name: string }>;
}

export default function TenantSelector({ currentHotelId, hotels }: TenantSelectorProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentHotelId);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedId(currentHotelId);
  }, [currentHotelId]);

  const handleHotelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    if (!newId || newId === selectedId) return;

    // Update dropdown immediately (0ms optimistic feedback)
    setSelectedId(newId);

    // Write the active hotel ID to document cookie
    document.cookie = `active_hotel_id=${encodeURIComponent(newId)}; path=/; max-age=31536000; SameSite=Lax`;

    // Kick off bundle fetch once and notify active client view
    void loadAdminBundle({ hotelId: newId, force: true }).then(() => {
      window.dispatchEvent(new CustomEvent('active-hotel-changed', { detail: { hotelId: newId } }));
    });
    window.dispatchEvent(new CustomEvent('active-hotel-changed', { detail: { hotelId: newId } }));

    // Refresh the active server layout non-blockingly
    startTransition(() => {
      router.refresh();
    });
  };

  const hotelOptions = hotels || [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Grand Horizon Resort' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Urban Nest Hotel' },
  ];

  return (
    <div className="relative w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 hover:border-slate-300 transition-colors flex items-center gap-2 text-xs">
      <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
      <div className="flex-grow text-left min-w-0">
        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block -mb-0.5">
          Select Hotel
        </label>
        <select
          value={selectedId}
          onChange={handleHotelChange}
          className="bg-transparent border-none outline-none font-bold text-slate-800 w-full cursor-pointer py-0.5 pr-6 appearance-none truncate"
        >
          {hotelOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-white text-slate-800">
              {opt.name}
            </option>
          ))}
        </select>
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </div>
    </div>
  );
}
