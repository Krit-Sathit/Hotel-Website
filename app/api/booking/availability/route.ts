import { NextRequest, NextResponse } from 'next/server';
import { getHotelBySlug, getRooms, getPromotions } from '@/lib/db/mock-data';

const FLOWSTAY_API_BASE =
  process.env.FLOWSTAY_API_URL ||
  process.env.NEXT_PUBLIC_FLOWSTAY_URL ||
  'https://flowstay.live';

const AMENITY_LABELS_EN: Record<string, string> = {
  free_wifi: 'Free WiFi',
  air_conditioning: 'Air Conditioning',
  minibar: 'Minibar',
  private_bathroom: 'Private Bathroom',
  shower: 'Shower',
  hairdryer: 'Hairdryer',
  towels: 'Towels',
  flat_screen_tv: 'Flat-screen TV',
  satellite_channels: 'Satellite Channels',
  telephone: 'Telephone',
  socket_near_bed: 'Socket Near Bed',
  wake_up_service: 'Wake-up Service',
  alarm_clock: 'Alarm Clock',
  clothes_rack: 'Clothes Rack',
  desk: 'Desk',
  balcony: 'Balcony',
  garden_view: 'Garden View',
  pool_view: 'Pool View',
  sea_view: 'Sea View',
  city_view: 'City View',
  mountain_view: 'Mountain View',
  sitting_area: 'Sitting Area',
  linens: 'Linens',
  interconnecting_rooms: 'Interconnecting Rooms',
  outdoor_furniture: 'Outdoor Furniture',
  ironing_facilities: 'Ironing Facilities',
  bathtub: 'Bathtub',
  toiletries: 'Free Toiletries',
  bathrobe: 'Bathrobe',
  slippers: 'Slippers',
  no_smoking: 'No Smoking',
  electric_kettle: 'Electric Kettle',
  tea_coffee_maker: 'Tea/Coffee Maker',
  refrigerator: 'Refrigerator',
  dining_area: 'Dining Area',
  safe: 'Safe',
  wardrobe: 'Wardrobe',
};

function normalizeSlugForFlowStay(slug: string): string {
  const clean = (slug || '').trim().toLowerCase();
  if (clean === 'the-par-phuket' || clean === 'hotel-1784206393534') {
    return 'theparphuket';
  }
  return clean;
}

function rewriteStorageUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/(www\.)?flowstay\.live\/storage\//i, '/storage/')
    .replace(/^http:\/\/flowstay\.live\//i, 'https://flowstay.live/');
}

function parseStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item)).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'NULL') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch {
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

async function fetchTrpcQuery(procedure: string, inputObj: Record<string, unknown>, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const encoded = encodeURIComponent(JSON.stringify({ json: inputObj }));
    const res = await fetch(`${FLOWSTAY_API_BASE}/api/trpc/${procedure}?input=${encoded}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.result?.data?.json ?? payload?.result?.data ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug') || 'theparphuket';
  const today = new Date();
  const checkIn =
    searchParams.get('checkIn') ||
    new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
  const checkOut =
    searchParams.get('checkOut') ||
    new Date(new Date(checkIn).getTime() + 86400000).toISOString().slice(0, 10);
  const promoCode = (searchParams.get('promoCode') || '').trim();

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
  );

  const primarySlug = normalizeSlugForFlowStay(rawSlug);

  // 1. Try live FlowStay tRPC hotelBySlug.getDetail
  let detail = await fetchTrpcQuery('hotelBySlug.getDetail', {
    slug: primarySlug,
    checkIn,
    checkOut,
  });

  if (!detail && primarySlug.includes('-')) {
    detail = await fetchTrpcQuery('hotelBySlug.getDetail', {
      slug: primarySlug.replace(/-/g, ''),
      checkIn,
      checkOut,
    });
  }

  const rawRooms = detail?.roomDetails || detail?.roomTypes;

  if (detail && detail.id && Array.isArray(rawRooms)) {
    const [addOnsData, promoValidation] = await Promise.all([
      fetchTrpcQuery('addOn.active', { hotelId: detail.id }),
      promoCode
        ? fetchTrpcQuery('promotion.validateCode', { hotelId: detail.id, code: promoCode })
        : Promise.resolve(null),
    ]);

    const validCodePromo = promoValidation?.valid ? promoValidation.promotion : null;

    const roomTypes = rawRooms.map((room: any) => {
      const parsedImages = parseStringArray(room.images);
      const images = parsedImages.map((img) => rewriteStorageUrl(img)).filter(Boolean);
      const imageUrl = rewriteStorageUrl(room.imageUrl) || images[0] || '';

      const rawAmenities = parseStringArray(room.amenities);
      const amenities = rawAmenities.map((a) => AMENITY_LABELS_EN[a] || a);

      let ratePlans = Array.isArray(room.ratePlans) ? [...room.ratePlans] : [];

      // If a valid promoCode was entered, inject discounted rate options for this promo code
      if (validCodePromo) {
        const applicableRooms = Array.isArray(validCodePromo.applicableRoomTypes)
          ? validCodePromo.applicableRoomTypes
          : [];
        const roomMatches =
          applicableRooms.length === 0 || applicableRooms.includes(Number(room.id));

        if (roomMatches) {
          const basePlansMap = new Map<number, any>();
          for (const rp of ratePlans) {
            if (!basePlansMap.has(rp.id)) {
              basePlansMap.set(rp.id, rp);
            }
          }
          for (const basePlan of basePlansMap.values()) {
            const avgOriginal = Number(basePlan.originalPrice || basePlan.price || 0);
            if (avgOriginal <= 0) continue;
            const discountPerNight =
              validCodePromo.discountType === 'percent'
                ? avgOriginal * (Number(validCodePromo.discountValue) / 100)
                : Number(validCodePromo.discountValue);
            const discountedPrice = Math.max(0, Math.round(avgOriginal - discountPerNight));
            const discountPct =
              validCodePromo.discountType === 'percent'
                ? Number(validCodePromo.discountValue)
                : Math.round((discountPerNight / avgOriginal) * 100);

            ratePlans.unshift({
              ...basePlan,
              optionKey: `${basePlan.id}_code_${validCodePromo.id}`,
              originalPrice: avgOriginal,
              price: discountedPrice,
              totalPrice: discountedPrice * nights,
              totalOriginalPrice: avgOriginal * nights,
              discountPct,
              promotionId: validCodePromo.id,
              promoName: validCodePromo.name,
              promoNameEn: validCodePromo.nameEn || validCodePromo.name,
              promoType: 'code',
            });
          }
        }
      }

      return {
        ...room,
        imageUrl,
        images: images.length > 0 ? images : imageUrl ? [imageUrl] : [],
        amenities,
        maxOccupancy: Number(room.maxAdults || room.maxOccupancy || 2),
        sizeSqm: room.roomSize || room.sizeSqm || null,
        available: Number(room.available ?? room.totalRooms ?? 5),
        ratePlans,
      };
    });

    return NextResponse.json({
      source: 'flowstay',
      nights,
      checkIn,
      checkOut,
      promoCodeValid: promoCode ? !!validCodePromo : null,
      appliedCodePromo: validCodePromo,
      hotel: {
        id: detail.id,
        slug: detail.slug || primarySlug,
        name: detail.nameEn || detail.name,
        nameTh: detail.name,
        nameEn: detail.nameEn || detail.name,
        currency: detail.currency || 'THB',
        taxRate: detail.taxRate || '7',
        serviceChargeRate: detail.serviceChargeRate || '10',
        checkInTime: detail.checkInTime || '14:00',
        checkOutTime: detail.checkOutTime || '12:00',
        contactEmail: detail.contactEmail || '',
        contactPhone: detail.contactPhone || '',
        address: detail.addressEn || detail.address || '',
        heroImageUrl: rewriteStorageUrl(detail.heroImageUrl),
      },
      roomTypes,
      addOns: Array.isArray(addOnsData) ? addOnsData : [],
    });
  }

  // 2. Fallback to local Hotel Website DB if FlowStay is unreachable (offline dev mode)
  const localHotel =
    (await getHotelBySlug(rawSlug)) || (await getHotelBySlug(primarySlug));
  if (!localHotel) {
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  }

  const [localRooms, localPromos] = await Promise.all([
    getRooms(localHotel.id),
    getPromotions(localHotel.id),
  ]);

  const fallbackRoomTypes = localRooms.map((rm, idx) => {
    const basePrice = Number(rm.price) || 2500;
    const gallery = Array.isArray(rm.gallery)
      ? rm.gallery.map((g) => rewriteStorageUrl(g)).filter(Boolean)
      : [];
    const ratePlans: any[] = [];

    if (localPromos.length > 0) {
      localPromos.forEach((p, pIdx) => {
        const pctMatch = `${p.title || ''} ${p.description || ''}`.match(/(\d+)\s*%/);
        const pct = pctMatch ? Number(pctMatch[1]) : 40;
        const discounted = Math.round(basePrice * (1 - pct / 100));
        ratePlans.push({
          id: idx * 10 + pIdx + 1,
          optionKey: `${idx * 10 + 1}_promo_${pIdx + 1}`,
          name: 'Room Only',
          nameEn: 'Room Only',
          mealPlan: 'room_only',
          originalPrice: basePrice,
          price: discounted,
          totalPrice: discounted * nights,
          totalOriginalPrice: basePrice * nights,
          discountPct: pct,
          promotionId: pIdx + 1,
          promoName: p.title,
          promoNameEn: p.title,
          promoType: 'basic',
          cancellationPolicy: {
            type: 'flexible',
            refundDays: 5,
            name: 'Free cancellation 5d before',
          },
        });
      });
    } else {
      ratePlans.push(
        {
          id: idx * 10 + 1,
          optionKey: `${idx * 10 + 1}_promo_nrf`,
          name: 'Room Only - Non-Refundable',
          nameEn: 'Room Only - Non-Refundable',
          mealPlan: 'room_only',
          originalPrice: basePrice,
          price: Math.round(basePrice * 0.45),
          totalPrice: Math.round(basePrice * 0.45) * nights,
          totalOriginalPrice: basePrice * nights,
          discountPct: 55,
          promotionId: 1,
          promoName: 'Member 55% Discount NRF',
          promoNameEn: 'Member 55% Discount NRF',
          promoType: 'member',
          cancellationPolicy: {
            type: 'non_refundable',
            refundDays: 0,
            name: 'Non-refundable',
          },
        },
        {
          id: idx * 10 + 2,
          optionKey: `${idx * 10 + 2}_promo_flx`,
          name: 'Room Only',
          nameEn: 'Room Only',
          mealPlan: 'room_only',
          originalPrice: basePrice,
          price: Math.round(basePrice * 0.6),
          totalPrice: Math.round(basePrice * 0.6) * nights,
          totalOriginalPrice: basePrice * nights,
          discountPct: 40,
          promotionId: 2,
          promoName: 'Basic Discount 40% FLX',
          promoNameEn: 'Basic Discount 40% FLX',
          promoType: 'basic',
          cancellationPolicy: {
            type: 'flexible',
            refundDays: 5,
            name: 'Free cancellation 5d before',
          },
        }
      );
    }

    return {
      id: Number(rm.id.replace(/\D/g, '')) || idx + 1,
      name: rm.name,
      nameEn: rm.name,
      description: rm.description,
      descriptionEn: rm.description,
      bedType: rm.bed_type || 'King',
      maxOccupancy: rm.max_guests || 2,
      sizeSqm: rm.room_size || 45,
      amenities: Array.isArray(rm.amenities) ? rm.amenities : [],
      imageUrl: gallery[0] || '',
      images: gallery,
      available: 5,
      isClosed: false,
      ratePlans,
    };
  });

  return NextResponse.json({
    source: 'fallback',
    nights,
    checkIn,
    checkOut,
    promoCodeValid: null,
    appliedCodePromo: null,
    hotel: {
      id: Number(localHotel.id.replace(/\D/g, '')) || 1,
      slug: localHotel.slug,
      name: localHotel.name,
      nameTh: localHotel.name,
      nameEn: localHotel.name,
      currency: 'THB',
      taxRate: '7',
      serviceChargeRate: '10',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      contactEmail: localHotel.email || '',
      contactPhone: localHotel.phone || '',
      address: localHotel.address || '',
      heroImageUrl: '',
    },
    roomTypes: fallbackRoomTypes,
    addOns: [],
  });
}
