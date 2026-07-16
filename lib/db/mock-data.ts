import fs from 'fs';
import path from 'path';
import {
  isSupabaseConfigured,
  getSupabaseHotelBySlug,
  getSupabaseHotelByDomain,
  getSupabaseAllHotels,
  getSupabaseHeroSlides,
  getSupabaseHomepageSections,
  getSupabaseRooms,
  getSupabaseRoomById,
  getSupabasePromotions,
  getSupabaseGalleryPhotos,
  getSupabaseBlogPosts,
  getSupabaseBlogPostBySlug,
  getSupabaseContactMessages,
  saveSupabaseContactMessage,
  updateSupabaseHotelGeneralSettings,
  updateSupabaseHotelTheme,
  updateSupabaseHomepageLayout,
  trackSupabaseAnalyticsEvent,
  getSupabaseAnalyticsOverview,
  registerSupabaseNewHotel,
  getSupabaseAllPromotions,
  saveSupabaseHeroSlides,
  saveSupabaseRoom,
  deleteSupabaseRoom,
  saveSupabasePromotion,
  deleteSupabasePromotion,
  deleteSupabaseHotel,
  getSupabaseMediaItems,
  saveSupabaseMediaItem,
  updateSupabaseMediaItemCategory,
  deleteSupabaseMediaItem
} from './supabase-client';

// Define TS Interfaces for our database schema
export interface HotelTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  button_style: 'square' | 'rounded' | 'pill';
  border_radius: string;
  font_family: string;
  dark_mode: boolean;
  header_layout: 'centered' | 'minimal' | 'luxury';
  footer_layout: 'simple' | 'luxury' | 'columns';
  animation_style: 'fade' | 'slide' | 'none';
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  status: 'active' | 'suspended' | 'draft';
  logo_url: string | null;
  favicon_url: string | null;
  email: string;
  phone: string;
  address: string;
  google_map_url: string;
  social_links: {
    facebook: string;
    instagram: string;
    whatsapp: string;
    twitter: string;
  };
  theme: HotelTheme;
  homepage_layout: string[];
}

export interface HeroSlide {
  id: string;
  hotel_id: string;
  image_url: string;
  video_url?: string;
  headline: string;
  subheadline: string;
  button_text: string;
  button_link: string;
  overlay_color: string;
  overlay_opacity: number;
  sort_order: number;
}

export interface HomepageSection {
  id: string;
  hotel_id: string;
  section_type: string;
  content: any;
  is_enabled: boolean;
  sort_order: number;
}

export interface Room {
  id: string;
  hotel_id: string;
  name: string;
  description: string;
  gallery: string[];
  amenities: string[];
  max_guests: number;
  room_size: number;
  bed_type: string;
  price?: number;
  book_now_url?: string;
  sort_order: number;
}

export interface Promotion {
  id: string;
  hotel_id: string;
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  promo_code?: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
}

export interface GalleryPhoto {
  id: string;
  hotel_id: string;
  image_url: string;
  category: string;
  alt_text?: string;
  sort_order: number;
}

export interface BlogPost {
  id: string;
  hotel_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  hotel_id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

export interface MediaItem {
  id: string;
  hotel_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  folder: string;
  sort_order?: number;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  hotel_id: string;
  event_type: 'page_view' | 'booking_click' | 'widget_use';
  page_path: string;
  room_id?: string;
  referrer?: string;
  created_at: string;
}

export interface DatabaseState {
  hotels: Hotel[];
  hero_slides: HeroSlide[];
  homepage_sections: HomepageSection[];
  rooms: Room[];
  promotions: Promotion[];
  gallery_photos: GalleryPhoto[];
  blog_posts: BlogPost[];
  contact_messages: ContactMessage[];
  media_library: MediaItem[];
  analytics_events: AnalyticsEvent[];
}

// Default luxury data for Hotel A
const defaultHotelA: Hotel = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'The Grand Horizon Resort & Spa',
  slug: 'hotel-a',
  custom_domain: 'grandhorizon.com',
  status: 'active',
  logo_url: null,
  favicon_url: null,
  email: 'stay@grandhorizon.com',
  phone: '+1 (555) 123-4567',
  address: '100 Ocean Vista Drive, Malibu, California',
  google_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105757.26629215006!2d-118.84711675820312!3d34.00768999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2a4c803d3f947%3A0xd6099df3d2e26b1!2sMalibu%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
  social_links: {
    facebook: 'https://facebook.com/grandhorizon',
    instagram: 'https://instagram.com/grandhorizon',
    whatsapp: 'https://wa.me/15551234567',
    twitter: 'https://twitter.com/grandhorizon'
  },
  theme: {
    primary_color: '#1a1105', // Muted dark luxury brown
    secondary_color: '#433020',
    accent_color: '#c5a880', // Premium Champagne Gold
    background_color: '#fcfaf6', // Creamy luxury white
    text_color: '#2a1f15',
    button_style: 'square',
    border_radius: '0px',
    font_family: 'Cormorant Garamond',
    dark_mode: false,
    header_layout: 'luxury',
    footer_layout: 'luxury',
    animation_style: 'fade'
  },
  homepage_layout: ['hero', 'about', 'rooms', 'facilities', 'promotions', 'gallery', 'testimonials', 'contact']
};

