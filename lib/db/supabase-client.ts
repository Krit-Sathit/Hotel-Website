import type { 
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
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseServerKey = supabaseServiceRoleKey || supabaseAnonKey;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseServerKey;

function isUuid(value?: string | null): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

async function supabaseFetch(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured) return null;
  
  const url = `${supabaseUrl}/rest/v1${path}`;
  const headers = new Headers(options.headers);
  headers.set('apikey', supabaseServerKey!);
  headers.set('Authorization', `Bearer ${supabaseServerKey}`);
  headers.set('Content-Type', 'application/json');
  headers.set('Prefer', 'return=representation');

  const isReadRequest = !options.method || options.method.toUpperCase() === 'GET';
  const res = await fetch(url, {
    ...options,
    headers,
    // Public and CMS read operations share this cache unless 'no-store' is requested.
    ...(isReadRequest && options.cache !== 'no-store'
      ? { next: { revalidate: 180, tags: ['hotel-content'] } }
      : { cache: 'no-store' })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[Supabase Fetch Error] ${path}:`, errorText);
    throw new Error(`Supabase API Error: ${res.statusText} - ${errorText}`);
  }

  if (res.status === 204) return [];
  return res.json();
}

/**
 * Resolves any hotel identifier (Supabase UUID, FlowStay numeric ID like "689793",
 * or slug like "theparphuket") into the canonical `public.hotels.id` UUID in Supabase.
 * When `createIfMissing` is true and `fallbackHotel` is supplied, automatically
 * provisions the `public.hotels` row so foreign-key writes (`hero_slides`,
 * `homepage_sections`, `rooms`, `promotions`, `contact_messages`, etc.) succeed.
 */
export async function resolveSupabaseHotelUuid(
  hotelId: string,
  fallbackHotel?: Hotel | null,
  createIfMissing = false
): Promise<string | null> {
  if (!isSupabaseConfigured || !hotelId) return null;
  const trimmedId = String(hotelId).trim();
  if (isUuid(trimmedId)) return trimmedId;

  const norm = (s?: string | null) =>
    (s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normDomain = (d?: string | null) =>
    (d || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

  const candidateSlug = (
    fallbackHotel?.slug || (!/^\d+$/.test(trimmedId) ? trimmedId : '')
  ).trim();
  const targetNormSlug = norm(candidateSlug);
  const targetDomain = normDomain(fallbackHotel?.custom_domain);
  const fetchOpts: RequestInit = createIfMissing
    ? { method: 'GET', cache: 'no-store' }
    : { method: 'GET' };

  try {
    if (candidateSlug) {
      const exact = await supabaseFetch(
        `/hotels?slug=eq.${encodeURIComponent(candidateSlug)}&select=id`,
        fetchOpts
      );
      if (exact && exact.length > 0 && exact[0]?.id) {
        return exact[0].id as string;
      }
    }

    if (targetNormSlug || targetDomain) {
      const allRows = await supabaseFetch(
        '/hotels?select=id,slug,custom_domain',
        fetchOpts
      );
      if (Array.isArray(allRows)) {
        const matched = allRows.find((r: any) => {
          if (targetNormSlug && r.slug && norm(r.slug) === targetNormSlug) {
            return true;
          }
          if (
            targetDomain &&
            r.custom_domain &&
            normDomain(r.custom_domain) === targetDomain
          ) {
            return true;
          }
          return false;
        });
        if (matched?.id) {
          return matched.id as string;
        }
      }
    }

    if (createIfMissing && fallbackHotel && candidateSlug) {
      const cleanDomain = fallbackHotel.custom_domain?.trim() || null;
      const inserted = await supabaseFetch('/hotels', {
        method: 'POST',
        body: JSON.stringify({
          name: fallbackHotel.name || candidateSlug,
          slug: candidateSlug,
          custom_domain: cleanDomain,
          status: fallbackHotel.status || 'active',
          logo_url: fallbackHotel.logo_url || null,
          favicon_url: fallbackHotel.favicon_url || null,
          email: fallbackHotel.email || '',
          phone: fallbackHotel.phone || '',
          address: fallbackHotel.address || '',
          google_map_url: fallbackHotel.google_map_url || '',
          social_links: fallbackHotel.social_links || {
            facebook: '',
            instagram: '',
            whatsapp: '',
            twitter: '',
          },
          theme: fallbackHotel.theme,
          homepage_layout:
            Array.isArray(fallbackHotel.homepage_layout) &&
            fallbackHotel.homepage_layout.length > 0
              ? fallbackHotel.homepage_layout
              : [
                  'hero',
                  'about',
                  'rooms',
                  'promotions',
                  'facilities',
                  'gallery',
                  'contact',
                ],
        }),
      });
      if (inserted && inserted.length > 0 && inserted[0]?.id) {
        return inserted[0].id as string;
      }
    }
  } catch (e) {
    console.error('resolveSupabaseHotelUuid error:', e);
  }

  return null;
}

// -----------------------------------------------------------------------------
// DYNAMIC DATABASE QUERY METHODS
// -----------------------------------------------------------------------------

export async function getSupabaseHotelBySlug(slug: string): Promise<Hotel | null> {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const filter = isUuid(slug)
      ? `or=(slug.eq.${encodedSlug},id.eq.${encodedSlug})`
      : `slug=eq.${encodedSlug}`;
    const hotels = await supabaseFetch(`/hotels?${filter}&select=*`);
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

export async function getSupabaseHeroSlides(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<HeroSlide[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const slides = await supabaseFetch(
      `/hero_slides?hotel_id=eq.${encodeURIComponent(targetUuid)}&order=sort_order.asc&select=*`
    );
    return (slides || []) as HeroSlide[];
  } catch (e) {
    console.error('getSupabaseHeroSlides error:', e);
    return [];
  }
}

export async function getSupabaseHomepageSections(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<HomepageSection[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const sections = await supabaseFetch(
      `/homepage_sections?hotel_id=eq.${encodeURIComponent(targetUuid)}&order=sort_order.asc&select=*`
    );
    return (sections || []) as HomepageSection[];
  } catch (e) {
    console.error('getSupabaseHomepageSections error:', e);
    return [];
  }
}

export async function saveSupabaseHomepageSection(
  hotelId: string,
  sectionType: string,
  content: HomepageSection['content'],
  fallbackHotel?: Hotel | null
): Promise<void> {
  const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
  if (!targetUuid) {
    throw new Error('Could not resolve or create hotel record in Supabase.');
  }

  const updated = await supabaseFetch(
    `/homepage_sections?hotel_id=eq.${encodeURIComponent(targetUuid)}&section_type=eq.${encodeURIComponent(sectionType)}`,
    { method: 'PATCH', body: JSON.stringify({ content }) }
  );

  if (updated && updated.length > 0) return;

  await supabaseFetch('/homepage_sections', {
    method: 'POST',
    body: JSON.stringify({
      hotel_id: targetUuid,
      section_type: sectionType,
      content,
      is_enabled: true,
      sort_order: 1
    })
  });
}

export async function getSupabaseRooms(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<Room[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const rooms = await supabaseFetch(
      `/rooms?hotel_id=eq.${encodeURIComponent(targetUuid)}&order=sort_order.asc&select=*`
    );
    return (rooms || []) as Room[];
  } catch (e) {
    console.error('getSupabaseRooms error:', e);
    return [];
  }
}

export async function getSupabaseRoomById(id: string): Promise<Room | null> {
  try {
    if (!isUuid(id)) return null;
    const rooms = await supabaseFetch(`/rooms?id=eq.${encodeURIComponent(id)}&select=*`);
    if (!rooms || rooms.length === 0) return null;
    return rooms[0] as Room;
  } catch (e) {
    console.error('getSupabaseRoomById error:', e);
    return null;
  }
}

export async function getSupabasePromotions(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<Promotion[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const promotions = await supabaseFetch(
      `/promotions?hotel_id=eq.${encodeURIComponent(targetUuid)}&is_active=eq.true&select=*`
    );
    return (promotions || []) as Promotion[];
  } catch (e) {
    console.error('getSupabasePromotions error:', e);
    return [];
  }
}

export async function getSupabaseGalleryPhotos(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<GalleryPhoto[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const photos = await supabaseFetch(
      `/gallery_photos?hotel_id=eq.${encodeURIComponent(targetUuid)}&order=sort_order.asc&select=*`
    );
    return (photos || []) as GalleryPhoto[];
  } catch (e) {
    console.error('getSupabaseGalleryPhotos error:', e);
    return [];
  }
}

export async function getSupabaseBlogPosts(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<BlogPost[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const posts = await supabaseFetch(
      `/blog_posts?hotel_id=eq.${encodeURIComponent(targetUuid)}&order=created_at.desc&select=*`
    );
    return (posts || []) as BlogPost[];
  } catch (e) {
    console.error('getSupabaseBlogPosts error:', e);
    return [];
  }
}

export async function getSupabaseBlogPostBySlug(
  hotelId: string,
  slug: string,
  fallbackHotel?: Hotel | null
): Promise<BlogPost | null> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return null;
    const posts = await supabaseFetch(
      `/blog_posts?hotel_id=eq.${encodeURIComponent(targetUuid)}&slug=eq.${encodeURIComponent(slug)}&select=*`
    );
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

export async function updateSupabaseHotelGeneralSettings(
  hotelId: string,
  data: any,
  fallbackHotel?: Hotel | null
): Promise<Hotel | null> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
    if (!targetUuid) return null;
    const patched = await supabaseFetch(`/hotels?id=eq.${encodeURIComponent(targetUuid)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return patched && patched.length > 0 ? (patched[0] as Hotel) : null;
  } catch (e) {
    console.error('updateSupabaseHotelGeneralSettings error:', e);
    return null;
  }
}

export async function updateSupabaseHotelTheme(
  hotelId: string,
  theme: any,
  fallbackHotel?: Hotel | null
): Promise<any | null> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
    if (!targetUuid) return null;
    const patched = await supabaseFetch(`/hotels?id=eq.${encodeURIComponent(targetUuid)}`, {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    });
    return patched && patched.length > 0 ? patched[0].theme : null;
  } catch (e) {
    console.error('updateSupabaseHotelTheme error:', e);
    return null;
  }
}

