export function getBookingEngineUrl(hotelSlug: string, tenantPrefix?: string): string {
  if (tenantPrefix !== undefined) {
    return `${tenantPrefix}/book`;
  }
  const cleanSlug = (hotelSlug || '').trim();
  return cleanSlug ? `/sites/${encodeURIComponent(cleanSlug)}/book` : '/book';
}

export function isHostelProperty(...signals: Array<string | null | undefined>): boolean {
  return signals.some((val) => typeof val === 'string' && /hostel|โฮสเทล/i.test(val));
}
