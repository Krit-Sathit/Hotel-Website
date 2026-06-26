'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2 } from 'lucide-react';

interface TenantSelectorProps {
  currentHotelId: string;
  currentHotelName: string;
  hotels?: Array<{ id: string; name: string }>;
}

export default function TenantSelector({ currentHotelId, currentHotelName, hotels }: TenantSelectorProps) {
  const router = useRouter();

  const handleHotelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    if (!newId) return;

    // Write the active hotel ID to document cookie
    // This allows both server components and API routes to read the active tenant ID
    document.cookie = `active_hotel_id=${newId}; path=/; max-age=31536000; SameSite=Lax`;

    // Refresh the router to reload the active server layout with new hotel data
    router.refresh();
  };

  const hotelOptions = hotels || [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Grand Horizon Resort' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Urban Nest Hotel' }
  ];

  return (
    <div className="relative w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 hover:border-slate-300 transition-colors flex items-center gap-2 text-xs">
      <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
      <div className="flex-grow text-left">
        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block -mb-0.5">
          Select Hotel
        </label>
        <select
          value={currentHotelId}
          onChange={handleHotelChange}
          className="bg-transparent border-none outline-none font-bold text-slate-800 w-full cursor-pointer py-0.5 pr-6 appearance-none"
        >
          {hotelOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-white text-slate-800">
              {opt.name}
            </option>
          ))}
        </select>
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
