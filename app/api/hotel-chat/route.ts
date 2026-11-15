import { NextRequest, NextResponse } from 'next/server';
import {
  getHotelBySlug,
  getRooms,
  getPromotions,
  getHomepageSections,
  type Room,
  type Promotion,
  type HomepageSection,
} from '@/lib/db/mock-data';
import { buildGoogleDirectionsUrl } from '@/lib/map-utils';
import { resolveHotelHighlights } from '@/lib/hotel-seo-highlights';

const FLOWSTAY_API_BASE = (
  process.env.FLOWSTAY_API_URL ||
  process.env.NEXT_PUBLIC_FLOWSTAY_URL ||
  'https://flowstay.live'
).replace(/\/+$/, '');

function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    ''
  ).trim();
}

function normalizeSlugForFlowStay(slug: string): string {
  const clean = (slug || '').trim().toLowerCase();
  if (clean === 'the-par-phuket' || clean === 'hotel-1784206393534') {
    return 'theparphuket';
  }
  return clean;
}

interface CachedFlowStayHotel {
  expiresAt: number;
  flowstayId: number | null;
  name: string;
  nameEn: string;
  address: string;
  addressEn: string;
  city: string;
  checkInTime: string;
  checkOutTime: string;
  description: string;
  descriptionEn: string;
  phone: string;
  email: string;
  lineId: string;
  whatsapp: string;
  googleMapsUrl: string;
  starRating: number | null;
}

const hotelCache = new Map<string, CachedFlowStayHotel>();

