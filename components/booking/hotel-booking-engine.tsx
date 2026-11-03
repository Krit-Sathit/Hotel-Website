'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  CalendarDays,
  Users,
  Search,
  BedDouble,
  Maximize2,
  Wifi,
  Wind,
  Tv,
  Coffee,
  Bath,
  Refrigerator,
  Shield,
  Sparkles,
  UtensilsCrossed,
  Eye,
  Lock,
  Shirt,
  Armchair,
  Phone,
  Lamp,
  Sun,
  Volume2,
  Baby,
  Accessibility,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  QrCode,
  ShieldCheck,
  Loader2,
  Tag,
  Plus,
  Minus,
} from 'lucide-react';

interface RatePlanOption {
  id: number;
  optionKey: string;
  name: string;
  nameEn?: string | null;
  mealPlan?: string;
  originalPrice: number;
  price: number;
  totalPrice?: number;
  totalOriginalPrice?: number;
  perNightPrices?: number[];
  discountPct?: number | null;
  promotionId?: number | null;
  promoName?: string | null;
  promoNameEn?: string | null;
  promoType?: string | null;
  cancellationPolicy?: {
    type: string;
    refundDays?: number | null;
    name?: string | null;
  } | null;
}

interface RoomTypeItem {
  id: number;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  bedType?: string | null;
  maxOccupancy?: number;
  sizeSqm?: number | null;
  amenities?: string[];
  imageUrl?: string;
  images?: string[];
  available: number;
  isClosed?: boolean;
  ratePlans: RatePlanOption[];
}

interface AddOnItem {
  id: number;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  category?: string;
  price: string | number;
  pricingUnit?: string;
}

interface SelectedRoomEntry {
  room: RoomTypeItem;
  plan: RatePlanOption;
  quantity: number;
}

