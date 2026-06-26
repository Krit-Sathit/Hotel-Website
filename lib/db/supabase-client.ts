import { 
  Hotel, 
  HeroSlide, 
  HomepageSection, 
  Room, 
  Promotion, 
  GalleryPhoto, 
  BlogPost, 
  AnalyticsEvent,
  ContactMessage
} from './mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

async function supabaseFetch(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured) return null;
  
  const url = `${supabaseUrl}/rest/v1${path}`;
  const headers = new Headers(options.headers);
  headers.set('apikey', supabaseAnonKey!);
  headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
  headers.set('Content-Type', 'application/json');
  headers.set('Prefer', 'return=representation');

  const res = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store' // Ensure fresh data on every fetch
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[Supabase Fetch Error] ${path}:`, errorText);
    throw new Error(`Supabase API Error: ${res.statusText} - ${errorText}`);
  }

  if (res.status === 204) return [];
  return res.json();
}

// -----------------------------------------------------------------------------
// DYNAMIC DATABASE QUERY METHODS
// -----------------------------------------------------------------------------

export async function getSupabaseHotelBySlug(slug: string): Promise<Hotel | null> {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const hotels = await supabaseFetch(`/hotels?or=(slug.eq.${encodedSlug},id.eq.${encodedSlug})&select=*`);
    if (!hotels || hotels.length === 0) return null;
    return hotels[0] as Hotel;
  } catch (e) {
    console.error('getSupabaseHotelBySlug error:', e);
    return null;
  }
}

export async function getSupabaseHotelByDomain(domain: string): Promise<Hotel | null> {
  try {
    const normalized = domain.toLowerCase().split(':')[0];
    const firstPart = normalized.split('.')[0];
    
    // Search for match in custom_domain or slug
    const hotels = await supabaseFetch(`/hotels?or=(custom_domain.eq.${encodeURIComponent(normalized)},slug.eq.${encodeURIComponent(firstPart)})&select=*`);
    if (!hotels || hotels.length === 0) return null;
    return hotels[0] as Hotel;
  } catch (e) {
    console.error('getSupabaseHotelByDomain error:', e);
    return null;
  }
}

export async function getSupabaseAllHotels(): Promise<Hotel[]> {
  try {
    const hotels = await supabaseFetch('/hotels?select=*');
    return (hotels || []) as Hotel[];
  } catch (e) {
    console.error('getSupabaseAllHotels error:', e);
    return [];
  }
}

export async function getSupabaseHeroSlides(hotelId: string): Promise<HeroSlide[]> {
  try {
    const slides = await supabaseFetch(`/hero_slides?hotel_id=eq.${hotelId}&order=sort_order.asc&select=*`);
    return (slides || []) as HeroSlide[];
  } catch (e) {
    console.error('getSupabaseHeroSlides error:', e);
    return [];
  }
}

export async function getSupabaseHomepageSections(hotelId: string): Promise<HomepageSection[]> {
  try {
    const sections = await supabaseFetch(`/homepage_sections?hotel_id=eq.${hotelId}&order=sort_order.asc&select=*`);
    return (sections || []) as HomepageSection[];
  } catch (e) {
    console.error('getSupabaseHomepageSections error:', e);
    return [];
  }
}

export async function getSupabaseRooms(hotelId: string): Promise<Room[]> {
  try {
    const rooms = await supabaseFetch(`/rooms?hotel_id=eq.${hotelId}&order=sort_order.asc&select=*`);
    return (rooms || []) as Room[];
  } catch (e) {
    console.error('getSupabaseRooms error:', e);
    return [];
  }
}

export async function getSupabaseRoomById(id: string): Promise<Room | null> {
  try {
    const rooms = await supabaseFetch(`/rooms?id=eq.${id}&select=*`);
    if (!rooms || rooms.length === 0) return null;
    return rooms[0] as Room;
  } catch (e) {
    console.error('getSupabaseRoomById error:', e);
    return null;
  }
}

export async function getSupabasePromotions(hotelId: string): Promise<Promotion[]> {
  try {
    const promotions = await supabaseFetch(`/promotions?hotel_id=eq.${hotelId}&is_active=eq.true&select=*`);
    return (promotions || []) as Promotion[];
  } catch (e) {
    console.error('getSupabasePromotions error:', e);
    return [];
  }
}

export async function getSupabaseGalleryPhotos(hotelId: string): Promise<GalleryPhoto[]> {
  try {
    const photos = await supabaseFetch(`/gallery_photos?hotel_id=eq.${hotelId}&order=sort_order.asc&select=*`);
    return (photos || []) as GalleryPhoto[];
  } catch (e) {
    console.error('getSupabaseGalleryPhotos error:', e);
    return [];
  }
}

export async function getSupabaseBlogPosts(hotelId: string): Promise<BlogPost[]> {
  try {
    const posts = await supabaseFetch(`/blog_posts?hotel_id=eq.${hotelId}&order=created_at.desc&select=*`);
    return (posts || []) as BlogPost[];
  } catch (e) {
    console.error('getSupabaseBlogPosts error:', e);
    return [];
  }
}

export async function getSupabaseBlogPostBySlug(hotelId: string, slug: string): Promise<BlogPost | null> {
  try {
    const posts = await supabaseFetch(`/blog_posts?hotel_id=eq.${hotelId}&slug=eq.${encodeURIComponent(slug)}&select=*`);
    if (!posts || posts.length === 0) return null;
    return posts[0] as BlogPost;
  } catch (e) {
    console.error('getSupabaseBlogPostBySlug error:', e);
    return null;
  }
}

// -----------------------------------------------------------------------------
// DYNAMIC DATABASE WRITE METHODS (CRUD / MUTATIONS)
// -----------------------------------------------------------------------------

export async function updateSupabaseHotelGeneralSettings(hotelId: string, data: any): Promise<Hotel | null> {
  try {
    const res = await supabaseFetch(`/hotels?id=eq.${hotelId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return (res && res.length > 0) ? res[0] as Hotel : null;
  } catch (e) {
    console.error('updateSupabaseHotelGeneralSettings error:', e);
    return null;
  }
}