async function lookupFlowStayHotel(slug: string): Promise<CachedFlowStayHotel> {
  const normalized = normalizeSlugForFlowStay(slug);
  if (!normalized) {
    return {
      expiresAt: 0,
      flowstayId: null,
      name: '',
      nameEn: '',
      address: '',
      addressEn: '',
      city: '',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      description: '',
      descriptionEn: '',
      phone: '',
      email: '',
      lineId: '',
      whatsapp: '',
      googleMapsUrl: '',
      starRating: null,
    };
  }

  const now = Date.now();
  const cached = hotelCache.get(normalized);
  if (cached && cached.expiresAt > now) {
    return cached;
  }

  const candidateSlugs = Array.from(
    new Set(
      [normalized, slug.trim().toLowerCase(), normalized.replace(/-/g, '')].filter(Boolean)
    )
  );

  for (const candidateSlug of candidateSlugs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const encoded = encodeURIComponent(JSON.stringify({ json: { slug: candidateSlug } }));
      const res = await fetch(`${FLOWSTAY_API_BASE}/api/trpc/hotelBySlug.get?input=${encoded}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (res.ok) {
        const payload = await res.json();
        const raw = payload?.result?.data?.json ?? payload?.result?.data;
        const h = raw?.hotel && typeof raw.hotel === 'object' ? raw.hotel : raw;
        if (h && typeof h === 'object' && h.id) {
          const entry: CachedFlowStayHotel = {
            expiresAt: now + 60_000,
            flowstayId: typeof h.id === 'number' ? h.id : Number(h.id) || null,
            name: String(h.name || '').trim(),
            nameEn: String(h.nameEn || '').trim(),
            address: String(h.address || '').trim(),
            addressEn: String(h.addressEn || '').trim(),
            city: String(h.city || '').trim(),
            checkInTime: String(h.checkInTime || '14:00').trim(),
            checkOutTime: String(h.checkOutTime || '12:00').trim(),
            description: String(h.description || '').trim(),
            descriptionEn: String(h.descriptionEn || '').trim(),
            phone: String(h.contactPhone || '').trim(),
            email: String(h.contactEmail || h.bookingEmail || '').trim(),
            lineId: /^@?test(line)?$/i.test(String(h.lineId || '').trim())
              ? ''
              : String(h.lineId || '').trim(),
            whatsapp: String(h.whatsapp || '').trim(),
            googleMapsUrl: String(h.googleMapsUrl || h.mapUrl || '').trim(),
            starRating: typeof h.starRating === 'number' ? h.starRating : Number(h.starRating) || null,
          };
          hotelCache.set(normalized, entry);
          return entry;
        }
      }
    } catch {
      // Try next candidate slug
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    expiresAt: now + 15_000,
    flowstayId: null,
    name: '',
    nameEn: '',
    address: '',
    addressEn: '',
    city: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    description: '',
    descriptionEn: '',
    phone: '',
    email: '',
    lineId: '',
    whatsapp: '',
    googleMapsUrl: '',
    starRating: null,
  };
}

function isUpstreamErrorReply(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized.includes("i'm having trouble responding right now") ||
    normalized.includes('could not generate a response') ||
    normalized.includes('hotel information is not available') ||
    normalized.includes('something went wrong')
  );
}

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

async function invokeDirectGeminiConcierge(
  slug: string,
  message: string,
  history: ChatTurn[],
  fsHotel: CachedFlowStayHotel
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const hotel = await getHotelBySlug(slug);
  if (!hotel) return null;

  const [rooms, promotions, sections] = await Promise.all([
    getRooms(hotel.id).catch((): Room[] => []),
    getPromotions(hotel.id).catch((): Promotion[] => []),
    getHomepageSections(hotel.id).catch((): HomepageSection[] => []),
  ]);

  const aboutSection = sections.find((s: HomepageSection) => s.section_type === 'about');
  const aboutContent = aboutSection?.content || {};
  const highlights = resolveHotelHighlights(aboutContent?.highlights, hotel.slug, hotel.name);
  const mapUrl = buildGoogleDirectionsUrl(
    hotel.google_map_url || fsHotel.googleMapsUrl,
    hotel.name,
    hotel.address || fsHotel.address
  );

  const roomsContext = rooms
    .map(
      (r: Room) =>
        `- ${r.name}: from THB ${Math.round(Number(r.price || 0)).toLocaleString()}/night, up to ${
          r.max_guests || 2
        } guests${r.bed_type ? `, bed: ${r.bed_type}` : ''}${
          r.room_size ? `, size: ${r.room_size} sqm` : ''
        }${r.amenities?.length ? `, amenities: ${r.amenities.join(', ')}` : ''}${
          r.description ? ` — ${r.description}` : ''
        }`
    )
    .join('\n');

  const promosContext = promotions
    .map(
      (p: Promotion) =>
        `- ${p.title}${p.promo_code ? ` [Code: ${p.promo_code}]` : ''}: ${p.description || ''}`
    )
    .join('\n');

  const highlightsContext = highlights
    .map((h) => `- ${h.title}: ${h.subtitle}`)
    .join('\n');

  const systemPrompt = `You are the official AI Concierge & Front Desk Assistant for "${hotel.name}"${
    fsHotel.name && fsHotel.name !== hotel.name ? ` (${fsHotel.name})` : ''
  }.
Speak warmly, accurately, and concisely as "we" (the hotel team). Always reply in the SAME language the guest uses (e.g., polite Thai with ครับ/ค่ะ if asked in Thai, English if asked in English, etc.).

## Official Hotel Details
- Hotel Name: ${hotel.name}${fsHotel.name ? ` / ${fsHotel.name}` : ''}
- Address (TH/EN): ${fsHotel.address || hotel.address || 'N/A'}${
    fsHotel.addressEn && fsHotel.addressEn !== fsHotel.address ? ` / ${fsHotel.addressEn}` : ''
  }
- City: ${fsHotel.city || 'Thailand'}
- Google Maps Link: ${mapUrl}
- Check-in Time: ${fsHotel.checkInTime || '14:00'}
- Check-out Time: ${fsHotel.checkOutTime || '12:00'}
- Phone: ${hotel.phone || fsHotel.phone || 'N/A'}
- Email: ${hotel.email || fsHotel.email || 'N/A'}
- LINE ID: ${fsHotel.lineId || hotel.social_links?.line || 'N/A'}
- WhatsApp: ${fsHotel.whatsapp || hotel.social_links?.whatsapp || 'N/A'}

## About & Highlights
${fsHotel.description || aboutContent?.description || ''}
${fsHotel.descriptionEn && fsHotel.descriptionEn !== fsHotel.description ? fsHotel.descriptionEn : ''}
${highlightsContext}

## Room Types & Starting Rates
${roomsContext || 'Standard & Deluxe rooms available on our booking page.'}

## Current Direct Booking Promotions
${promosContext || 'Best Rate Guaranteed when booking directly on our official website.'}

## Guidelines
- Give specific, factual answers based ONLY on the hotel details above.
- For live room availability or exact nightly totals on specific dates, invite the guest to select their check-in & check-out dates via the "Book Now" button on this website.
- Never invent policies or facilities not mentioned above; if unsure, offer our phone/LINE/WhatsApp contact.`;

  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const turn of history.slice(-10)) {
    const text = String(turn?.content || '').trim();
    if (!text || isUpstreamErrorReply(text)) continue;
    const role: 'user' | 'model' = turn.role === 'assistant' ? 'model' : 'user';
    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) {
      prev.parts[0].text += `\n\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }
  const prevLast = contents[contents.length - 1];
  if (prevLast && prevLast.role === 'user') {
    prevLast.parts[0].text += `\n\n${message}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: message }] });
  }

  const candidateModels = [
    process.env.GEMINI_CHAT_MODEL?.trim(),
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-flash-lite-latest',
  ].filter((m): m is string => Boolean(m && m !== 'gemini-3.8-flash'));

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 900,
              ...(model.includes('3-flash') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            },
          }),
          signal: controller.signal,
        }
      );

      if (!res.ok) continue;
      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts
          ?.filter((p: { thought?: boolean }) => !p?.thought)
          ?.map((p: { text?: string }) => p?.text || '')
          .join('')
          .trim() || '';
      if (reply) {
        return reply;
      }
    } catch {
      // Try next candidate model
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

async function buildLocalConciergeReply(
  slug: string,
  message: string,
  fsHotel: CachedFlowStayHotel
): Promise<string> {
  const isThai = /[\u0E00-\u0E7F]/.test(message);
  const hotel = await getHotelBySlug(slug);
  if (!hotel && !fsHotel.name) {
    return isThai
      ? 'ขออภัยครับ ขณะนี้ไม่สามารถดึงข้อมูลที่พักได้ กรุณาติดต่อโรงแรมโดยตรงครับ'
      : 'Sorry, hotel information is temporarily unavailable. Please contact the hotel directly.';
  }

  const hotelName = hotel?.name || fsHotel.nameEn || fsHotel.name || 'Hotel';
  const hotelNameTh = fsHotel.name || hotel?.name || hotelName;
  const displayName = isThai ? hotelNameTh : hotelName;

  const [rooms, promotions, sections]: [Room[], Promotion[], HomepageSection[]] = hotel
    ? await Promise.all([
        getRooms(hotel.id).catch((): Room[] => []),
        getPromotions(hotel.id).catch((): Promotion[] => []),
        getHomepageSections(hotel.id).catch((): HomepageSection[] => []),
      ])
    : [[], [], []];

  const aboutSection = sections.find((s: HomepageSection) => s.section_type === 'about');
  const aboutContent = aboutSection?.content || {};
  const highlights = resolveHotelHighlights(aboutContent?.highlights, hotel?.slug || slug, hotelName);

  const addressTh = fsHotel.address || hotel?.address || '';
  const addressEn = fsHotel.addressEn || hotel?.address || fsHotel.address || '';
  const city = fsHotel.city || '';
  const phone = hotel?.phone || fsHotel.phone || '';
  const email = hotel?.email || fsHotel.email || '';
  const lineId = fsHotel.lineId || hotel?.social_links?.line || '';
  const whatsapp = fsHotel.whatsapp || hotel?.social_links?.whatsapp || '';
  const checkIn = fsHotel.checkInTime || '14:00';
  const checkOut = fsHotel.checkOutTime || '12:00';
  const mapUrl = buildGoogleDirectionsUrl(
    hotel?.google_map_url || fsHotel.googleMapsUrl,
    hotelName,
    addressEn || addressTh
  );

  const contactItems = [
    phone ? (isThai ? `โทร: ${phone}` : `Tel: ${phone}`) : '',
    lineId ? `LINE: ${lineId}` : '',
    whatsapp ? `WhatsApp: ${whatsapp}` : '',
    email ? `Email: ${email}` : '',
  ].filter(Boolean);

  const lowestPrice = rooms.reduce((min: number, r: Room) => {
    const p = Number(r.price || 0);
    return p > 0 && (min === 0 || p < min) ? p : min;
  }, 0);

  const q = message.toLowerCase();

  // 1. Location / Address / Directions
  if (
    /แชร์โล|ขอโล|โลเคช|ปักหมุด|แมพ|ลิ้งค์แผนที่|ลิงก์แผนที่|ที่ไหน|อยู่ไหน|ที่ตั้ง|ที่อยู่|แผนที่|เดินทาง|ไปยังไง|พิกัด|ซอย|ถนน|แถวไหน|ใกล้|สนามบิน|where|location|address|map|direction|located|how to get|pin|google map/.test(
      q
    )
  ) {
    const addr = isThai ? addressTh || addressEn : addressEn || addressTh;
    return isThai
      ? `📍 ${displayName} ตั้งอยู่ที่:\n${addr || city || 'สามารถดูพิกัดบนหน้าเว็บไซต์ได้ครับ'}${
          city && addr && !addr.includes(city) ? ` (${city})` : ''
        }\n\n🗺️ แผนที่นำทาง Google Maps:\n${mapUrl}${
          contactItems.length ? `\n\nสอบถามเส้นทางเพิ่มเติม: ${contactItems.join(' | ')}` : ''
        }`
      : `📍 ${displayName} is located at:\n${addr || city || 'Please see our map section on the website.'}${
          city && addr && !addr.includes(city) ? ` (${city})` : ''
        }\n\n🗺️ Google Maps Directions:\n${mapUrl}${
          contactItems.length ? `\n\nNeed help with directions? Reach us at ${contactItems.join(' | ')}` : ''
        }`;
  }

  // 2. Check-in / Check-out times
  if (/เช็คอิน|เช็คเอาท์|เช็กอิน|เช็กเอาต์|เวลา|กี่โมง|check-?in|check-?out|arrival|departure/.test(q)) {
    return isThai
      ? `🕒 เวลาเช็คอินและเช็คเอาท์ของ ${displayName}:\n• เช็คอิน: ตั้งแต่ ${checkIn} น.\n• เช็คเอาท์: ไม่เกิน ${checkOut} น.\n\nหากต้องการเช็คอินก่อนเวลาหรือเช็คเอาท์ล่วงเวลา สามารถแจ้งทีมงานล่วงหน้าได้ครับ${
          phone ? ` (โทร ${phone})` : ''
        }`
      : `🕒 Check-in & Check-out hours at ${displayName}:\n• Check-in: from ${checkIn}\n• Check-out: until ${checkOut}\n\nPlease contact our front desk in advance if you require early check-in or late check-out${
          phone ? ` (${phone})` : ''
        }.`;
  }

  // 3. Promotions / Discounts
  if (/โปร|ส่วนลด|คูปอง|ดีล|promo|discount|offer|deal|special/.test(q)) {
    if (promotions.length > 0) {
      const list = promotions
        .slice(0, 5)
        .map(
          (p: Promotion) =>
            `• ${p.title}${p.promo_code ? ` — โค้ด: ${p.promo_code}` : ''}${
              p.description ? ` (${p.description})` : ''
            }`
        )
        .join('\n');
      return isThai
        ? `🎁 โปรโมชั่นพิเศษสำหรับการจองตรงกับ ${displayName}:\n${list}\n\nกดปุ่ม "Book Now" เพื่อเลือกวันเข้าพักและรับราคาลดพิเศษได้ทันทีครับ!`
        : `🎁 Current direct booking offers at ${displayName}:\n${list}\n\nClick "Book Now" and select your dates to enjoy these exclusive direct rates!`;
    }
    return isThai
      ? `สำหรับการจองตรงผ่านเว็บไซต์ทางการของ ${displayName} คุณจะได้รับราคาพิเศษ Best Rate Guaranteed เสมอครับ สามารถกดปุ่ม Book Now เพื่อตรวจสอบราคาสุทธิของวันที่ต้องการเข้าพักได้เลยครับ`
      : `Booking directly on ${displayName}'s official website guarantees our lowest available rates. Click "Book Now" to check live promotional pricing for your dates.`;
  }

  // 4. Facilities / Amenities / Pool / Parking / Breakfast / Wi-Fi
  if (
    /สิ่งอำนวยความสะดวก|สระว่ายน้ำ|จอดรถ|ที่จอดรถ|ไวไฟ|อาหารเช้า|ฟิตเนส|บริการ|facility|facilities|amenit|pool|parking|wifi|wi-fi|breakfast/.test(
      q
    )
  ) {
    const roomAmenities = Array.from(
      new Set(rooms.flatMap((r: Room) => r.amenities || []).filter(Boolean))
    ).slice(0, 8);
    const hlList = highlights.map((h) => `• ${h.title} — ${h.subtitle}`).join('\n');
    const amText = roomAmenities.length > 0 ? roomAmenities.join(', ') : '';

    return isThai
      ? `✨ จุดเด่นและสิ่งอำนวยความสะดวกของ ${displayName}:\n${hlList}${
          amText ? `\n\nสิ่งอำนวยความสะดวกในห้องพัก: ${amText}` : ''
        }${phone ? `\n\nสอบถามบริการเพิ่มเติมโทร ${phone} ได้ตลอดครับ` : ''}`
      : `✨ Highlights & Facilities at ${displayName}:\n${hlList}${
          amText ? `\n\nIn-room amenities include: ${amText}` : ''
        }${phone ? `\n\nFor specific requests, please contact us at ${phone}.` : ''}`;
  }

  // 5. Contact Info
  if (/ติดต่อ|เบอร์|โทร|ไลน์|อีเมล|ช่องทาง|contact|phone|call|line|whatsapp|email/.test(q)) {
    return isThai
      ? `📞 ช่องทางติดต่อ ${displayName}:\n${
          contactItems.map((c) => `• ${c}`).join('\n') || '• กรุณาดูที่หน้า Contact ของเว็บไซต์ครับ'
        }${addressTh ? `\n📍 ที่อยู่: ${addressTh}` : ''}`
      : `📞 Contact ${displayName}:\n${
          contactItems.map((c) => `• ${c}`).join('\n') || '• Please visit our Contact page.'
        }${addressEn ? `\n📍 Address: ${addressEn}` : ''}`;
  }

  // 6. Rooms / Rates / Capacity
  if (
    /ห้อง|ราคา|เท่าไหร่|เริ่มต้น|พักได้|เตียง|ว่าง|จอง|room|price|rate|cost|how much|bed|book|availab/.test(q) &&
    rooms.length > 0
  ) {
    const roomSummaryTh = rooms
      .slice(0, 6)
      .map(
        (r: Room) =>
          `• ${r.name}${r.price ? ` — เริ่มต้น ฿${Math.round(r.price).toLocaleString()}/คืน` : ''} (พักได้สูงสุด ${
            r.max_guests || 2
          } ท่าน)`
      )
      .join('\n');
    const roomSummaryEn = rooms
      .slice(0, 6)
      .map(
        (r: Room) =>
          `• ${r.name}${r.price ? ` — from THB ${Math.round(r.price).toLocaleString()}/night` : ''} (up to ${
            r.max_guests || 2
          } guests)`
      )
      .join('\n');

    return isThai
      ? `🛏️ ประเภทห้องพักของ ${displayName}${
          lowestPrice > 0 ? ` (ราคาเริ่มต้น ฿${Math.round(lowestPrice).toLocaleString()}/คืน)` : ''
        }:\n${roomSummaryTh}\n\nสามารถกดปุ่ม "Book Now" เลือกวันเช็คอิน–เช็คเอาท์เพื่อดูห้องว่างและราคาโปรโมชั่นแบบเรียลไทม์ได้เลยครับ!`
      : `🛏️ Room types at ${displayName}${
          lowestPrice > 0 ? ` (starting from THB ${Math.round(lowestPrice).toLocaleString()}/night)` : ''
        }:\n${roomSummaryEn}\n\nClick "Book Now" and select your dates to check live availability and direct booking discounts!`;
  }

  // 7. General Overview / Greeting
  const desc =
    (isThai ? fsHotel.description || aboutContent?.description : fsHotel.descriptionEn || aboutContent?.description) ||
    '';
  const cleanDesc = desc.length > 260 ? `${desc.slice(0, 260).trim()}...` : desc;
  const addrSummary = isThai ? addressTh || addressEn : addressEn || addressTh;

  return isThai
    ? `สวัสดีครับ! ยินดีต้อนรับสู่ ${displayName} 🙏${
        cleanDesc ? `\n\n${cleanDesc}` : ''
      }${addrSummary ? `\n\n📍 ที่ตั้ง: ${addrSummary}` : ''}\n🕒 เช็คอิน ${checkIn} น. | เช็คเอาท์ ${checkOut} น.${
        lowestPrice > 0 ? `\n💰 ห้องพักเริ่มต้น: ฿${Math.round(lowestPrice).toLocaleString()}/คืน` : ''
      }${
        contactItems.length ? `\n📞 ติดต่อ: ${contactItems.join(' | ')}` : ''
      }\n\nต้องการสอบถามเรื่องห้องพัก ราคา โปรโมชั่น หรือการเดินทาง พิมพ์ถามได้เลยครับ!`
    : `Welcome to ${displayName}!${cleanDesc ? `\n\n${cleanDesc}` : ''}${
        addrSummary ? `\n\n📍 Location: ${addrSummary}` : ''
      }\n🕒 Check-in: ${checkIn} | Check-out: ${checkOut}${
        lowestPrice > 0 ? `\n💰 Rooms from: THB ${Math.round(lowestPrice).toLocaleString()}/night` : ''
      }${
        contactItems.length ? `\n📞 Contact: ${contactItems.join(' | ')}` : ''
      }\n\nFeel free to ask about our rooms, rates, promotions, facilities, or directions!`;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') || '';
  if (!slug.trim()) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  const info = await lookupFlowStayHotel(slug);
  return NextResponse.json({
    flowstayId: info.flowstayId,
    phone: info.phone,
    email: info.email,
    lineId: info.lineId,
    whatsapp: info.whatsapp,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action === 'clear' ? 'clear' : 'send';
    const slug = String(body?.slug || '').trim();
    const sessionId = String(body?.sessionId || '').trim();
    const message = String(body?.message || '').trim();
    const history: ChatTurn[] = Array.isArray(body?.history) ? body.history : [];
    const rawHotelId = Number(body?.flowstayId || body?.hotelId || 0);

    const fsHotel = await lookupFlowStayHotel(slug);
    const resolvedFlowstayId =
      Number.isFinite(rawHotelId) && rawHotelId > 0 ? rawHotelId : fsHotel.flowstayId;

    if (action === 'clear') {
      if (resolvedFlowstayId && sessionId) {
        await fetch(`${FLOWSTAY_API_BASE}/api/trpc/hotelAiChat.clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            json: { hotelId: resolvedFlowstayId, sessionId },
          }),
        }).catch(() => {});
      }
      return NextResponse.json({ success: true });
    }

    if (!message) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    // 1. Delegate to FlowStay hotelAiChat.send first (logs guest chat in FlowStay DB & invokes Gemini with live calendar/promo rates)
    if (resolvedFlowstayId && sessionId) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 16000);
      try {
        const res = await fetch(`${FLOWSTAY_API_BASE}/api/trpc/hotelAiChat.send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            json: {
              hotelId: resolvedFlowstayId,
              sessionId,
              message: message.slice(0, 2000),
            },
          }),
          signal: controller.signal,
        });

        if (res.ok) {
          const payload = await res.json();
          const data = payload?.result?.data?.json ?? payload?.result?.data;
          const replyText = typeof data?.response === 'string' ? data.response.trim() : '';
          if (replyText && !isUpstreamErrorReply(replyText)) {
            return NextResponse.json({ response: replyText });
          }
        }
      } catch {
        // Fall through to direct Gemini concierge
      } finally {
        clearTimeout(timer);
      }
    }

    // 2. Direct Gemini LLM Concierge on Hotel Website as backup or for local-only hotels
    const directGeminiReply = await invokeDirectGeminiConcierge(
      slug,
      message.slice(0, 2000),
      history,
      fsHotel
    );
    if (directGeminiReply) {
      return NextResponse.json({ response: directGeminiReply });
    }

    // 3. Guaranteed rich hotel knowledge concierge responder
    const fallbackReply = await buildLocalConciergeReply(slug, message, fsHotel);
    return NextResponse.json({ response: fallbackReply });
  } catch {
    return NextResponse.json(
      { response: 'Sorry, something went wrong. Please try again.' },
      { status: 200 }
    );
  }
}
