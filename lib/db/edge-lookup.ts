import { isSupabaseConfigured, getSupabaseHotelByDomain } from './supabase-client';
import databaseJson from '../../database.json';
import type { Hotel } from './mock-data';

export async function getHotelByDomainEdge(domain: string): Promise<Hotel | null> {
  if (isSupabaseConfigured) {
    return getSupabaseHotelByDomain(domain);
  }
  
  // Fallback to static JSON import (completely edge-safe, no 'fs' at runtime)
  try {
    const normalized = domain.toLowerCase().split(':')[0];
    
    // Match custom domain
    let hotel = databaseJson.hotels.find(
      (h: any) => h.custom_domain && h.custom_domain.toLowerCase() === normalized
    );
    
    if (!hotel) {
      // Fallback to subdomain check
      const firstPart = normalized.split('.')[0];
      hotel = databaseJson.hotels.find(
        (h: any) => h.slug.toLowerCase() === firstPart
      );
    }
    
    return (hotel as Hotel) || null;
  } catch (error) {
    console.error('Error during Edge domain lookup:', error);
    return null;
  }
}
