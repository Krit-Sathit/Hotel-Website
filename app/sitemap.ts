import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers();
  const rawHost =
    headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const host = rawHost.split(',')[0].trim().toLowerCase().replace(/^www\./, '');

  const baseUrl =
    host && !host.includes('localhost') && !host.includes('127.0.0.1')
      ? `https://${host}`
      : 'https://theparphuket.com';

  const now = new Date();
  const paths: Array<{
    path: string;
    changeFrequency: 'daily' | 'weekly';
    priority: number;
  }> = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/rooms', changeFrequency: 'daily', priority: 0.9 },
    { path: '/promotions', changeFrequency: 'daily', priority: 0.85 },
    { path: '/gallery', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/contact', changeFrequency: 'weekly', priority: 0.7 },
  ];

  return paths.map((p) => ({
    url: `${baseUrl}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
