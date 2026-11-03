'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  User,
  Mail,
  BedDouble,
  Tag,
  Percent,
  ArrowRight,
} from 'lucide-react';

interface BookingConfirmationViewProps {
  bookingId: string;
}

export default function BookingConfirmationView({ bookingId }: BookingConfirmationViewProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const paymentParam = searchParams.get('payment');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(paymentParam === 'success');
  const hasVerified = useRef(false);

  const tenantPrefix = pathname?.startsWith('/sites/')
    ? `/sites/${pathname.split('/')[2]}`
    : '';

  const loadBooking = async () => {
    try {
      const res = await fetch(`/api/booking/${bookingId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking || null);
        return data.booking;
      }
    } catch (e) {
      console.error('Error loading booking:', e);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const init = async () => {
      const current = await loadBooking();

      if (paymentParam === 'success' && !hasVerified.current) {
        hasVerified.current = true;
        setVerifying(true);
        try {
          await fetch(`/api/booking/${bookingId}`, { method: 'POST' });
          await loadBooking();
        } catch (err) {
          console.error('Payment verification error:', err);
        } finally {
          setVerifying(false);
        }
      }

      if (paymentParam === 'success' && (!current || current.status !== 'confirmed')) {
        timer = setInterval(async () => {
          const updated = await loadBooking();
          if (updated?.status === 'confirmed' || updated?.paymentStatus === 'paid') {
            if (timer) clearInterval(timer);
          }
        }, 3000);
      }
    };

    init();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [bookingId, paymentParam]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
        <p className="text-xs text-slate-500">Loading your reservation details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[50vh] max-w-xl mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Booking Not Found</h1>
        <p className="text-sm text-slate-500">
          We could not find a reservation matching this reference.
        </p>
        <Link
          href={tenantPrefix || '/'}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-5 py-3 rounded-xl"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  const isPaymentCancelled = paymentParam === 'cancelled';
  const isConfirmed = booking.status === 'confirmed' || booking.paymentStatus === 'paid';
  const currency = booking.currency || 'THB';
  const formatPrice = (val: number) => `${currency} ${Math.round(val).toLocaleString()}`;
  const totalAmount = Number(booking.totalAmount) || 0;
  const deposit = Math.round(totalAmount * 0.05 * 100) / 100;
  const remaining = Math.round((totalAmount - deposit) * 100) / 100;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 text-slate-900">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Status Header */}
        <div>
          {isPaymentCancelled ? (
            <>
              <div className="h-20 w-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-amber-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                Payment Not Completed
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Your payment was cancelled. You can return to the booking page to complete your reservation.
              </p>
            </>
          ) : verifying && !isConfirmed ? (
            <>
              <div className="h-20 w-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Loader2 className="h-10 w-10 text-slate-800 animate-spin" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-slate-900">
                Confirming Your Payment...
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Please wait a moment while we confirm your reservation.
              </p>
            </>
          ) : (
            <>
              <div className="h-20 w-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                Booking Confirmed!
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Thank you for booking directly with us. Your reservation is confirmed.
              </p>
            </>
          )}
        </div>

        {/* Confirmation Number Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Confirmation Number
          </p>
          <p className="text-3xl font-mono font-bold text-slate-900 tracking-widest mt-1">
            #{booking.confirmationNumber}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                booking.status === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : booking.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
              }`}
            >
              {booking.status}
            </span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                booking.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Payment: {booking.paymentStatus}
            </span>
          </div>
        </div>

        {/* Reservation Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left space-y-4">
          <h3 className="font-serif font-bold text-lg text-slate-900">Reservation Details</h3>

          <div className="flex flex-wrap gap-2">
            {(booking.roomTypeNameEn || booking.roomTypeName) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                <BedDouble className="h-4 w-4" />
                {booking.roomTypeNameEn || booking.roomTypeName}
              </span>
            )}
            {(booking.ratePlanNameEn || booking.ratePlanName) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg">
                <Tag className="h-4 w-4" />
                {booking.ratePlanNameEn || booking.ratePlanName}
              </span>
            )}
            {(booking.promotionNameEn || booking.promotionName) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg">
                <Percent className="h-4 w-4" />
                {booking.promotionNameEn || booking.promotionName}
              </span>
            )}
          </div>

          {Array.isArray(booking.roomItems) && booking.roomItems.length > 1 && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-600">Booked Rooms:</div>
              {booking.roomItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span>
                    <strong>
                      {item.quantity}× {item.roomTypeNameEn || item.roomTypeName}
                    </strong>{' '}
                    <span className="text-slate-500">
                      ({item.ratePlanNameEn || item.ratePlanName})
                    </span>
                  </span>
                  <span className="font-medium">{formatPrice(Number(item.totalPrice) || 0)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <p className="text-slate-400">Check-in</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                {String(booking.checkIn).slice(0, 10)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Check-out</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                {String(booking.checkOut).slice(0, 10)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400">Guest Name</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {booking.guestFirstName} {booking.guestLastName}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Email</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {booking.guestEmail}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-base text-slate-900">
              <span>Total Reservation Amount</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex justify-between items-center font-semibold text-emerald-800">
              <span>✓ 5% Deposit (Online)</span>
              <span>{formatPrice(deposit)}</span>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex justify-between items-center font-bold text-amber-900">
              <span>Balance Due at Hotel (at check-in)</span>
              <span className="text-sm">{formatPrice(remaining)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          A confirmation email with your booking voucher has been sent to{' '}
          <strong>{booking.guestEmail}</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={tenantPrefix || '/'}
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            Back to Hotel Home
          </Link>
          <Link
            href={`${tenantPrefix}/book`}
            className="px-6 py-3 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors"
          >
            Book Another Stay
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
