'use server';

import { revalidatePath } from 'next/cache';
import { 
  updateHotelGeneralSettings, 
  updateHotelTheme, 
  updateHomepageLayout,
  saveHeroSlides,
  saveRoom,
  deleteRoom,
  savePromotion,
  deletePromotion,
  registerNewHotel,
  deleteHotel,
  getAllHotels,
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
    await updateHotelGeneralSettings(hotelId, {
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
    await updateHotelTheme(hotelId, theme);
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
    await updateHomepageLayout(hotelId, layout);
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
    await saveHeroSlides(hotelId, slides);
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
    const room = await saveRoom(hotelId, roomData);
    revalidatePath('/', 'layout');
    return { success: true, room };
  } catch (error: any) {
    console.error('saveRoomAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteRoomAction(roomId: string) {
  try {
    await deleteRoom(roomId);
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
    const promotion = await savePromotion(hotelId, promoData);
    revalidatePath('/', 'layout');
    return { success: true, promotion };
  } catch (error: any) {
    console.error('savePromotionAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePromotionAction(promoId: string) {
  try {
    await deletePromotion(promoId);
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
    const hotelId = await registerNewHotel(hotelName, slug, email);
    revalidatePath('/', 'layout');
    return { success: true, hotelId };
  } catch (error: any) {
    console.error('registerNewHotelAction error:', error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// 8. DELETE HOTEL ACTION
// -----------------------------------------------------------------------------
export async function deleteHotelAction(hotelId: string) {
  try {
    await deleteHotel(hotelId);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteHotelAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllHotelsAction() {
  try {
    const hotels = await getAllHotels();
    return { success: true, hotels: hotels.map(h => ({ id: h.id, name: h.name })) };
  } catch (error: any) {
    console.error('getAllHotelsAction error:', error);
    return { success: false, error: error.message, hotels: [] };
  }
}


