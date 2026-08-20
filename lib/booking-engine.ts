const FLOWSTAY_BOOKING_HOST = 'https://flowstay.live';

// The marketing site uses "the-par-phuket", while the live FlowStay booking
// engine identifies this property as "theparphuket".
const flowStaySlugs: Record<string, string> = {
  'the-par-phuket': 'theparphuket',
};

export function getBookingEngineUrl(hotelSlug: string): string {
  const bookingSlug = flowStaySlugs[hotelSlug] || hotelSlug;
  return `${FLOWSTAY_BOOKING_HOST}/hotels/${encodeURIComponent(bookingSlug)}`;
}
