export function getBookingEngineUrl(hotelSlug: string, tenantPrefix?: string): string {
  if (tenantPrefix !== undefined) {
    return `${tenantPrefix}/book`;
  }
  const cleanSlug = (hotelSlug || '').trim();
  return cleanSlug ? `/sites/${encodeURIComponent(cleanSlug)}/book` : '/book';
}

export function isPlatformHost(rawHost?: string | null): boolean {
  const host = (rawHost || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
  if (!host) return true;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === 'flowweb.flowhubhotel.com' ||
    host === 'flowstay.live' ||
    host === 'www.flowstay.live' ||
    host.endsWith('.flowhubhotel.com') ||
    host.endsWith('.flowstay.live') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.localhost')
  );
}

export function resolveTenantPrefix(rawHost: string | null | undefined, tenant: string): string {
  return isPlatformHost(rawHost) ? `/sites/${tenant}` : '';
}

export function isHostelProperty(...signals: Array<string | null | undefined>): boolean {
  return signals.some((val) => typeof val === 'string' && /hostel|โฮสเทล/i.test(val));
}