// Default boutique/modern data for Hotel B
const defaultHotelB: Hotel = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Urban Nest Hotel',
  slug: 'hotel-b',
  custom_domain: 'urbannest.com',
  status: 'active',
  logo_url: null,
  favicon_url: null,
  email: 'stay@urbannest.com',
  phone: '+1 (555) 987-6543',
  address: '456 Broadway, Soho, New York City',
  google_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.2798606411516!2d-74.00194882343468!3d40.72396347139157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2598a58a69d67%3A0x6d5e1654ff456dc6!2sSoHo%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
  social_links: {
    facebook: 'https://facebook.com/urbannest',
    instagram: 'https://instagram.com/urbannest',
    whatsapp: 'https://wa.me/15559876543',
    twitter: 'https://twitter.com/urbannest'
  },
  theme: {
    primary_color: '#0f172a', // Charcoal slate
    secondary_color: '#334155',
    accent_color: '#0f766e', // Urban Teal
    background_color: '#f8fafc', // Modern cold white
    text_color: '#0f172a',
    button_style: 'pill',
    border_radius: '9999px',
    font_family: 'Outfit',
    dark_mode: false,
    header_layout: 'minimal',
    footer_layout: 'simple',
    animation_style: 'slide'
  },
  homepage_layout: ['hero', 'about', 'rooms', 'promotions', 'facilities', 'gallery', 'contact']
};

const getInitialSlides = (): HeroSlide[] => [
  {
    id: 's1',
    hotel_id: defaultHotelA.id,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
    headline: 'Experience Coastal Luxury',
    subheadline: 'An oasis of serenity overlooking the Malibu coastline.',
    button_text: 'Discover Suites',
    button_link: '#rooms',
    overlay_color: '#000000',
    overlay_opacity: 0.35,
    sort_order: 0
  },
  {
    id: 's2',
    hotel_id: defaultHotelA.id,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    headline: 'Indulge in Ultimate Relaxation',
    subheadline: 'Award-winning spa therapies tailored to your wellness journey.',
    button_text: 'Explore Spa',
    button_link: '#spa',
    overlay_color: '#000000',
    overlay_opacity: 0.4,
    sort_order: 1
  },
  {
    id: 's3',
    hotel_id: defaultHotelB.id,
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
    headline: 'Sleek. Modern. Soho.',
    subheadline: 'Your perfect design sanctuary in the heart of New York City.',
    button_text: 'View Rooms',
    button_link: '#rooms',
    overlay_color: '#000000',
    overlay_opacity: 0.4,
    sort_order: 0
  }
];

const getInitialRooms = (): Room[] => [
  {
    id: 'r1',
    hotel_id: defaultHotelA.id,
    name: 'Oceanfront King Suite',
    description: 'Breathe in the fresh Pacific breeze from your private terrace. This expansive suite features a plush king bed, deep soaking tub, and custom hardwood finishings.',
    gallery: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Ocean View', 'Private Terrace', 'Soaking Tub', 'Complimentary Wi-Fi', 'Nespresso Machine', '24h Room Service'],
    max_guests: 2,
    room_size: 55,
    bed_type: 'King Bed',
    price: 650,
    sort_order: 0
  },
  {
    id: 'r2',
    hotel_id: defaultHotelA.id,
    name: 'Horizon Two-Bedroom Villa',
    description: 'The pinnacle of Malibu luxury. A standalone sanctuary offering panoramic ocean views, a private heated plunge pool, a gourmet kitchen, and dedicated butler service.',
    gallery: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Private Plunge Pool', 'Butler Service', 'Ocean View', 'Kitchenette', 'Wellness Bar', 'VIP Airport Transfer'],
    max_guests: 4,
    room_size: 120,
    bed_type: '2 King Beds',
    price: 1500,
    sort_order: 1
  },
  {
    id: 'r3',
    hotel_id: defaultHotelB.id,
    name: 'Soho Loft Studio',
    description: 'Featuring industrial-chic exposed brick walls, 12-foot ceilings, and massive factory-style windows. Includes high-performance workstation and designer furniture.',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['City View', 'High-Speed Wi-Fi', 'Smart TV', 'Exposed Brick', 'Marshall Speaker', 'Premium Workspace'],
    max_guests: 2,
    room_size: 38,
    bed_type: 'Queen Bed',
    price: 299,
    sort_order: 0
  }
];

