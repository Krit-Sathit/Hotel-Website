export function getBookingEngineUrl(hotelSlug: string, tenantPrefix?: string): string {
  if (tenantPrefix !== undefined) {
    return `${tenantPrefix}/book`;
  }
  const cleanSlug = (hotelSlug || '').trim();
  return cleanSlug ? `/sites/${encodeURIComponent(cleanSlug)}/book` : '/book';
}
