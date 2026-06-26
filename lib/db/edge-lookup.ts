import { isSupabaseConfigured, getSupabaseHotelByDomain } from './supabase-client';

export async function getHotelByDomainEdge(domain: string): Promise<{ id: string; name: string; slug: string; custom_domain: string | null; status: string } | null> {
  if (isSupabaseConfigured) {
    return getSupabaseHotelByDomain(domain);
  }
  
  // Local fallback: Hardcoded mapping for the default mock hotels
  // This completely avoids importing database.json, ensuring the middleware is extremely lightweight and Edge-safe.
  try {
    const normalized = domain.toLowerCase().split(':')[0];
    const firstPart = normalized.split('.')[0];
    
    if (normalized === 'grandhorizon.com' || firstPart === 'hotel-a') {
      return {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'The Grand Horizon Resort & Spa',
        slug: 'hotel-a',
        custom_domain: 'grandhorizon.com',
        status: 'active'
      };
    }
    
    if (normalized === 'urbannest.com' || firstPart === 'hotel-b') {
      return {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Urban Nest Hotel',
        slug: 'hotel-b',
        custom_domain: 'urbannest.com',
        status: 'active'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error during Edge domain lookup:', error);
    return null;
  }
}