const getInitialPromotions = (): Promotion[] => [
  {
    id: 'p1',
    hotel_id: defaultHotelA.id,
    title: 'Summer Coast Sanctuary',
    description: 'Escape to Malibu this summer. Enjoy 20% off all suites when you book 3 nights or more, plus a complimentary $100 spa credit and daily oceanfront breakfast.',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    promo_code: 'SUMMER26',
    cta_text: 'Claim Offer',
    cta_link: '#booking',
    is_active: true
  },
  {
    id: 'p2',
    hotel_id: defaultHotelB.id,
    title: 'Soho Midweek Escape',
    description: 'Ditch the routine. Book a midweek stay (Monday - Thursday) and receive 15% off, early check-in, late check-out, and two signature cocktails at our rooftop lounge.',
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    start_date: '2026-05-01',
    end_date: '2026-12-31',
    promo_code: 'MIDWEEK',
    cta_text: 'Book Escape',
    cta_link: '#booking',
    is_active: true
  }
];

const getInitialHomepageSections = (): HomepageSection[] => [
  {
    id: 'hs1',
    hotel_id: defaultHotelA.id,
    section_type: 'about',
    content: {
      title: 'A Legacy of Coastal Elegance',
      subtitle: 'Malibu’s Premier Luxury Retreat',
      description: 'Poised majestically on the cliffs of Malibu, The Grand Horizon Resort & Spa blends timeless sophistication with the raw beauty of the Pacific. For over three decades, we have provided an ultra-exclusive haven for discerning travelers seeking complete restoration. Here, days are measured by the tides, and every detail is curated to deliver an unparalleled luxury experience.',
      badge: 'Welcome to Paradise',
      features: [
        { title: 'Oceanfront Dining', desc: 'Savor Michelin-starred coastal cuisine curated by renowned chefs.' },
        { title: 'Therapeutic Spa', desc: 'Holistic wellness therapies using organic, marine-infused minerals.' },
        { title: 'Private Beach', desc: 'Direct, secluded access to Malibu’s most pristine white-sand shoreline.' }
      ]
    },
    is_enabled: true,
    sort_order: 1
  },
  {
    id: 'hs2',
    hotel_id: defaultHotelB.id,
    section_type: 'about',
    content: {
      title: 'Designed for the Urban Explorer',
      subtitle: 'Where Soho Soul Meets Modern Comfort',
      description: 'Tucked away in the iconic fashion capital of Soho, Urban Nest Hotel is a masterpiece of industrial aesthetics and high-end minimalism. We cater to creative minds, digital nomads, and global seekers who crave connection, design excellence, and instant access to Manhattan’s beating heart. Step outside into cobblestone streets; step inside into absolute tranquility.',
      badge: 'Artisanal Urban Living',
      features: [
        { title: 'Rooftop Lounge', desc: 'Craft mixology overlooking the Manhattan skyline.' },
        { title: 'Coworking Hub', desc: 'Ultra-fast fiber network, ergonomic spaces, and artisan coffee.' },
        { title: 'Local Curation', desc: 'In-room gallery walls featuring rotating works from Soho artists.' }
      ]
    },
    is_enabled: true,
    sort_order: 1
  }
];

