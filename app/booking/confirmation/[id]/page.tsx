import React, { Suspense } from 'react';
import BookingConfirmationView from '@/components/booking/booking-confirmation-view';

export const dynamic = 'force-dynamic';

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function RootBookingConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <BookingConfirmationView bookingId={id} />
    </Suspense>
  );
}