interface HotelBookingEngineProps {
  tenantSlug: string;
  hotelName: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
  initialPromoCode?: string;
}

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  const cls = 'h-3.5 w-3.5 shrink-0 text-slate-500';
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className={cls} />;
  if (lower.includes('air') || lower.includes('conditioning') || lower.includes('ac')) return <Wind className={cls} />;
  if (lower.includes('tv') || lower.includes('television')) return <Tv className={cls} />;
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('kettle')) return <Coffee className={cls} />;
  if (lower.includes('bath') || lower.includes('shower') || lower.includes('tub') || lower.includes('jacuzzi')) return <Bath className={cls} />;
  if (lower.includes('minibar') || lower.includes('fridge') || lower.includes('refrigerator')) return <Refrigerator className={cls} />;
  if (lower.includes('safe') || lower.includes('security')) return <Shield className={cls} />;
  if (lower.includes('balcony') || lower.includes('terrace') || lower.includes('patio')) return <Sun className={cls} />;
  if (lower.includes('view') || lower.includes('sea') || lower.includes('garden') || lower.includes('pool') || lower.includes('mountain')) return <Eye className={cls} />;
  if (lower.includes('key') || lower.includes('lock')) return <Lock className={cls} />;
  if (lower.includes('iron') || lower.includes('laundry') || lower.includes('wardrobe') || lower.includes('closet')) return <Shirt className={cls} />;
  if (lower.includes('sofa') || lower.includes('seating') || lower.includes('sitting') || lower.includes('living')) return <Armchair className={cls} />;
  if (lower.includes('phone') || lower.includes('telephone')) return <Phone className={cls} />;
  if (lower.includes('desk') || lower.includes('work') || lower.includes('lamp')) return <Lamp className={cls} />;
  if (lower.includes('sound') || lower.includes('speaker')) return <Volume2 className={cls} />;
  if (lower.includes('baby') || lower.includes('crib') || lower.includes('cot')) return <Baby className={cls} />;
  if (lower.includes('accessible') || lower.includes('wheelchair')) return <Accessibility className={cls} />;
  if (lower.includes('kitchen') || lower.includes('dining') || lower.includes('breakfast')) return <UtensilsCrossed className={cls} />;
  if (lower.includes('towel') || lower.includes('toiletries') || lower.includes('slippers') || lower.includes('robe') || lower.includes('hair')) return <Sparkles className={cls} />;
  return <Check className={cls} />;
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HotelBookingEngine({
  tenantSlug,
  hotelName,
  initialCheckIn,
  initialCheckOut,
  initialAdults = 2,
  initialChildren = 0,
  initialRooms = 1,
  initialPromoCode = '',
}: HotelBookingEngineProps) {
  const router = useRouter();
  const pathname = usePathname();

  const defaultDates = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    const dayAfter = new Date(now.getTime() + 2 * 86400000);
    return {
      checkIn: initialCheckIn || tomorrow.toISOString().slice(0, 10),
      checkOut: initialCheckOut || dayAfter.toISOString().slice(0, 10),
    };
  }, [initialCheckIn, initialCheckOut]);

  const [checkIn, setCheckIn] = useState(defaultDates.checkIn);
  const [checkOut, setCheckOut] = useState(defaultDates.checkOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [roomsCount, setRoomsCount] = useState(initialRooms);
  const [promoCode, setPromoCode] = useState(initialPromoCode);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [hotelData, setHotelData] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([]);
  const [addOns, setAddOns] = useState<AddOnItem[]>([]);
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null);

  // Room amenities expansion state
  const [expandedAmenities, setExpandedAmenities] = useState<Record<number, boolean>>({});

  // Room photo lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Multi-room selection state: key = `${room.id}_${plan.optionKey || plan.id}`
  const [selectedRooms, setSelectedRooms] = useState<Record<string, SelectedRoomEntry>>({});

  // Step state: 'rooms' | 'checkout'
  const [step, setStep] = useState<'rooms' | 'checkout'>('rooms');

  // Add-ons selection: addOnId -> quantity
  const [selectedAddOns, setSelectedAddOns] = useState<Record<number, number>>({});

  // Guest checkout form state
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'promptpay'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nights = useMemo(() => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  }, [checkIn, checkOut]);

  const fetchAvailability = useCallback(
    async (ci: string, co: string, code: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          slug: tenantSlug,
          checkIn: ci,
          checkOut: co,
        });
        if (code.trim()) {
          params.set('promoCode', code.trim());
        }
        const res = await fetch(`/api/booking/availability?${params.toString()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setHotelData(data.hotel || null);
          setRoomTypes(Array.isArray(data.roomTypes) ? data.roomTypes : []);
          setAddOns(Array.isArray(data.addOns) ? data.addOns : []);
          setPromoCodeValid(data.promoCodeValid ?? null);
          setSelectedRooms({});
        }
      } catch (err) {
        console.error('Failed to load room availability:', err);
      } finally {
        setLoading(false);
      }
    },
    [tenantSlug]
  );

  useEffect(() => {
    fetchAvailability(defaultDates.checkIn, defaultDates.checkOut, initialPromoCode);
  }, [fetchAvailability, defaultDates.checkIn, defaultDates.checkOut, initialPromoCode]);

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    if (val >= checkOut) {
      const nextDay = new Date(new Date(val).getTime() + 86400000).toISOString().slice(0, 10);
      setCheckOut(nextDay);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGuestDropdownOpen(false);
    setStep('rooms');
    fetchAvailability(checkIn, checkOut, promoCode);
  };

  const getRoomQtyUsed = (roomId: number, excludeKey?: string) => {
    return Object.entries(selectedRooms)
      .filter(([k, v]) => v.room.id === roomId && k !== excludeKey)
      .reduce((sum, [, v]) => sum + v.quantity, 0);
  };

  const updateRoomSelection = (room: RoomTypeItem, plan: RatePlanOption, qty: number) => {
    const key = `${room.id}_${plan.optionKey || plan.id}`;
    const maxAvail = Math.max(0, (room.available ?? 5) - getRoomQtyUsed(room.id, key));
    const clamped = Math.max(0, Math.min(qty, maxAvail));

    setSelectedRooms((prev) => {
      const next = { ...prev };
      if (clamped <= 0) {
        delete next[key];
      } else {
        next[key] = { room, plan, quantity: clamped };
      }
      return next;
    });
  };

  const selectedList = useMemo(() => Object.values(selectedRooms), [selectedRooms]);
  const totalSelectedRooms = useMemo(
    () => selectedList.reduce((sum, item) => sum + item.quantity, 0),
    [selectedList]
  );

  // Pricing calculations
  const currency = hotelData?.currency || 'THB';
  const formatPrice = (amount: number) => {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  };

  const roomSubtotal = useMemo(() => {
    return selectedList.reduce((sum, item) => {
      const planTotal =
        item.plan.totalPrice !== undefined
          ? Number(item.plan.totalPrice)
          : Number(item.plan.price) * nights;
      return sum + planTotal * item.quantity;
    }, 0);
  }, [selectedList, nights]);

  const roomOriginalTotal = useMemo(() => {
    return selectedList.reduce((sum, item) => {
      const origTotal =
        item.plan.totalOriginalPrice !== undefined
          ? Number(item.plan.totalOriginalPrice)
          : Number(item.plan.originalPrice || item.plan.price) * nights;
      return sum + origTotal * item.quantity;
    }, 0);
  }, [selectedList, nights]);

  const totalDiscount = Math.max(0, roomOriginalTotal - roomSubtotal);

  const getAddOnTotal = (addon: AddOnItem, qty: number) => {
    const unit = Number(addon.price) || 0;
    const totalGuests = adults + children;
    switch (addon.pricingUnit) {
      case 'per_night':
        return unit * nights * qty;
      case 'per_person':
        return unit * totalGuests * qty;
      case 'per_person_per_night':
        return unit * totalGuests * nights * qty;
      default:
        return unit * qty;
    }
  };

  const addOnsTotal = useMemo(() => {
    return Object.entries(selectedAddOns).reduce((sum, [idStr, qty]) => {
      if (qty <= 0) return sum;
      const addon = addOns.find((a) => a.id === Number(idStr));
      if (!addon) return sum;
      return sum + getAddOnTotal(addon, qty);
    }, 0);
  }, [selectedAddOns, addOns, nights, adults, children]);

  const grandTotal = roomSubtotal + addOnsTotal;
  const taxRate = Number(hotelData?.taxRate ?? 7);
  const serviceChargeRate = Number(hotelData?.serviceChargeRate ?? 10);
  const combinedRate = 1 + (taxRate + serviceChargeRate) / 100;
  const netBeforeTax = grandTotal / combinedRate;
  const serviceChargeAmount = Math.round(netBeforeTax * (serviceChargeRate / 100));
  const taxAmount = Math.round(grandTotal - netBeforeTax - serviceChargeAmount);

  const depositAmount = Math.round(grandTotal * 0.05 * 100) / 100;
  const balanceAtHotel = Math.round((grandTotal - depositAmount) * 100) / 100;

  const openRoomLightbox = (room: RoomTypeItem) => {
    const photos =
      Array.isArray(room.images) && room.images.length > 0
        ? room.images
        : room.imageUrl
          ? [room.imageUrl]
          : [];
    if (photos.length === 0) return;
    setLightboxPhotos(photos);
    setLightboxIdx(0);
    setLightboxTitle(room.nameEn || room.name);
    setLightboxOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedList.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const primaryItem = selectedList[0];
      const roomItemsPayload = selectedList.map((item) => {
        const itemTotal =
          item.plan.totalPrice !== undefined
            ? Number(item.plan.totalPrice) * item.quantity
            : Number(item.plan.price) * nights * item.quantity;
        const itemOrigTotal =
          item.plan.totalOriginalPrice !== undefined
            ? Number(item.plan.totalOriginalPrice) * item.quantity
            : Number(item.plan.originalPrice || item.plan.price) * nights * item.quantity;
        return {
          roomTypeId: Number(item.room.id),
          roomTypeName: item.room.name,
          roomTypeNameEn: item.room.nameEn || item.room.name,
          ratePlanId: Number(item.plan.id),
          ratePlanName: item.plan.name,
          ratePlanNameEn: item.plan.nameEn || item.plan.name,
          quantity: item.quantity,
          pricePerNight: Number(item.plan.price),
          originalPricePerNight: Number(item.plan.originalPrice || item.plan.price),
          totalPrice: itemTotal,
          totalOriginalPrice: itemOrigTotal,
          mealPlan: item.plan.mealPlan || 'room_only',
          promotionId: item.plan.promotionId ?? null,
          promotionName: item.plan.promoNameEn || item.plan.promoName || null,
          perNightPrices: item.plan.perNightPrices,
        };
      });

      const addOnsPayload = Object.entries(selectedAddOns)
        .filter(([, q]) => q > 0)
        .map(([idStr, qty]) => {
          const addon = addOns.find((a) => a.id === Number(idStr))!;
          return {
            addOnId: Number(idStr),
            quantity: qty,
            unitPrice: String(addon?.price || '0'),
            totalPrice: String(addon ? getAddOnTotal(addon, qty) : 0),
          };
        });

      const tenantPrefix = pathname?.startsWith('/sites/')
        ? `/sites/${pathname.split('/')[2]}`
        : '';

      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantPrefix,
          hotelId: Number(hotelData?.id || 1),
          roomTypeId: Number(primaryItem.room.id),
          ratePlanId: Number(primaryItem.plan.id),
          checkIn,
          checkOut,
          nights,
          adults,
          children,
          rooms: totalSelectedRooms,
          guestFirstName: guestFirstName.trim(),
          guestLastName: guestLastName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim() || undefined,
          specialRequests: specialRequests.trim() || undefined,
          roomTotal: String(roomSubtotal),
          addOnsTotal: String(addOnsTotal),
          discountAmount: String(totalDiscount),
          taxAmount: String(taxAmount),
          serviceCharge: String(serviceChargeAmount),
          totalAmount: String(grandTotal),
          promotionId: primaryItem.plan.promotionId ?? undefined,
          promoCodeUsed: promoCode.trim() || undefined,
          locale: 'en',
          paymentMethod,
          roomItems: roomItemsPayload,
          addOns: addOnsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create booking');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.bookingId) {
        router.push(`${tenantPrefix}/booking/confirmation/${data.bookingId}`);
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-28 pt-6 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* TOP SEARCH BAR ("Change Your Stay" matching Screenshot 2) */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="text-xs font-semibold text-slate-700 shrink-0 lg:mr-1">
              Change Your Stay
            </div>

            {/* Check-in */}
            <div className="relative flex-1 flex items-center gap-2.5 border border-slate-200 rounded-xl px-3.5 py-2 cursor-pointer hover:border-slate-300 transition-colors bg-white">
              <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-400 leading-tight">Check-in</div>
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {formatDisplayDate(checkIn)}
                </div>
              </div>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().slice(0, 10)}
                onClick={(e) => {
                  try {
                    if (typeof e.currentTarget.showPicker === 'function') {
                      e.currentTarget.showPicker();
                    }
                  } catch {}
                }}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
            </div>

            {/* Nights indicator */}
            <div className="text-center text-[11px] text-slate-400 font-medium shrink-0 px-1">
              {nights} {nights === 1 ? 'night' : 'nights'}
            </div>

            {/* Check-out */}
            <div className="relative flex-1 flex items-center gap-2.5 border border-slate-200 rounded-xl px-3.5 py-2 cursor-pointer hover:border-slate-300 transition-colors bg-white">
              <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-400 leading-tight">Check-out</div>
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {formatDisplayDate(checkOut)}
                </div>
              </div>
              <input
                type="date"
                value={checkOut}
                min={
                  checkIn
                    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().slice(0, 10)
                    : undefined
                }
                onClick={(e) => {
                  try {
                    if (typeof e.currentTarget.showPicker === 'function') {
                      e.currentTarget.showPicker();
                    }
                  } catch {}
                }}
                onChange={(e) => setCheckOut(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
            </div>

            {/* Guests & Rooms selector */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setGuestDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-3.5 py-2 text-left hover:border-slate-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 leading-tight">Guests</div>
                    <div className="text-xs font-semibold text-slate-800">
                      {adults + children} {adults + children === 1 ? 'guest' : 'guests'} - {roomsCount}{' '}
                      {roomsCount === 1 ? 'room' : 'rooms'}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                    guestDropdownOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {guestDropdownOpen && (
                <div className="absolute right-0 left-0 lg:w-64 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-4 z-30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">Adults</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-semibold">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">Children</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-semibold">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(Math.min(6, children + 1))}
                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">Rooms</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-semibold">{roomsCount}</span>
                      <button
                        type="button"
                        onClick={() => setRoomsCount(Math.min(10, roomsCount + 1))}
                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Promo Code (optional)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Availability Button */}
            <button
              type="submit"
              className="bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              Search Availability
            </button>
          </div>

          {promoCode.trim() && promoCodeValid !== null && (
            <div className="mt-2.5 text-xs flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              {promoCodeValid ? (
                <span className="text-emerald-600 font-medium">
                  Promo code &ldquo;{promoCode.toUpperCase()}&rdquo; applied!
                </span>
              ) : (
                <span className="text-amber-600">
                  Promo code &ldquo;{promoCode}&rdquo; is not valid or has expired. Showing best available rates.
                </span>
              )}
            </div>
          )}
        </form>

        {/* STEP 1: ROOM TYPES & RATE PLANS (Exact UI from Screenshot 2) */}
        {step === 'rooms' && (
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-5">Room Types</h2>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-slate-700" />
                <p className="text-xs text-slate-500">Checking real-time room availability & rates...</p>
              </div>
            ) : roomTypes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <BedDouble className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">No rooms available for the selected dates.</p>
                <p className="text-xs text-slate-400 mt-1">Please try selecting different check-in or check-out dates.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {roomTypes.map((room) => {
                  const roomPhotos =
                    Array.isArray(room.images) && room.images.length > 0
                      ? room.images
                      : room.imageUrl
                        ? [room.imageUrl]
                        : [];
                  const mainPhoto = roomPhotos[0] || '';
                  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
                  const isAmenitiesExpanded = !!expandedAmenities[room.id];
                  const visibleAmenities = isAmenitiesExpanded ? amenities : amenities.slice(0, 6);
                  const hiddenCount = Math.max(0, amenities.length - 6);
                  const isUnavailable = room.isClosed || room.available === 0;

                  return (
                    <div
                      key={room.id}
                      className={`rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                        isUnavailable ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Left Column: Room Image */}
                        <div
                          onClick={() => openRoomLightbox(room)}
                          className="md:w-[34%] bg-slate-100 relative min-h-[240px] md:min-h-[280px] cursor-pointer group overflow-hidden shrink-0"
                        >
                          {mainPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mainPhoto}
                              alt={room.nameEn || room.name}
                              className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BedDouble className="h-12 w-12 text-slate-300" />
                            </div>
                          )}

                          {roomPhotos.length > 1 && (
                            <span className="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                              {roomPhotos.length} photos
                            </span>
                          )}
                        </div>

                        {/* Right Column: Room Details + Rate Plans */}
                        <div className="md:w-[66%] p-5 sm:p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-lg font-serif font-bold text-slate-900">
                                  {room.nameEn || room.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                                  {room.bedType && (
                                    <span className="flex items-center gap-1 capitalize">
                                      <BedDouble className="h-3.5 w-3.5" /> {room.bedType}
                                    </span>
                                  )}
                                  {room.maxOccupancy && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3.5 w-3.5" /> {room.maxOccupancy} guests
                                    </span>
                                  )}
                                  {room.sizeSqm && Number(room.sizeSqm) > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Maximize2 className="h-3.5 w-3.5" /> {room.sizeSqm} sqm
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isUnavailable && (
                                <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                                  Unavailable
                                </span>
                              )}
                            </div>

                            {/* Amenities Pills */}
                            {amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {visibleAmenities.map((a, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md"
                                  >
                                    {getAmenityIcon(a)}
                                    {a}
                                  </span>
                                ))}
                                {hiddenCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedAmenities((prev) => ({
                                        ...prev,
                                        [room.id]: !prev[room.id],
                                      }))
                                    }
                                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer"
                                  >
                                    {isAmenitiesExpanded ? 'Show less' : `+${hiddenCount}`}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Rate Plans List */}
                          {room.ratePlans && room.ratePlans.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100 divide-y divide-slate-100">
                              {room.ratePlans.map((plan: RatePlanOption) => {
                                const hasDiscount =
                                  plan.discountPct && plan.originalPrice > plan.price;
                                const cancelPolicy = plan.cancellationPolicy;
                                const selectionKey = `${room.id}_${plan.optionKey || plan.id}`;
                                const currentQty = selectedRooms[selectionKey]?.quantity || 0;
                                const otherUsed = getRoomQtyUsed(room.id, selectionKey);
                                const maxForPlan = Math.max(0, (room.available ?? 5) - otherUsed);

                                return (
                                  <div
                                    key={plan.optionKey || plan.id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-1 last:pb-0 transition-colors ${
                                      currentQty > 0
                                        ? 'bg-slate-50 -mx-3 px-3 rounded-xl'
                                        : ''
                                    }`}
                                  >
                                    {/* Left: Plan Name + Discount Badge + Promo Name + Cancellation Policy */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-slate-900 text-sm">
                                          {plan.nameEn || plan.name}
                                        </span>
                                        {hasDiscount && (
                                          <span className="text-[11px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                                            -{plan.discountPct}%
                                          </span>
                                        )}
                                      </div>

                                      {(plan.promoNameEn || plan.promoName) && (
                                        <p className="text-xs text-orange-600 font-medium mt-0.5">
                                          {plan.promoNameEn || plan.promoName}
                                        </p>
                                      )}

                                      {cancelPolicy && (
                                        <p
                                          className={`text-xs mt-0.5 ${
                                            cancelPolicy.type === 'non_refundable'
                                              ? 'text-slate-400'
                                              : 'text-emerald-600 font-medium'
                                          }`}
                                        >
                                          {cancelPolicy.type === 'non_refundable'
                                            ? 'Non-refundable'
                                            : cancelPolicy.type === 'free'
                                              ? 'Free cancellation'
                                              : cancelPolicy.refundDays
                                                ? `Free cancellation ${cancelPolicy.refundDays}d before`
                                                : cancelPolicy.name || ''}
                                        </p>
                                      )}
                                    </div>

                                    {/* Right: Price & Room Quantity Selector */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                      <div className="text-left sm:text-right">
                                        {hasDiscount && (
                                          <span className="text-xs text-slate-400 line-through block">
                                            {formatPrice(Number(plan.originalPrice))}
                                          </span>
                                        )}
                                        <div>
                                          <span className="text-base sm:text-lg font-bold text-slate-900">
                                            {formatPrice(Number(plan.price))}
                                          </span>
                                          <span className="text-xs text-slate-400 ml-0.5">
                                            /night
                                          </span>
                                        </div>
                                      </div>

                                      {!isUnavailable && (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            disabled={currentQty <= 0}
                                            onClick={() =>
                                              updateRoomSelection(room, plan, currentQty - 1)
                                            }
                                            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                          >
                                            -
                                          </button>
                                          <select
                                            value={currentQty}
                                            onChange={(e) =>
                                              updateRoomSelection(
                                                room,
                                                plan,
                                                parseInt(e.target.value, 10) || 0
                                              )
                                            }
                                            className={`h-8 rounded-lg border px-2 text-xs font-medium bg-white focus:outline-none cursor-pointer ${
                                              currentQty > 0
                                                ? 'border-slate-900 text-slate-900 font-semibold'
                                                : 'border-slate-200 text-slate-600'
                                            }`}
                                          >
                                            {Array.from(
                                              { length: maxForPlan + 1 },
                                              (_, i) => (
                                                <option key={i} value={i}>
                                                  {i} {i === 1 ? 'room' : 'rooms'}
                                                </option>
                                              )
                                            )}
                                          </select>
                                          <button
                                            type="button"
                                            disabled={currentQty >= maxForPlan}
                                            onClick={() =>
                                              updateRoomSelection(room, plan, currentQty + 1)
                                            }
                                            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                          >
                                            +
                                          </button>

                                          {currentQty > 0 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setStep('checkout');
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                              }}
                                              className="ml-1 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold h-8 px-3 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                              Proceed
                                              <ArrowRight className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: GUEST INFO & CHECKOUT (Rendered directly inside Hotel Website) */}
        {step === 'checkout' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep('rooms')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Room Selection
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Add-ons + Guest Form + Payment Method */}
              <form onSubmit={handleBookingSubmit} className="lg:col-span-2 space-y-6">
                {/* Optional Add-ons Section */}
                {addOns.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-base font-serif font-bold text-slate-900 mb-1">
                      Enhance Your Stay (Optional Add-ons)
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Select any extra services you would like to include with your reservation.
                    </p>
                    <div className="divide-y divide-slate-100">
                      {addOns.map((addon) => {
                        const qty = selectedAddOns[addon.id] || 0;
                        return (
                          <div
                            key={addon.id}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {addon.nameEn || addon.name}
                              </div>
                              {(addon.descriptionEn || addon.description) && (
                                <p className="text-xs text-slate-500">
                                  {addon.descriptionEn || addon.description}
                                </p>
                              )}
                              <div className="text-xs font-semibold text-slate-700 mt-0.5">
                                {formatPrice(Number(addon.price))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedAddOns((prev) => ({
                                    ...prev,
                                    [addon.id]: Math.max(0, (prev[addon.id] || 0) - 1),
                                  }))
                                }
                                className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">{qty}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedAddOns((prev) => ({
                                    ...prev,
                                    [addon.id]: (prev[addon.id] || 0) + 1,
                                  }))
                                }
                                className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Guest Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-900">
                      Guest Information
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please enter the primary guest details for your reservation at {hotelName}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Instant booking confirmation will be sent to this email.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+66 81 234 5678"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Early check-in, high floor, airport transfer inquiry, dietary needs..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Payment Method Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-serif font-bold text-slate-900">
                    Select Payment Method
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-slate-800 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Credit / Debit Card
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Visa, Mastercard, JCB, AMEX
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        paymentMethod === 'promptpay'
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <QrCode className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          PromptPay QR Code
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Scan QR with any Thai banking app
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* 5% Deposit Guarantee Info */}
                  <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-4 space-y-1.5 text-xs">
                    <div className="font-semibold text-emerald-900 flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      Pay Only 5% Deposit Today to Guarantee Your Room
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      Pay only <strong>{formatPrice(depositAmount)}</strong> (5% deposit) online now to lock in your direct booking rate. The remaining balance of{' '}
                      <strong>{formatPrice(balanceAtHotel)}</strong> (95%) is payable directly at the hotel upon check-in.
                    </p>
                  </div>

                  {submitError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0f172a] hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing Reservation...
                      </>
                    ) : (
                      <>
                        Confirm & Pay 5% Deposit ({formatPrice(depositAmount)})
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: Booking Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24 space-y-4">
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Booking Summary
                </h3>

                <div className="text-xs space-y-2 pb-4 border-b border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hotel</span>
                    <span className="font-semibold text-slate-900">{hotelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-medium text-slate-800">{formatDisplayDate(checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-out</span>
                    <span className="font-medium text-slate-800">{formatDisplayDate(checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium text-slate-800">
                      {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guests</span>
                    <span className="font-medium text-slate-800">
                      {adults} Adults{children > 0 ? `, ${children} Children` : ''}
                    </span>
                  </div>
                </div>

                {/* Selected Rooms Breakdown */}
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-700">Selected Rooms</div>
                  {selectedList.map((item) => {
                    const itemTotal =
                      item.plan.totalPrice !== undefined
                        ? Number(item.plan.totalPrice) * item.quantity
                        : Number(item.plan.price) * nights * item.quantity;
                    return (
                      <div
                        key={`${item.room.id}_${item.plan.optionKey}`}
                        className="text-xs bg-slate-50 rounded-xl p-3 space-y-1"
                      >
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>
                            {item.quantity}× {item.room.nameEn || item.room.name}
                          </span>
                          <span>{formatPrice(itemTotal)}</span>
                        </div>
                        <div className="text-slate-500">
                          {item.plan.nameEn || item.plan.name}
                        </div>
                        {(item.plan.promoNameEn || item.plan.promoName) && (
                          <div className="text-orange-600 font-medium">
                            {item.plan.promoNameEn || item.plan.promoName}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs">
                  {totalDiscount > 0 && (
                    <>
                      <div className="flex justify-between text-slate-400">
                        <span>Original Room Price</span>
                        <span className="line-through">{formatPrice(roomOriginalTotal)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Promotion Discount</span>
                        <span>-{formatPrice(totalDiscount)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Room Subtotal ({nights} nights)</span>
                    <span className="font-medium text-slate-900">{formatPrice(roomSubtotal)}</span>
                  </div>
                  {addOnsTotal > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Add-on Services</span>
                      <span className="font-medium text-slate-900">{formatPrice(addOnsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Includes Service Charge ({serviceChargeRate}%) & VAT ({taxRate}%)</span>
                    <span>{formatPrice(serviceChargeAmount + taxAmount)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>

                  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex justify-between items-center text-emerald-800 font-bold">
                    <span>Pay Now (5% Deposit)</span>
                    <span className="text-sm">{formatPrice(depositAmount)}</span>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex justify-between items-center text-amber-900 font-semibold">
                    <span>Balance at Hotel (95%)</span>
                    <span>{formatPrice(balanceAtHotel)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR WHEN ROOMS ARE SELECTED IN STEP 1 */}
      {step === 'rooms' && totalSelectedRooms > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                  {totalSelectedRooms} {totalSelectedRooms === 1 ? 'room' : 'rooms'} selected
                </span>
                <span className="text-xs text-slate-500">
                  for {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 max-h-14 overflow-y-auto">
                {selectedList.map((item) => (
                  <span
                    key={`${item.room.id}_${item.plan.optionKey}`}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md"
                  >
                    <strong>{item.quantity}×</strong> {item.room.nameEn || item.room.name}
                    <span className="text-slate-500">
                      ({item.plan.nameEn || item.plan.name})
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
              <div className="text-left sm:text-right">
                <div className="text-[11px] text-slate-500">
                  Total ({nights} {nights === 1 ? 'night' : 'nights'})
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {formatPrice(roomSubtotal)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRooms({})}
                  className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('checkout');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold px-5 py-3 rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  Next: Guest Info
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROOM PHOTOS LIGHTBOX MODAL */}
      {lightboxOpen && lightboxPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white mb-3">
              <div className="text-sm font-medium">
                {lightboxTitle} ({lightboxIdx + 1} / {lightboxPhotos.length})
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative w-full aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxPhotos[lightboxIdx]}
                alt={`${lightboxTitle} photo ${lightboxIdx + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {lightboxPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIdx(
                        (lightboxIdx - 1 + lightboxPhotos.length) % lightboxPhotos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIdx((lightboxIdx + 1) % lightboxPhotos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