const getInitialGallery = (): GalleryPhoto[] => [
  { id: 'g1', hotel_id: defaultHotelA.id, image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', category: 'Rooms', alt_text: 'Villa Living Area', sort_order: 0 },
  { id: 'g2', hotel_id: defaultHotelA.id, image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', category: 'Exterior', alt_text: 'Sunset Pool Deck', sort_order: 1 },
  { id: 'g3', hotel_id: defaultHotelA.id, image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', category: 'Spa', alt_text: 'Relaxation Massage Room', sort_order: 2 },
  { id: 'g4', hotel_id: defaultHotelA.id, image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', category: 'Dining', alt_text: 'Seafood Fine Dining', sort_order: 3 },
  { id: 'g5', hotel_id: defaultHotelB.id, image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', category: 'Rooms', alt_text: 'Loft Suite Bed', sort_order: 0 },
  { id: 'g6', hotel_id: defaultHotelB.id, image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80', category: 'Dining', alt_text: 'Artisanal Cafe and Bar', sort_order: 1 }
];

const getInitialBlog = (): BlogPost[] => [
  {
    id: 'b1',
    hotel_id: defaultHotelA.id,
    title: 'The Art of Mindful Travel: Oceanfront Wellness',
    slug: 'art-of-mindful-travel',
    content: '<p>In today’s hyper-connected world, travel has shifted from a mere escape to an essential avenue for restoring mental and physical health. The sounds of breaking waves do more than provide a peaceful background—scientific research proves that "blue spaces" like coastlines trigger immediate, therapeutic shifts in brain chemistry. Here at The Grand Horizon, we have structured our guest experience around ocean-centric mindfulness...</p>',
    excerpt: 'Discover how the soothing power of coastal blue spaces rewires our neurochemistry, reduces cortisol, and brings absolute clarity.',
    featured_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    category: 'Wellness',
    is_published: true,
    published_at: '2026-06-15T12:00:00Z',
    created_at: '2026-06-15T12:00:00Z'
  },
  {
    id: 'b2',
    hotel_id: defaultHotelB.id,
    title: 'A Local Guide to Soho’s Secret Galleries',
    slug: 'sohos-secret-galleries',
    content: '<p>While the broader NYC art scene often gravitates towards major institutional museums, Soho remains the true historical heartbeat of avant-garde American art. Behind unlabelled cast-iron doors and up creaky freight elevators lie some of the world’s most influential, privately-owned gallery spaces. As a guest of Urban Nest, you are steps away from these secret collections. Let’s dive into four hidden art spaces you won’t find in mainstream tour guides...</p>',
    excerpt: 'Step off the beaten path. Our curated guide reveals Soho’s most exclusive, hidden art collections tucked behind cast-iron facades.',
    featured_image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=800&q=80',
    category: 'Local Guide',
    is_published: true,
    published_at: '2026-06-20T10:00:00Z',
    created_at: '2026-06-20T10:00:00Z'
  }
];

const getInitialAnalytics = (): AnalyticsEvent[] => {
  const events: AnalyticsEvent[] = [];
  const hotelIds = [defaultHotelA.id, defaultHotelB.id];
  
  // Seed some realistic analytics events for the past 7 days
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateString = date.toISOString();
    
    hotelIds.forEach(hotelId => {
      const multiplier = hotelId === defaultHotelA.id ? 1.5 : 1.0;
      // Add page views
      const viewsCount = Math.floor((40 + Math.random() * 50) * multiplier);
      for (let j = 0; j < viewsCount; j++) {
        events.push({
          id: `view-${i}-${j}-${hotelId}`,
          hotel_id: hotelId,
          event_type: 'page_view',
          page_path: Math.random() > 0.6 ? '/rooms' : '/',
          created_at: dateString
        });
      }
      
      // Add widget usage
      const widgetCount = Math.floor((10 + Math.random() * 15) * multiplier);
      for (let j = 0; j < widgetCount; j++) {
        events.push({
          id: `widget-${i}-${j}-${hotelId}`,
          hotel_id: hotelId,
          event_type: 'widget_use',
          page_path: '/',
          created_at: dateString
        });
      }
      
      // Add booking clicks
      const bookingCount = Math.floor((3 + Math.random() * 8) * multiplier);
      for (let j = 0; j < bookingCount; j++) {
        events.push({
          id: `booking-${i}-${j}-${hotelId}`,
          hotel_id: hotelId,
          event_type: 'booking_click',
          page_path: '/rooms',
          room_id: hotelId === defaultHotelA.id ? 'r1' : 'r3',
          created_at: dateString
        });
      }
    });
  }
  return events;
};

// Complete Default State
const defaultState: DatabaseState = {
  hotels: [defaultHotelA, defaultHotelB],
  hero_slides: getInitialSlides(),
  homepage_sections: getInitialHomepageSections(),
  rooms: getInitialRooms(),
  promotions: getInitialPromotions(),
  gallery_photos: getInitialGallery(),
  blog_posts: getInitialBlog(),
  contact_messages: [],
  media_library: [],
  analytics_events: getInitialAnalytics()
};

// File-based DB helper
const DB_FILE_PATH = path.join(process.cwd(), 'database.json');

export function getDb(): DatabaseState {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      // Write default state to file
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultState, null, 2), 'utf-8');
      return defaultState;
    }
    const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading local mock database file:', error);
    return defaultState;
  }
}

export function saveDb(state: DatabaseState): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local mock database file:', error);
  }
}

// -----------------------------------------------------------------------------
// DATA ACCESS LAYER (DAL) METHODS
// -----------------------------------------------------------------------------

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  if (isSupabaseConfigured) {
    return getSupabaseHotelBySlug(slug);
  }
  const db = getDb();
  return db.hotels.find(h => h.slug.toLowerCase() === slug.toLowerCase() || h.id === slug) || null;
}

