'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Settings,
  Palette,
  Layers,
  FileText,
  Image as ImageIcon,
  CalendarRange,
  Hotel as HotelIcon,
  Grid,
  Users as UsersIcon,
  Loader2,
} from 'lucide-react';
import type { Hotel } from '@/lib/db/mock-data';
import {
  seedAdminHotel,
  loadAdminBundle,
  getActiveHotelCookieId,
} from '@/lib/admin-client-cache';

interface SidebarNavProps {
  initialHotel: Hotel;
}

const MENU_ITEMS = [
  { label: 'Analytics Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'General Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Website Templates', href: '/dashboard/theme', icon: Palette },
  { label: 'Homepage Builder', href: '/dashboard/builder', icon: Grid },
  { label: 'Hero Slides', href: '/dashboard/hero', icon: Layers },
  { label: 'About & Story Text', href: '/dashboard/about', icon: FileText },
  { label: 'Rooms Manager', href: '/dashboard/rooms', icon: HotelIcon },
  { label: 'Promotions Manager', href: '/dashboard/promotions', icon: CalendarRange },
  { label: 'Media Library', href: '/dashboard/media', icon: ImageIcon },
  { label: 'User & Access Manager', href: '/dashboard/users', icon: UsersIcon },
];

export default function SidebarNav({ initialHotel }: SidebarNavProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Seed initial hotel synchronously in effect and warm up full admin bundle
  useEffect(() => {
    const cookieId = getActiveHotelCookieId();
    if (
      cookieId !== initialHotel.id &&
      cookieId !== initialHotel.slug &&
      !(cookieId === 'theparphuket' && initialHotel.slug === 'theparphuket')
    ) {
      return;
    }
    seedAdminHotel(initialHotel);
    const timer = setTimeout(() => {
      void loadAdminBundle({ hotelId: initialHotel.id });
    }, 30);
    return () => clearTimeout(timer);
  }, [initialHotel]);

  // Clear pending indicator as soon as route commits
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const activeHref = pendingHref || pathname;

  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto text-left">
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/dashboard'
            ? activeHref === '/dashboard'
            : activeHref === item.href || activeHref.startsWith(`${item.href}/`);
        const isPending = pendingHref === item.href && pathname !== item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={() => {
              if (pathname !== item.href) {
                setPendingHref(item.href);
              }
            }}
            className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold border transition-colors duration-100 ${
              isActive
                ? 'bg-accent/10 text-slate-900 border-accent/30 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-100'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : ''}`} />
              <span>{item.label}</span>
            </span>
            {isPending && <Loader2 className="w-3.5 h-3.5 text-accent animate-spin shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );
}