export async function updateSupabaseHotelTheme(hotelId: string, theme: any): Promise<any | null> {
  try {
    const res = await supabaseFetch(`/hotels?id=eq.${hotelId}`, {
      method: 'PATCH',
      body: JSON.stringify({ theme })
    });
    return (res && res.length > 0) ? res[0].theme : null;
  } catch (e) {
    console.error('updateSupabaseHotelTheme error:', e);
    return null;
  }
}

export async function updateSupabaseHomepageLayout(hotelId: string, layout: string[]): Promise<string[] | null> {
  try {
    const res = await supabaseFetch(`/hotels?id=eq.${hotelId}`, {
      method: 'PATCH',
      body: JSON.stringify({ homepage_layout: layout })
    });
    return (res && res.length > 0) ? res[0].homepage_layout : null;
  } catch (e) {
    console.error('updateSupabaseHomepageLayout error:', e);
    return null;
  }
}

export async function trackSupabaseAnalyticsEvent(
  hotelId: string, 
  event_type: 'page_view' | 'booking_click' | 'widget_use', 
  page_path: string, 
  room_id?: string
): Promise<void> {
  try {
    await supabaseFetch('/analytics_events', {
      method: 'POST',
      body: JSON.stringify({
        hotel_id: hotelId,
        event_type,
        page_path,
        room_id: room_id || null,
        created_at: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error('trackSupabaseAnalyticsEvent error:', e);
  }
}

export async function getSupabaseAnalyticsOverview(hotelId: string) {
  try {
    const events = await supabaseFetch(`/analytics_events?hotel_id=eq.${hotelId}&select=*`) as AnalyticsEvent[];
    if (!events) throw new Error('No analytics data');
    
    const pageViews = events.filter(e => e.event_type === 'page_view');
    const bookingClicks = events.filter(e => e.event_type === 'booking_click');
    const widgetUsage = events.filter(e => e.event_type === 'widget_use');
    
    // Calculate top pages
    const pagePaths: Record<string, number> = {};
    pageViews.forEach(v => {
      pagePaths[v.page_path] = (pagePaths[v.page_path] || 0) + 1;
    });
    
    const totalViews = pageViews.length || 1;
    const totalClicks = bookingClicks.length;
    const conversionRate = parseFloat(((totalClicks / totalViews) * 100).toFixed(2));
    
    // Group by day for last 7 days
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
  } catch (e) {
    console.error('getSupabaseAnalyticsOverview error:', e);
    return {
      totalViews: 0,
      totalClicks: 0,
      totalWidgetUse: 0,
      conversionRate: 0,
      topPages: [],
      viewsChart: [],
      clicksChart: []
    };
  }
}

// -----------------------------------------------------------------------------
// SEEDING AND TENANT PROVISIONING (Supabase)
// -----------------------------------------------------------------------------

export async function registerSupabaseNewHotel(hotelName: string, slug: string, email: string): Promise<string> {
  const existing = await supabaseFetch(`/hotels?slug=eq.${encodeURIComponent(slug)}&select=*`);
  if (existing && existing.length > 0) {
    throw new Error('This subdomain slug is already registered. Please choose another.');
  }

  const defaultTheme = {
    primary_color: '#0f172a',
    secondary_color: '#475569',
    accent_color: '#c5a880',
    background_color: '#ffffff',
    text_color: '#0f172a',
    button_style: 'rounded',
    border_radius: '8px',
    font_family: 'Inter',
    dark_mode: false,
    header_layout: 'minimal',
    footer_layout: 'simple',
    animation_style: 'fade'
  };

  const newHotelData = {
    name: hotelName,
    slug: slug,
    custom_domain: null,
    status: 'active',
    logo_url: null,
    favicon_url: null,
    email: email,
    phone: '+1 (555) 000-0000',
    address: '123 Paradise Boulevard',
    google_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAwJzAwLjAiTiAwwrAwMCcwMC4wIkU!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
    social_links: { facebook: '', instagram: '', whatsapp: '', twitter: '' },
    theme: defaultTheme,
    homepage_layout: ['hero', 'about', 'rooms', 'contact']
  };

  // Insert the hotel
  const insertedHotel = await supabaseFetch('/hotels', {
    method: 'POST',
    body: JSON.stringify(newHotelData)
  });

  if (!insertedHotel || insertedHotel.length === 0) {
    throw new Error('Failed to create hotel in Supabase.');
  }

  const hotelId = insertedHotel[0].id;

  // Parallel seed default slide, room, and about text
  await Promise.all([
    supabaseFetch('/hero_slides', {
      method: 'POST',
      body: JSON.stringify({
        hotel_id: hotelId,
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
        headline: `Welcome to ${hotelName}`,
        subheadline: 'Bespoke Experience',
        button_text: 'Book Stay',
        button_link: '#booking',
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        sort_order: 0
      })
    }),
    supabaseFetch('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        hotel_id: hotelId,
        name: 'Deluxe Ocean Room',
        description: 'A spacious and beautifully designed suite featuring high-end fixtures and direct ocean views.',
        gallery: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Free Wi-Fi', 'Air Conditioning', 'Ocean View'],
        max_guests: 2,
        room_size: 40,
        bed_type: 'King Bed',
        price: 450,
        sort_order: 0
      })
    }),
    supabaseFetch('/homepage_sections', {
      method: 'POST',
      body: JSON.stringify({
        hotel_id: hotelId,
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
      })
    })
  ]);

  return hotelId;
}

export async function getSupabaseAllPromotions(hotelId: string): Promise<Promotion[]> {
  try {
    const promotions = await supabaseFetch(`/promotions?hotel_id=eq.${hotelId}&select=*`);
    return (promotions || []) as Promotion[];
  } catch (e) {
    console.error('getSupabaseAllPromotions error:', e);
    return [];
  }
}

export async function saveSupabaseHeroSlides(hotelId: string, slides: HeroSlide[]): Promise<void> {
  // 1. Delete all existing slides for this hotel
  await supabaseFetch(`/hero_slides?hotel_id=eq.${hotelId}`, { method: 'DELETE' });
  
  if (slides.length === 0) return;

  // 2. Clean slides payload to match DB schema (handling UUID keys)
  const cleanedSlides = slides.map(s => {
    const { id, hotel_id, ...rest } = s;
    const isUuid = id && id.length === 36 && id.includes('-');
    if (isUuid) {
      return { id, hotel_id: hotelId, ...rest };
    }
    return { hotel_id: hotelId, ...rest };
  });

  // 3. Bulk insert slides
  await supabaseFetch('/hero_slides', {
    method: 'POST',
    body: JSON.stringify(cleanedSlides)
  });
}

export async function saveSupabaseRoom(hotelId: string, roomData: any): Promise<any> {
  const { id, ...rest } = roomData;
  const isUuid = id && id.length === 36 && id.includes('-');
  
  const payload = {
    ...rest,
    hotel_id: hotelId,
    sort_order: rest.sort_order || 0
  };

  if (isUuid) {
    const res = await supabaseFetch(`/rooms?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return res && res.length > 0 ? res[0] : null;
  } else {
    const res = await supabaseFetch('/rooms', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res && res.length > 0 ? res[0] : null;
  }
}

export async function deleteSupabaseRoom(roomId: string): Promise<void> {
  await supabaseFetch(`/rooms?id=eq.${roomId}`, {
    method: 'DELETE'
  });
}

export async function saveSupabasePromotion(hotelId: string, promoData: any): Promise<any> {
  const { id, ...rest } = promoData;
  const isUuid = id && id.length === 36 && id.includes('-');
  
  const payload = {
    ...rest,
    hotel_id: hotelId
  };

  if (isUuid) {
    const res = await supabaseFetch(`/promotions?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return res && res.length > 0 ? res[0] : null;
  } else {
    const res = await supabaseFetch('/promotions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res && res.length > 0 ? res[0] : null;
  }
}

export async function deleteSupabasePromotion(promoId: string): Promise<void> {
  await supabaseFetch(`/promotions?id=eq.${promoId}`, {
    method: 'DELETE'
  });
}

export async function getSupabaseContactMessages(hotelId: string): Promise<ContactMessage[]> {
  try {
    const messages = await supabaseFetch(`/contact_messages?hotel_id=eq.${hotelId}&order=created_at.desc&select=*`);
    return (messages || []) as ContactMessage[];
  } catch (e) {
    console.error('getSupabaseContactMessages error:', e);
    return [];
  }
}

export async function saveSupabaseContactMessage(hotelId: string, data: any): Promise<ContactMessage> {
  const payload = {
    hotel_id: hotelId,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    message: data.message,
    created_at: new Date().toISOString()
  };
  const res = await supabaseFetch('/contact_messages', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (!res || res.length === 0) {
    throw new Error('Failed to save contact message to Supabase.');
  }
  return res[0] as ContactMessage;
}