export async function getHotelByDomain(domain: string): Promise<Hotel | null> {
  if (isSupabaseConfigured) {
    return getSupabaseHotelByDomain(domain);
  }
  const db = getDb();
  const normalized = domain.toLowerCase().split(':')[0];
  let hotel = db.hotels.find(h => h.custom_domain && h.custom_domain.toLowerCase() === normalized);
  if (!hotel) {
    const firstPart = normalized.split('.')[0];
    hotel = db.hotels.find(h => h.slug.toLowerCase() === firstPart);
  }
  return hotel || null;
}

export async function getHeroSlides(hotelId: string): Promise<HeroSlide[]> {
  if (isSupabaseConfigured) {
    return getSupabaseHeroSlides(hotelId);
  }
  const db = getDb();
  return db.hero_slides
    .filter(s => s.hotel_id === hotelId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getHomepageSections(hotelId: string): Promise<HomepageSection[]> {
  if (isSupabaseConfigured) {
    return getSupabaseHomepageSections(hotelId);
  }
  const db = getDb();
  return db.homepage_sections
    .filter(s => s.hotel_id === hotelId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getRooms(hotelId: string): Promise<Room[]> {
  if (isSupabaseConfigured) {
    return getSupabaseRooms(hotelId);
  }
  const db = getDb();
  return db.rooms
    .filter(r => r.hotel_id === hotelId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getRoomById(id: string): Promise<Room | null> {
  if (isSupabaseConfigured) {
    return getSupabaseRoomById(id);
  }
  const db = getDb();
  return db.rooms.find(r => r.id === id) || null;
}

export async function getPromotions(hotelId: string): Promise<Promotion[]> {
  if (isSupabaseConfigured) {
    return getSupabasePromotions(hotelId);
  }
  const db = getDb();
  return db.promotions.filter(p => p.hotel_id === hotelId && p.is_active);
}

export async function getGalleryPhotos(hotelId: string): Promise<GalleryPhoto[]> {
  if (isSupabaseConfigured) {
    try {
      const items = await getSupabaseMediaItems(hotelId);
      const sortedItems = [...items].sort((a, b) => {
        const aOrder = a.sort_order !== undefined ? a.sort_order : 999999;
        const bOrder = b.sort_order !== undefined ? b.sort_order : 999999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
      });
      return sortedItems.map((item, index) => ({
        id: item.id,
        hotel_id: hotelId,
        image_url: item.url,
        category: item.category,
        alt_text: item.altText,
        sort_order: index
      }));
    } catch (e) {
      console.error('getGalleryPhotos Edge error:', e);
      return [];
    }
  }
  const db = getDb();
  const list = db.media_library || [];
  return list
    .filter((item: any) => item.hotel_id === hotelId)
    .sort((a: any, b: any) => {
      const aOrder = a.sort_order !== undefined ? a.sort_order : 999999;
      const bOrder = b.sort_order !== undefined ? b.sort_order : 999999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })
    .map((item: any, index: number) => ({
      id: item.id,
      hotel_id: hotelId,
      image_url: item.file_path || item.url,
      category: item.folder || item.category,
      alt_text: item.alt_text,
      sort_order: index
    }));
}

export async function getBlogPosts(hotelId: string): Promise<BlogPost[]> {
  if (isSupabaseConfigured) {
    return getSupabaseBlogPosts(hotelId);
  }
  const db = getDb();
  return db.blog_posts
    .filter(b => b.hotel_id === hotelId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getBlogPostBySlug(hotelId: string, slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured) {
    return getSupabaseBlogPostBySlug(hotelId, slug);
  }
  const db = getDb();
  return db.blog_posts.find(b => b.hotel_id === hotelId && b.slug === slug) || null;
}

export async function getContactMessages(hotelId: string): Promise<ContactMessage[]> {
  if (isSupabaseConfigured) {
    return getSupabaseContactMessages(hotelId);
  }
  const db = getDb();
  return db.contact_messages
    .filter(m => m.hotel_id === hotelId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function saveContactMessage(hotelId: string, data: Omit<ContactMessage, 'id' | 'hotel_id' | 'created_at'>): Promise<ContactMessage> {
  if (isSupabaseConfigured) {
    return saveSupabaseContactMessage(hotelId, data);
  }
  const db = getDb();
  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hotel_id: hotelId,
    ...data,
    created_at: new Date().toISOString()
  };
  db.contact_messages.push(newMessage);
  saveDb(db);
  return newMessage;
}

export async function updateHotelTheme(hotelId: string, theme: Partial<HotelTheme>): Promise<HotelTheme> {
  if (isSupabaseConfigured) {
    const updated = await updateSupabaseHotelTheme(hotelId, theme);
    if (updated) return updated;
  }
  const db = getDb();
  const hotelIndex = db.hotels.findIndex(h => h.id === hotelId);
  if (hotelIndex === -1) throw new Error('Hotel not found');
  
  db.hotels[hotelIndex].theme = {
    ...db.hotels[hotelIndex].theme,
    ...theme
  };
  saveDb(db);
  return db.hotels[hotelIndex].theme;
}

export async function updateHotelGeneralSettings(hotelId: string, data: Partial<Omit<Hotel, 'id' | 'theme' | 'homepage_layout' | 'slug'>>): Promise<Hotel> {
  if (isSupabaseConfigured) {
    const updated = await updateSupabaseHotelGeneralSettings(hotelId, data);
    if (updated) return updated;
  }
  const db = getDb();
  const hotelIndex = db.hotels.findIndex(h => h.id === hotelId);
  if (hotelIndex === -1) throw new Error('Hotel not found');
  
  db.hotels[hotelIndex] = {
    ...db.hotels[hotelIndex],
    ...data
  } as Hotel;
  saveDb(db);
  return db.hotels[hotelIndex];
}

export async function trackAnalyticsEvent(hotelId: string, event_type: AnalyticsEvent['event_type'], page_path: string, room_id?: string): Promise<void> {
  if (isSupabaseConfigured) {
    return trackSupabaseAnalyticsEvent(hotelId, event_type, page_path, room_id);
  }
  const db = getDb();
  const newEvent: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hotel_id: hotelId,
    event_type,
    page_path,
    room_id,
    created_at: new Date().toISOString()
  };
  db.analytics_events.push(newEvent);
  saveDb(db);
}

export async function getAnalyticsOverview(hotelId: string) {
  if (isSupabaseConfigured) {
    return getSupabaseAnalyticsOverview(hotelId);
  }
  const db = getDb();
  const events = db.analytics_events.filter(e => e.hotel_id === hotelId);
  
  const pageViews = events.filter(e => e.event_type === 'page_view');
  const bookingClicks = events.filter(e => e.event_type === 'booking_click');
  const widgetUsage = events.filter(e => e.event_type === 'widget_use');
  
  // Top page paths
  const pagePaths: Record<string, number> = {};
  pageViews.forEach(v => {
    pagePaths[v.page_path] = (pagePaths[v.page_path] || 0) + 1;
  });
  
  // Conversion Rate (clicks / views)
  const totalViews = pageViews.length || 1;
  const totalClicks = bookingClicks.length;
  const conversionRate = parseFloat(((totalClicks / totalViews) * 100).toFixed(2));
  
  // Group views by day (last 7 days)
  const viewsByDay: Record<string, number> = {};
  const clicksByDay: Record<string, number> = {};
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    viewsByDay[key] = 0;
    clicksByDay[key] = 0;
  }
  
  events.forEach(e => {
    const d = new Date(e.created_at);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (key in viewsByDay) {
      if (e.event_type === 'page_view') {
        viewsByDay[key]++;
      } else if (e.event_type === 'booking_click') {
        clicksByDay[key]++;
      }
    }
  });

  return {
    totalViews: pageViews.length,
    totalClicks: bookingClicks.length,
    totalWidgetUse: widgetUsage.length,
    conversionRate,
    topPages: Object.entries(pagePaths)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    viewsChart: Object.entries(viewsByDay).map(([date, value]) => ({ date, value })),
    clicksChart: Object.entries(clicksByDay).map(([date, value]) => ({ date, value }))
  };
}

export async function getAllHotels(): Promise<Hotel[]> {
  if (isSupabaseConfigured) {
    return getSupabaseAllHotels();
  }
  const db = getDb();
  return db.hotels;
}

// -----------------------------------------------------------------------------
// NEW MUTATION HELPER FUNCTIONS FOR DUAL-DATABASE SYNC
// -----------------------------------------------------------------------------

export async function getAllPromotions(hotelId: string): Promise<Promotion[]> {
  if (isSupabaseConfigured) {
    return getSupabaseAllPromotions(hotelId);
  }
  const db = getDb();
  return db.promotions.filter(p => p.hotel_id === hotelId);
}

export async function saveHeroSlides(hotelId: string, slides: HeroSlide[]): Promise<void> {
  if (isSupabaseConfigured) {
    return saveSupabaseHeroSlides(hotelId, slides);
  }
  const db = getDb();
  db.hero_slides = [
    ...db.hero_slides.filter(s => s.hotel_id !== hotelId),
    ...slides
  ];
  saveDb(db);
}

export async function saveRoom(hotelId: string, roomData: any): Promise<Room> {
  if (isSupabaseConfigured) {
    return saveSupabaseRoom(hotelId, roomData);
  }
  const db = getDb();
  const existingIndex = db.rooms.findIndex(r => r.id === roomData.id);
  const room = {
    ...roomData,
    hotel_id: hotelId,
    sort_order: roomData.sort_order || 0
  };
  if (existingIndex !== -1) {
    db.rooms[existingIndex] = room;
  } else {
    if (!room.id) {
      room.id = `room-${Date.now()}`;
    }
    db.rooms.push(room);
  }
  saveDb(db);
  return room;
}

export async function deleteRoom(roomId: string): Promise<void> {
  if (isSupabaseConfigured) {
    return deleteSupabaseRoom(roomId);
  }
  const db = getDb();
  db.rooms = db.rooms.filter(r => r.id !== roomId);
  saveDb(db);
}

export async function savePromotion(hotelId: string, promoData: any): Promise<Promotion> {
  if (isSupabaseConfigured) {
    return saveSupabasePromotion(hotelId, promoData);
  }
  const db = getDb();
  const existingIndex = db.promotions.findIndex(p => p.id === promoData.id);
  const promo = {
    ...promoData,
    hotel_id: hotelId
  };
  if (existingIndex !== -1) {
    db.promotions[existingIndex] = promo;
  } else {
    if (!promo.id) {
      promo.id = `promo-${Date.now()}`;
    }
    db.promotions.push(promo);
  }
  saveDb(db);
  return promo;
}

export async function deletePromotion(promoId: string): Promise<void> {
  if (isSupabaseConfigured) {
    return deleteSupabasePromotion(promoId);
  }
  const db = getDb();
  db.promotions = db.promotions.filter(p => p.id !== promoId);
  saveDb(db);
}

export async function updateHomepageLayout(hotelId: string, layout: string[]): Promise<void> {
  if (isSupabaseConfigured) {
    await updateSupabaseHomepageLayout(hotelId, layout);
    return;
  }
  const db = getDb();
  const idx = db.hotels.findIndex(h => h.id === hotelId);
  if (idx === -1) throw new Error('Hotel not found');
  db.hotels[idx].homepage_layout = layout;
  saveDb(db);
}

export async function registerNewHotel(hotelName: string, slug: string, email: string): Promise<string> {
  if (isSupabaseConfigured) {
    return registerSupabaseNewHotel(hotelName, slug, email);
  }
  const db = getDb();
  if (db.hotels.some(h => h.slug.toLowerCase() === slug.toLowerCase())) {
    throw new Error('This subdomain slug is already registered. Please choose another.');
  }
  const newHotelId = `hotel-${Date.now()}`;
  const newHotelObj = {
    id: newHotelId,
    name: hotelName,
    slug: slug || 'new-hotel',
    custom_domain: null,
    status: 'active' as const,
    logo_url: null,
    favicon_url: null,
    email: email,
    phone: '+1 (555) 000-0000',
    address: '123 Paradise Boulevard',
    google_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAwJzAwLjAiTiAwwrAwMCcwMC4wIkU!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
    social_links: { facebook: '', instagram: '', whatsapp: '', twitter: '' },
    theme: {
      primary_color: '#0f172a',
      secondary_color: '#475569',
      accent_color: '#c5a880',
      background_color: '#ffffff',
      text_color: '#0f172a',
      button_style: 'rounded' as const,
      border_radius: '8px',
      font_family: 'Inter',
      dark_mode: false,
      header_layout: 'minimal' as const,
      footer_layout: 'simple' as const,
      animation_style: 'fade' as const
    },
    homepage_layout: ['hero', 'about', 'rooms', 'contact']
  };
  db.hotels.push(newHotelObj);
  db.hero_slides.push({
    id: `slide-${Date.now()}`,
    hotel_id: newHotelId,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    headline: `Welcome to ${hotelName}`,
    subheadline: 'Bespoke Experience',
    button_text: 'Book Stay',
    button_link: '#booking',
    overlay_color: '#000000',
    overlay_opacity: 0.4,
    sort_order: 0
  });
  db.rooms.push({
    id: `room-${Date.now()}`,
    hotel_id: newHotelId,
    name: 'Deluxe Ocean Room',
    description: 'A spacious and beautifully designed suite featuring high-end fixtures and direct ocean views.',
    gallery: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Ocean View'],
    max_guests: 2,
    room_size: 40,
    bed_type: 'King Bed',
    price: 450,
    sort_order: 0
  });
  db.homepage_sections.push({
    id: `sec-${Date.now()}`,
    hotel_id: newHotelId,
    section_type: 'about',
    content: {
      title: `A New Vision of Hospitality`,
      subtitle: `Welcome to ${hotelName}`,
      description: `We invite you to experience a new standard of personalized service and refined luxury. Nestled in a prime destination, our hotel offers an unforgettable escape tailored to your comfort.`,
      badge: 'Bespoke Retreat',
      features: [
        { title: 'Personalized Service', desc: 'Our team anticipates your every requirement.' },
        { title: 'Curated Gastronomy', desc: 'Exceptional dining options crafted by our culinary team.' }
      ]
    },
    is_enabled: true,
    sort_order: 1
  });
  saveDb(db);
  return newHotelId;
}

export async function deleteHotel(hotelId: string): Promise<void> {
  if (isSupabaseConfigured) {
    return deleteSupabaseHotel(hotelId);
  }
  const db = getDb();
  db.hotels = db.hotels.filter(h => h.id !== hotelId);
  db.hero_slides = db.hero_slides.filter(s => s.hotel_id !== hotelId);
  db.homepage_sections = db.homepage_sections.filter(s => s.hotel_id !== hotelId);
  db.rooms = db.rooms.filter(r => r.hotel_id !== hotelId);
  db.promotions = db.promotions.filter(p => p.hotel_id !== hotelId);
  db.gallery_photos = db.gallery_photos.filter(g => g.hotel_id !== hotelId);
  db.blog_posts = db.blog_posts.filter(b => b.hotel_id !== hotelId);
  db.contact_messages = db.contact_messages.filter(m => m.hotel_id !== hotelId);
  db.media_library = (db.media_library || []).filter((m: any) => m.hotel_id !== hotelId);
  db.analytics_events = db.analytics_events.filter(e => e.hotel_id !== hotelId);
  saveDb(db);
}

export async function getMediaItems(hotelId: string): Promise<any[]> {
  if (isSupabaseConfigured) {
    return getSupabaseMediaItems(hotelId);
  }
  const db = getDb();
  const list = db.media_library || [];
  return list
    .filter((item: any) => item.hotel_id === hotelId)
    .sort((a: any, b: any) => {
      const aOrder = a.sort_order !== undefined ? a.sort_order : 999999;
      const bOrder = b.sort_order !== undefined ? b.sort_order : 999999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })
    .map((item: any) => ({
      id: item.id,
      name: item.file_name || item.name,
      url: item.file_path || item.url,
      category: item.folder || item.category,
      size: item.file_size ? `${Math.round(item.file_size / 1024)} KB` : (item.size || '100 KB'),
      dimensions: item.dimensions || 'Dynamic',
      altText: item.alt_text || '',
      dateAdded: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
    }));
}

export async function saveMediaItem(hotelId: string, data: any): Promise<any> {
  if (isSupabaseConfigured) {
    return saveSupabaseMediaItem(hotelId, data);
  }
  const db = getDb();
  if (!db.media_library) db.media_library = [];
  
  let sizeInBytes = 102400;
  if (typeof data.size === 'string') {
    const num = parseInt(data.size.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      sizeInBytes = num * 1024;
    }
  } else if (typeof data.sizeInBytes === 'number') {
    sizeInBytes = data.sizeInBytes;
  }

  // Shift all existing sort_orders up by 1 to make space for the new image at order 0
  db.media_library = db.media_library.map((item: any) => {
    if (item.hotel_id === hotelId && item.sort_order !== undefined) {
      return { ...item, sort_order: item.sort_order + 1 };
    }
    return item;
  });

  const newItem: MediaItem = {
    id: `media-${Date.now()}`,
    hotel_id: hotelId,
    file_name: data.name,
    file_path: data.url,
    file_size: sizeInBytes,
    mime_type: 'image/webp',
    folder: data.category || 'General',
    alt_text: data.altText || '',
    sort_order: 0,
    created_at: new Date().toISOString()
  };
  db.media_library.push(newItem);
  saveDb(db);
  return newItem;
}

export async function updateMediaItemCategory(mediaId: string, category: string): Promise<void> {
  if (isSupabaseConfigured) {
    return updateSupabaseMediaItemCategory(mediaId, category);
  }
  const db = getDb();
  if (!db.media_library) return;
  db.media_library = db.media_library.map((item: any) => {
    if (item.id === mediaId) {
      if ('folder' in item) {
        return { ...item, folder: category };
      } else {
        return { ...item, category: category };
      }
    }
    return item;
  });
  saveDb(db);
}

export async function deleteMediaItem(mediaId: string): Promise<void> {
  if (isSupabaseConfigured) {
    return deleteSupabaseMediaItem(mediaId);
  }
  const db = getDb();
  if (!db.media_library) return;
  db.media_library = db.media_library.filter((item: MediaItem) => item.id !== mediaId);
  saveDb(db);
}

export async function saveMediaOrder(ids: string[]): Promise<void> {
  const db = getDb();
  if (!db.media_library) return;
  db.media_library = db.media_library.map((item: any) => {
    const idx = ids.indexOf(item.id);
    if (idx !== -1) {
      return { ...item, sort_order: idx };
    }
    return item;
  });
  saveDb(db);
}


