import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const rawHost =
    headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const host = rawHost.split(',')[0].trim().toLowerCase().replace(/^www\./, '');

  const baseUrl =
    host && !host.includes('localhost') && !host.includes('127.0.0.1')
      ? `https://${host}`
      : 'https://theparphuket.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
