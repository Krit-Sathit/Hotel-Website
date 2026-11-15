export type HighlightIconKey =
  | 'flag'
  | 'trees'
  | 'dumbbell'
  | 'presentation'
  | 'shopping'
  | 'car'
  | 'waves'
  | 'utensils'
  | 'plane'
  | 'wifi'
  | 'sparkles'
  | 'mappin';

export interface HighlightStripItem {
  icon: HighlightIconKey;
  title: string;
  subtitle: string;
}

export const HIGHLIGHT_ICON_OPTIONS: Array<{
  key: HighlightIconKey;
  label: string;
}> = [
  { key: 'flag', label: '⛳ Golf / Sport (Flag)' },
  { key: 'trees', label: '🌲 Nature & Wellness (Trees)' },
  { key: 'dumbbell', label: '🏋️ Muay Thai / Fitness (Dumbbell)' },
  { key: 'presentation', label: '🖥️ Meetings & Events (Presentation)' },
  { key: 'shopping', label: '🛍️ Shopping / Mall (Shopping Bag)' },
  { key: 'car', label: '🚗 Spacious Parking (Car)' },
  { key: 'waves', label: '🌊 Pool / Beachfront (Waves)' },
  { key: 'utensils', label: '🍽️ Dining & Restaurant (Utensils)' },
  { key: 'plane', label: '✈️ Near Airport (Plane)' },
  { key: 'wifi', label: '📶 High-Speed Wi-Fi (Wifi)' },
  { key: 'sparkles', label: '✨ Spa & Boutique (Sparkles)' },
  { key: 'mappin', label: '📍 Prime Location (Map Pin)' },
];

export function isTheParPhuketHotel(slug?: string | null, name?: string | null): boolean {
  const s = (slug || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const n = (name || '').trim().toLowerCase();
  return s === 'theparphuket' || n.includes('the par phuket');
}

export function isPhuketAirportVillaHotel(slug?: string | null, name?: string | null): boolean {
  const s = (slug || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const n = (name || '').trim().toLowerCase();
  return s === 'phuketairportvilla' || n.includes('phuket airport villa');
}

export const THE_PAR_PHUKET_DEFAULT_HIGHLIGHTS: HighlightStripItem[] = [
  {
    icon: 'flag',
    title: 'Golf Course Setting',
    subtitle: 'Surrounded by Phuket Country Club',
  },
  {
    icon: 'trees',
    title: 'Nature & Wellness',
    subtitle: 'Near Bang Wad Reservoir',
  },
  {
    icon: 'dumbbell',
    title: 'Muay Thai Training',
    subtitle: 'On-site Thai Boxing Camp',
  },
  {
    icon: 'presentation',
    title: 'Meetings & Events',
    subtitle: 'Meeting & Conference Facilities',
  },
  {
    icon: 'shopping',
    title: 'Convenient Location',
    subtitle: 'Near Central Festival Phuket',
  },
  {
    icon: 'car',
    title: 'Spacious Parking',
    subtitle: 'Convenient On-site Parking',
  },
];

export const THE_PAR_PHUKET_DEFAULT_SEO = {
  seo_title:
    'The Par Phuket | Golf & Lifestyle Hotel in Phuket (โรงแรมในสนามกอล์ฟภูเก็ต กะทู้)',
  seo_description:
    'Stay at The Par Phuket (เดอะ พาร์ ภูเก็ต), a golf & lifestyle hotel in Kathu surrounded by Phuket Country Club Golf Course (โรงแรมติดสนามกอล์ฟ ภูเก็ต คันทรี คลับ). Enjoy scenic golf views, Muay Thai training, meeting facilities, and easy access to Central Phuket.',
};

export function resolveHotelHighlights(
  savedHighlights: unknown,
  slug?: string | null,
  name?: string | null
): HighlightStripItem[] {
  if (Array.isArray(savedHighlights)) {
    return savedHighlights
      .filter(
        (item: any) =>
          item &&
          typeof item === 'object' &&
          (String(item.title || '').trim() || String(item.subtitle || '').trim())
      )
      .map((item: any) => ({
        icon: (item.icon as HighlightIconKey) || 'sparkles',
        title: String(item.title || '').trim(),
        subtitle: String(item.subtitle || '').trim(),
      }));
  }
  if (isTheParPhuketHotel(slug, name)) {
    return THE_PAR_PHUKET_DEFAULT_HIGHLIGHTS;
  }
  return [];
}

export function resolveHotelSeo(hotel?: {
  name?: string;
  slug?: string;
  address?: string;
  phone?: string;
  social_links?: {
    seo_title?: string;
    seo_description?: string;
  };
} | null): { title: string; description: string } {
  const customTitle = hotel?.social_links?.seo_title?.trim();
  const customDesc = hotel?.social_links?.seo_description?.trim();

  if (isTheParPhuketHotel(hotel?.slug, hotel?.name)) {
    return {
      title: customTitle || THE_PAR_PHUKET_DEFAULT_SEO.seo_title,
      description: customDesc || THE_PAR_PHUKET_DEFAULT_SEO.seo_description,
    };
  }

  if (isPhuketAirportVillaHotel(hotel?.slug, hotel?.name)) {
    return {
      title:
        customTitle ||
        'Phuket Airport Villa – Luxury Villa & Resort | ที่พักใกล้สนามบินภูเก็ต',
      description:
        customDesc ||
        'Phuket Airport Villa – วิลล่าส่วนตัวบรรยากาศร่มรื่นใกล้สนามบินภูเก็ต พร้อมสระว่ายน้ำกลางแจ้ง จองตรงรับราคาพิเศษ',
    };
  }

  const hotelName = hotel?.name || 'Hotel';
  const contactSnippet = [
    hotel?.address ? `Address: ${hotel.address}` : '',
    hotel?.phone ? `Tel: ${hotel.phone}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    title: customTitle || `${hotelName} — Official Hotel Website`,
    description:
      customDesc ||
      (contactSnippet
        ? `Official website for ${hotelName}. ${contactSnippet}. Book direct for the best guaranteed rates.`
        : `Official website for ${hotelName}. Book direct for the best guaranteed rates.`),
  };
}
