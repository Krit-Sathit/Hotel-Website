import { isSupabaseConfigured, getSupabaseHotelByDomain } from './supabase-client';

export async function getHotelByDomainEdge(domain: string): Promise<{ id: string; name: string; slug: string; custom_domain: string | null; status: string } | null> {
  if (isSupabaseConfigured) {
    return getSupabaseHotelByDomain(domain);
  }
  
  try {
    const normalized = domain.toLowerCase().split(':')[0];
    const parts = normalized.split('.');
    
    // 1. Hardcoded mapping for the default mock hotels
    if (normalized === 'grandhorizon.com' || parts[0] === 'hotel-a') {
      return {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'The Grand Horizon Resort & Spa',
        slug: 'hotel-a',
        custom_domain: 'grandhorizon.com',
        status: 'active'
      };
    }
    
    if (normalized === 'urbannest.com' || parts[0] === 'hotel-b') {
      return {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Urban Nest Hotel',
        slug: 'hotel-b',
        custom_domain: 'urbannest.com',
        status: 'active'
      };
    }

    // 2. Dynamic subdomain resolution for local development (*.localhost) & production (*.vercel.app)
    const isLocalhostSubdomain = parts.length > 1 && parts[parts.length - 1] === 'localhost';
    const isCustomSubdomain = parts.length > 2;

    if (isLocalhostSubdomain || isCustomSubdomain) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== 'dashboard' && subdomain !== 'admin') {
        return {
          id: `dynamic-${subdomain}`,
          name: subdomain.replace(/-/g, ' ').toUpperCase(),
          slug: subdomain,
          custom_domain: null,
          status: 'active'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error during Edge domain lookup:', error);
    return null;
  }
}