export async function updateSupabaseHomepageLayout(
  hotelId: string,
  layout: string[],
  fallbackHotel?: Hotel | null
): Promise<string[] | null> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
    if (!targetUuid) return null;
    const res = await supabaseFetch(`/hotels?id=eq.${encodeURIComponent(targetUuid)}`, {
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
  room_id?: string,
  fallbackHotel?: Hotel | null
): Promise<void> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return;
    await supabaseFetch('/analytics_events', {
      method: 'POST',
      body: JSON.stringify({
        hotel_id: targetUuid,
        event_type,
        page_path,
        room_id: room_id && isUuid(room_id) ? room_id : null,
        created_at: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error('trackSupabaseAnalyticsEvent error:', e);
  }
}

export async function getSupabaseAnalyticsOverview(
  hotelId: string,
  fallbackHotel?: Hotel | null
) {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) {
      return {
        totalViews: 0,
        totalClicks: 0,
        totalWidgetUse: 0,
        conversionRate: 0,
        topPages: [],
        viewsChart: [],
        clicksChart: [],
      };
    }
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const events = await supabaseFetch(
      `/analytics_events?hotel_id=eq.${encodeURIComponent(targetUuid)}&created_at=gte.${encodeURIComponent(sevenDaysAgo)}&select=event_type,page_path,created_at&limit=5000`
    ) as AnalyticsEvent[];
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

export async function getSupabaseAllPromotions(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<Promotion[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const promotions = await supabaseFetch(
      `/promotions?hotel_id=eq.${encodeURIComponent(targetUuid)}&select=*`
    );
    return (promotions || []) as Promotion[];
  } catch (e) {
    console.error('getSupabaseAllPromotions error:', e);
    return [];
  }
}

export async function saveSupabaseHeroSlides(
  hotelId: string,
  slides: HeroSlide[],
  fallbackHotel?: Hotel | null
): Promise<void> {
  const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
  if (!targetUuid) {
    throw new Error('Could not resolve or create hotel record in Supabase.');
  }

  // 1. Delete all existing slides for this hotel UUID
  await supabaseFetch(
    `/hero_slides?hotel_id=eq.${encodeURIComponent(targetUuid)}`,
    { method: 'DELETE' }
  );

  if (slides.length === 0) return;

  // 2. Whitelist exact public.hero_slides schema columns and preserve sequential sort_order
  const cleanedSlides = slides.map((s, idx) => {
    const row: Record<string, any> = {
      hotel_id: targetUuid,
      image_url: s.image_url,
      video_url: s.video_url || null,
      headline: s.headline ?? '',
      subheadline: s.subheadline ?? '',
      button_text: s.button_text ?? 'Book Now',
      button_link: s.button_link ?? '#booking',
      overlay_color: s.overlay_color || '#000000',
      overlay_opacity:
        typeof s.overlay_opacity === 'number' && !Number.isNaN(s.overlay_opacity)
          ? Math.min(1, Math.max(0, s.overlay_opacity))
          : 0.4,
      sort_order: idx,
    };
    if (s.id && isUuid(s.id)) {
      row.id = s.id;
    }
    return row;
  });

  // 3. Bulk insert slides
  await supabaseFetch('/hero_slides', {
    method: 'POST',
    body: JSON.stringify(cleanedSlides),
  });
}

export async function saveSupabaseRoom(
  hotelId: string,
  roomData: any,
  fallbackHotel?: Hotel | null
): Promise<any> {
  const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
  if (!targetUuid) {
    throw new Error('Could not resolve or create hotel record in Supabase.');
  }

  const { id } = roomData;
  const payload = {
    hotel_id: targetUuid,
    name: roomData.name || 'Room',
    description: roomData.description ?? '',
    gallery: Array.isArray(roomData.gallery) ? roomData.gallery : [],
    amenities: Array.isArray(roomData.amenities) ? roomData.amenities : [],
    max_guests: Math.max(1, Number(roomData.max_guests) || 2),
    room_size: Math.max(1, Number(roomData.room_size) || 25),
    bed_type: roomData.bed_type || 'King Bed',
    price:
      typeof roomData.price === 'number' && roomData.price >= 0
        ? roomData.price
        : 0,
    book_now_url: roomData.book_now_url || null,
    sort_order: Number(roomData.sort_order) || 0,
  };

  if (isUuid(id)) {
    const res = await supabaseFetch(`/rooms?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res && res.length > 0 ? res[0] : null;
  } else {
    const res = await supabaseFetch('/rooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && res.length > 0 ? res[0] : null;
  }
}

export async function deleteSupabaseRoom(roomId: string): Promise<void> {
  if (!isUuid(roomId)) return;
  await supabaseFetch(`/rooms?id=eq.${encodeURIComponent(roomId)}`, {
    method: 'DELETE',
  });
}

export async function saveSupabasePromotion(
  hotelId: string,
  promoData: any,
  fallbackHotel?: Hotel | null
): Promise<any> {
  const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
  if (!targetUuid) {
    throw new Error('Could not resolve or create hotel record in Supabase.');
  }

  const { id } = promoData;
  const payload = {
    hotel_id: targetUuid,
    title: promoData.title || 'Special Offer',
    description: promoData.description ?? '',
    image_url: promoData.image_url || null,
    start_date: promoData.start_date,
    end_date: promoData.end_date,
    promo_code: promoData.promo_code || null,
    cta_text: promoData.cta_text || 'Book Now',
    cta_link: promoData.cta_link || '#booking',
    is_active: promoData.is_active !== false,
  };

  if (isUuid(id)) {
    const res = await supabaseFetch(
      `/promotions?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return res && res.length > 0 ? res[0] : null;
  } else {
    const res = await supabaseFetch('/promotions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && res.length > 0 ? res[0] : null;
  }
}

export async function deleteSupabasePromotion(promoId: string): Promise<void> {
  if (!isUuid(promoId)) return;
  await supabaseFetch(`/promotions?id=eq.${encodeURIComponent(promoId)}`, {
    method: 'DELETE',
  });
}

export async function getSupabaseContactMessages(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<ContactMessage[]> {
  try {
    const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
    if (!targetUuid) return [];
    const messages = await supabaseFetch(
      `/contact_messages?hotel_id=eq.${encodeURIComponent(targetUuid)}&order=created_at.desc&select=*`
    );
    return (messages || []) as ContactMessage[];
  } catch (e) {
    console.error('getSupabaseContactMessages error:', e);
    return [];
  }
}

export async function saveSupabaseContactMessage(
  hotelId: string,
  data: any,
  fallbackHotel?: Hotel | null
): Promise<ContactMessage> {
  const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
  if (!targetUuid) {
    throw new Error('Could not resolve hotel record in Supabase.');
  }
  const payload = {
    hotel_id: targetUuid,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    message: data.message,
    created_at: new Date().toISOString(),
  };
  const res = await supabaseFetch('/contact_messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res || res.length === 0) {
    throw new Error('Failed to save contact message to Supabase.');
  }
  return res[0] as ContactMessage;
}

export async function deleteSupabaseHotel(hotelId: string): Promise<void> {
  if (!isUuid(hotelId)) return;
  await supabaseFetch(`/hotels?id=eq.${encodeURIComponent(hotelId)}`, {
    method: 'DELETE',
  });
}

export async function uploadSupabaseFile(
  bucketName: string, 
  filePath: string, 
  fileBuffer: Buffer, 
  mimeType: string
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
  
  const url = `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': supabaseServerKey!,
      'Authorization': `Bearer ${supabaseServerKey}`,
      'Content-Type': mimeType
    },
    body: new Uint8Array(fileBuffer)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[Supabase Storage Upload Error] ${filePath}:`, errorText);
    throw new Error(`Supabase Storage Upload Error: ${res.statusText} - ${errorText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

export async function getSupabaseMediaItems(
  hotelId: string,
  fallbackHotel?: Hotel | null
): Promise<any[]> {
  const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, false);
  const filter =
    targetUuid && targetUuid !== hotelId
      ? `or=(hotel_id.eq.${encodeURIComponent(hotelId)},hotel_id.eq.${encodeURIComponent(targetUuid)})`
      : `hotel_id=eq.${encodeURIComponent(hotelId)}`;
  const items = await supabaseFetch(
    `/media_library?${filter}&order=sort_order.asc,created_at.desc&select=*`
  );
  return (items || []).map((item: any) => ({
    id: item.id,
    name: item.file_name,
    url: item.file_path,
    category: item.folder,
    size: `${Math.round(item.file_size / 1024)} KB`,
    dimensions: 'Dynamic',
    altText: item.alt_text || '',
    dateAdded: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    sort_order: item.sort_order
  }));
}

export async function saveSupabaseMediaItem(
  hotelId: string,
  data: any,
  fallbackHotel?: Hotel | null
): Promise<any> {
  const targetUuid = await resolveSupabaseHotelUuid(hotelId, fallbackHotel, true);
  const payload = {
    hotel_id: targetUuid || hotelId,
    file_name: data.name,
    file_path: data.url,
    file_size: data.sizeInBytes || 102400,
    mime_type: 'image/webp',
    alt_text: data.altText || '',
    folder: data.category || 'General',
    created_at: new Date().toISOString()
  };
  const res = await supabaseFetch('/media_library', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (!res || res.length === 0) {
    throw new Error('Failed to save media item to Supabase.');
  }
  return res[0];
}

export async function updateSupabaseMediaItemCategory(mediaId: string, category: string): Promise<void> {
  if (!isUuid(mediaId)) return;
  await supabaseFetch(`/media_library?id=eq.${encodeURIComponent(mediaId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ folder: category })
  });
}

export async function saveSupabaseMediaOrder(ids: string[]): Promise<void> {
  const validIds = ids.filter((id) => isUuid(id));
  if (validIds.length === 0) return;
  await Promise.all(
    validIds.map((mediaId, sortOrder) =>
      supabaseFetch(`/media_library?id=eq.${encodeURIComponent(mediaId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ sort_order: sortOrder })
      })
    )
  );
}

export async function deleteSupabaseMediaItem(mediaId: string): Promise<void> {
  if (!isUuid(mediaId)) return;
  await supabaseFetch(`/media_library?id=eq.${encodeURIComponent(mediaId)}`, {
    method: 'DELETE'
  });
}
