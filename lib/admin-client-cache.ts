'use client';

import type {
  Hotel,
  HeroSlide,
  Room,
  HomepageSection,
  Promotion,
} from '@/lib/db/mock-data';

export interface AdminDataBundle {
  hotel: Hotel;
  slides?: HeroSlide[];
  rooms?: Room[];
  sections?: HomepageSection[];
  media?: any[];
  promotions?: Promotion[];
  fetchedAt: number;
  complete: boolean;
}

const CACHE_TTL_MS = 120_000;
const STALE_REFRESH_MS = 30_000;

const bundleCache = new Map<string, AdminDataBundle>();
const inFlightRequests = new Map<string, Promise<AdminDataBundle | null>>();

export function getActiveHotelCookieId(): string {
  if (typeof document === 'undefined') return 'theparphuket';
  const match = document.cookie.match(/(?:^|;\s*)active_hotel_id=([^;]+)/);
  const raw = match ? decodeURIComponent(match[1]).trim() : '';
  if (!raw || raw === 'hotel-1784206393534') return 'theparphuket';
  return raw;
}

function normalizeKey(idOrSlug: string): string {
  const clean = (idOrSlug || '').trim().toLowerCase();
  if (!clean || clean === 'hotel-1784206393534' || clean === 'the-par-phuket') {
    return 'theparphuket';
  }
  return clean;
}

function storeBundle(requestedKey: string, bundle: AdminDataBundle) {
  bundleCache.set(normalizeKey(requestedKey), bundle);
  if (bundle.hotel?.id) {
    bundleCache.set(normalizeKey(bundle.hotel.id), bundle);
  }
  if (bundle.hotel?.slug) {
    bundleCache.set(normalizeKey(bundle.hotel.slug), bundle);
  }
}

export function seedAdminHotel(hotel: Hotel | null | undefined) {
  if (!hotel) return;
  const key = normalizeKey(hotel.id);
  const existing = bundleCache.get(key) || bundleCache.get(normalizeKey(hotel.slug));
  if (existing) {
    existing.hotel = hotel;
    return;
  }
  storeBundle(key, {
    hotel,
    fetchedAt: Date.now(),
    complete: false,
  });
}

export function peekAdminBundle(hotelId?: string): AdminDataBundle | null {
  const key = normalizeKey(hotelId || getActiveHotelCookieId());
  const entry = bundleCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
  return entry;
}

export function invalidateAdminCache(hotelId?: string) {
  if (!hotelId) {
    bundleCache.clear();
    return;
  }
  const key = normalizeKey(hotelId);
  const existing = bundleCache.get(key);
  bundleCache.delete(key);
  if (existing?.hotel?.id) bundleCache.delete(normalizeKey(existing.hotel.id));
  if (existing?.hotel?.slug) bundleCache.delete(normalizeKey(existing.hotel.slug));
}

async function fetchFullBundleFromApi(targetHotelId: string): Promise<AdminDataBundle | null> {
  const key = normalizeKey(targetHotelId);
  const existingPromise = inFlightRequests.get(key);
  if (existingPromise) return existingPromise;

  const promise = (async (): Promise<AdminDataBundle | null> => {
    try {
      const res = await fetch(
        `/api/admin/data?hotelId=${encodeURIComponent(targetHotelId)}&include=slides,rooms,sections,media,promotions`,
        { cache: 'no-store' }
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.hotel) return null;
      const bundle: AdminDataBundle = {
        hotel: data.hotel,
        slides: data.slides || [],
        rooms: data.rooms || [],
        sections: data.sections || [],
        media: data.media || [],
        promotions: data.promotions || [],
        fetchedAt: Date.now(),
        complete: true,
      };
      storeBundle(targetHotelId, bundle);
      return bundle;
    } catch (err) {
      console.error('Failed to fetch admin data bundle:', err);
      return null;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

export async function loadAdminBundle(options?: {
  hotelId?: string;
  force?: boolean;
  hotelOnly?: boolean;
}): Promise<AdminDataBundle | null> {
  const targetId = options?.hotelId || getActiveHotelCookieId();
  const key = normalizeKey(targetId);

  if (!options?.force) {
    const cached = bundleCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      if (cached.complete || options?.hotelOnly) {
        // Trigger background refresh if older than STALE_REFRESH_MS or incomplete
        if (!cached.complete || Date.now() - cached.fetchedAt > STALE_REFRESH_MS) {
          void fetchFullBundleFromApi(targetId);
        }
        return cached;
      }
    }
  }

  return fetchFullBundleFromApi(targetId);
}
