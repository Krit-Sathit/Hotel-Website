import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import {
  getHotelBySlug,
  getHeroSlides,
  getHomepageSections,
  getRooms,
  getPromotions,
  getGalleryPhotos,
  type HotelTheme,
} from '@/lib/db/mock-data';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import HotelTemplateHome from '@/components/templates/hotel-template-home';
import { HOTEL_WEBSITE_TEMPLATES } from '@/lib/hotel-templates';
import { getBookingEngineUrl, resolveTenantPrefix } from '@/lib/booking-engine';
import { resolveHotelSeo } from '@/lib/hotel-seo-highlights';
import {
  HOTEL_LOCALE_COOKIE,
  parseHotelLocale,
  localizeHotel,
  localizeSlides,
  localizeSections,
  localizeRooms,
  localizePromotions,
} from '@/lib/i18n/hotel-locale';

interface TenantPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{
    preview_template?: string;
    pc?: string;
    sc?: string;
    ac?: string;
    bg?: string;
    tc?: string;
    ff?: string;
    bs?: string;
  }>;
}

export async function generateMetadata({
  params,
}: Pick<TenantPageProps, 'params'>): Promise<Metadata> {
  const { tenant } = await params;
  const hotel = await getHotelBySlug(tenant);
  if (!hotel) return {};

  const seo = resolveHotelSeo(hotel);
  const canonicalUrl = hotel.custom_domain
    ? `https://${hotel.custom_domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`
    : undefined;

  return {
    title: seo.title,
    description: seo.description,
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TenantPage({ params, searchParams }: TenantPageProps) {
  const [{ tenant }, query, cookieStore, headerList] = await Promise.all([
    params,
    searchParams,
    cookies(),
    headers(),
  ]);
  const rawHotel = await getHotelBySlug(tenant);

  if (!rawHotel || rawHotel.status !== 'active') {
    notFound();
  }

  const locale = parseHotelLocale(cookieStore.get(HOTEL_LOCALE_COOKIE)?.value);
  const hotel = localizeHotel(rawHotel, locale);

  const rawHost = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const tenantPrefix = resolveTenantPrefix(rawHost, tenant);
  const bookingUrl = getBookingEngineUrl(hotel.slug, tenantPrefix);

  const [rawSlides, rawSections, rawRooms, rawPromotions, gallery] = await Promise.all([
    getHeroSlides(hotel.id),
    getHomepageSections(hotel.id),
    getRooms(hotel.id),
    getPromotions(hotel.id),
    getGalleryPhotos(hotel.id),
  ]);

  const slides = localizeSlides(rawSlides, locale);
  const dbSections = localizeSections(rawSections, rawHotel, locale);
  const rooms = localizeRooms(rawRooms, locale);
  const promotions = localizePromotions(rawPromotions, locale);

  // Support live preview query override (?preview_template=<id>&pc=...&sc=...&ac=...&bg=...&tc=...)
  const previewTpl = query?.preview_template
    ? HOTEL_WEBSITE_TEMPLATES.find((t) => t.id === query.preview_template)
    : undefined;

  const cleanHex = (val?: string) =>
    val && /^[0-9a-fA-F]{6}$/.test(val.trim()) ? `#${val.trim()}` : undefined;

  const previewBs: HotelTheme['button_style'] | undefined =
    query?.bs === 'square' || query?.bs === 'rounded' || query?.bs === 'pill'
      ? query.bs
      : undefined;

  const previewThemeOverride: HotelTheme | undefined = previewTpl
    ? {
        ...previewTpl.theme,
        ...(cleanHex(query?.pc) ? { primary_color: cleanHex(query.pc)! } : {}),
        ...(cleanHex(query?.sc) ? { secondary_color: cleanHex(query.sc)! } : {}),
        ...(cleanHex(query?.ac) ? { accent_color: cleanHex(query.ac)! } : {}),
        ...(cleanHex(query?.bg) ? { background_color: cleanHex(query.bg)! } : {}),
        ...(cleanHex(query?.tc) ? { text_color: cleanHex(query.tc)! } : {}),
        ...(query?.ff ? { font_family: query.ff } : {}),
        ...(previewBs ? { button_style: previewBs } : {}),
      }
    : undefined;

  return (
    <>
      <PageViewTracker hotelId={hotel.id} pagePath="/" />
      <HotelTemplateHome
        hotel={hotel}
        themeOverride={previewThemeOverride}
        templateOverride={previewTpl}
        slides={slides}
        sections={dbSections}
        rooms={rooms}
        promotions={promotions}
        gallery={gallery}
        tenantPrefix={tenantPrefix}
        bookingUrl={bookingUrl}
      />
    </>
  );
}
