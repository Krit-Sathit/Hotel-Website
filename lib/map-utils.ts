/**
 * Smart Google Maps URL, Coordinate & Schema.org Geo Utilities
 * - Allows hotel owners to paste raw GPS coordinates ("8.0952, 98.3124"), full <iframe> tags,
 *   or standard Google Maps URLs, automatically converting them into valid embed URLs.
 * - Generates direct GPS coordinate navigation links (`destination=lat,lng`) so guests are NEVER
 *   misrouted to a wrong/duplicate Google Business Profile pin.
 */

export interface GeoCoords {
  lat: number;
  lng: number;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/**
 * Extracts exact { lat, lng } coordinates from raw text, Google Maps URLs, or iframe embed URLs.
 */
export function extractLatLng(raw?: string | null): GeoCoords | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;

  // 1. Raw coordinate pair: "8.0911648, 98.3099266"
  const rawPair = text.match(/^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/);
  if (rawPair) {
    const lat = parseFloat(rawPair[1]);
    const lng = parseFloat(rawPair[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. Google Maps protobuf embed !3dLAT!4dLNG or !2dLNG!3dLAT
  const pb3d4d = text.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/);
  if (pb3d4d) {
    const lat = parseFloat(pb3d4d[1]);
    const lng = parseFloat(pb3d4d[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }
  const pb2d3d = text.match(/!2d(-?\d{1,3}\.\d+)!3d(-?\d{1,2}\.\d+)/);
  if (pb2d3d) {
    const lng = parseFloat(pb2d3d[1]);
    const lat = parseFloat(pb2d3d[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Query params ?q=LAT,LNG or &query=LAT,LNG or &destination=LAT,LNG or &ll=LAT,LNG
  const qMatch = text.match(/[?&](?:q|query|destination|ll)=(-?\d{1,2}\.\d+)(?:%2C|,)(-?\d{1,3}\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 4. Standard Google Maps URL /@LAT,LNG,17z
  const atMatch = text.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

/**
 * Converts any pasted iframe snippet, Google Maps URL, or "lat, lng" string into a clean embeddable iframe src.
 */
export function normalizeMapEmbedUrl(raw?: string | null, fallbackAddress?: string): string {
  const input = (raw || '').trim();

  if (input) {
    // Extract src="..." if full <iframe ...> HTML was pasted
    const iframeSrc = input.match(/src=["']([^"']+)["']/i);
    const candidate = (iframeSrc ? iframeSrc[1] : input).replace(/&amp;/g, '&').trim();

    // Already a valid Google Maps embed URL
    if (
      candidate.includes('/maps/embed') ||
      candidate.includes('output=embed')
    ) {
      return candidate;
    }

    // Extract coordinates if present in raw text or standard Google Maps URL
    const coords = extractLatLng(candidate);
    if (coords) {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`;
    }

    // If user entered a custom address or place text (not a non-embeddable maps.app.goo.gl shortlink)
    if (!candidate.startsWith('http')) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(candidate)}&z=16&output=embed`;
    }
  }

  if (fallbackAddress?.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&z=16&output=embed`;
  }

  return '';
}

/**
 * Builds an accurate Google Maps Directions URL.
 * Prioritizes exact GPS coordinates (`destination=lat,lng`) when available so guests are never routed
 * to a wrong/duplicate Google Business Profile pin.
 */
export function buildGoogleDirectionsUrl(
  mapUrl?: string | null,
  hotelName?: string,
  address?: string
): string {
  const coords = extractLatLng(mapUrl);
  if (coords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  }
  const query = `${address || hotelName || ''}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Formats Thai phone numbers into international E.164/RFC format for Google Schema.org JSON-LD verification.
 */
export function formatPhoneForSchema(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('0') && digits.length >= 9 && digits.length <= 10) {
    return `+66${digits.slice(1)}`;
  }
  return phone.trim();
}
