'use server';

import { revalidatePath } from 'next/cache';
import { 
  getDb, 
  saveDb, 
  updateHotelGeneralSettings, 
  updateHotelTheme, 
  Hotel, 
  HotelTheme,
  Room,
  Promotion,
  HeroSlide
} from './mock-data';

// -----------------------------------------------------------------------------
// 1. GENERAL SETTINGS ACTIONS
// -----------------------------------------------------------------------------
export async function saveGeneralSettingsAction(
  hotelId: string, 
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    google_map_url: string;
    custom_domain: string;
    facebook: string;
    instagram: string;
    whatsapp: string;
    twitter: string;
  }
) {
  try {
    updateHotelGeneralSettings(hotelId, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      google_map_url: data.google_map_url,
      custom_domain: data.custom_domain || null,
      social_links: {
        facebook: data.facebook,
        instagram: data.instagram,
        whatsapp: data.whatsapp,
        twitter: data.twitter
      }
    });

    // Revalidate paths to ensure tenant site reflects changes instantly
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('saveGeneralSettingsAction error:', error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// 2. THEME CUSTOMIZATION ACTIONS
// -----------------------------------------------------------------------------
export async function saveThemeSettingsAction(hotelId: string, theme: Partial<HotelTheme>) {
  try {
    updateHotelTheme(hotelId, theme);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('saveThemeSettingsAction error:', error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// 3. HOMEPAGE BUILDER LAYOUT ACTIONS
// -----------------------------------------------------------------------------
export async function saveHomepageLayoutAction(hotelId: string, layout: string[]) {
  try {
    const db = getDb();
    const idx = db.hotels.findIndex(h => h.id === hotelId);
    if (idx === -1) throw new Error('Hotel not found');

    db.hotels[idx].homepage_layout = layout;
    saveDb(db);
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('saveHomepageLayoutAction error:', error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// 4. HERO SLIDES MANAGER ACTIONS
// -----------------------------------------------------------------------------
export async function saveHeroSlidesAction(hotelId: string, slides: HeroSlide[]) {
  try {
    const db = getDb();
    
    // Filter out all slides belonging to this hotel and replace them
    db.hero_slides = [
      ...db.hero_slides.filter(s => s.hotel_id !== hotelId),
      ...slides
    ];
    
    saveDb(db);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('saveHeroSlidesAction error:', error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// 5. ROOMS MANAGER ACTIONS (CRUD)
// -----------------------------------------------------------------------------
export async function saveRoomAction(hotelId: string, roomData: Omit<Room, 'hotel_id'>) {
  try {
    const db = getDb();
    const existingIndex = db.rooms.findIndex(r => r.id === roomData.id);

    const room: Room = {
      ...roomData,
      hotel_id: hotelId,
      sort_order: roomData.sort_order || 0
    };

    if (existingIndex !== -1) {
      db.rooms[existingIndex] = room;
    } else {
      // Create new room id if empty
      if (!room.id) {
        room.id = `room-${Date.now()}`;
      }
      db.rooms.push(room);
    }

    saveDb(db);
    revalidatePath('/', 'layout');
    return { success: true, room };
  } catch (error: any) {
    console.error('saveRoomAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteRoomAction(roomId: string) {
  try {
    const db = getDb();
    db.rooms = db.rooms.filter(r => r.id !== roomId);
    saveDb(db);
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteRoomAction error:', error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// 6. PROMOTIONS MANAGER ACTIONS (CRUD)
// -----------------------------------------------------------------------------
export async function savePromotionAction(hotelId: string, promoData: Omit<Promotion, 'hotel_id'>) {
  try {
    const db = getDb();
    const existingIndex = db.promotions.findIndex(p => p.id === promoData.id);

    const promo: Promotion = {
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
    revalidatePath('/', 'layout');
    return { success: true, promotion: promo };
  } catch (error: any) {
    console.error('savePromotionAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePromotionAction(promoId: string) {
  try {
    const db = getDb();
    db.promotions = db.promotions.filter(p => p.id !== promoId);
    saveDb(db);
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deletePromotionAction error:', error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// 7. PLATFORM ONBOARDING ACTIONS (Tenant Creation)
// -----------------------------------------------------------------------------
export async function registerNewHotelAction(
  hotelName: string, 
  slug: string, 
  email: string
) {
  try {
    const db = getDb();
    
    // Validate subdomain uniqueness
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

    // Seed new hotel and its default slide, room, and introducing text
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
    revalidatePath('/', 'layout');
    
    return { success: true, hotelId: newHotelId };
  } catch (error: any) {
    console.error('registerNewHotelAction error:', error);
    return { success: false, error: error.message };
  }
}
