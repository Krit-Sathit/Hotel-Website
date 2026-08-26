import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://theparphuket.com/sitemap.xml',
    host: 'https://theparphuket.com',
  };
}
