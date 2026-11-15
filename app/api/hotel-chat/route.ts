import { NextRequest, NextResponse } from 'next/server';
import { getHotelBySlug, getRooms, getPromotions } from '@/lib/db/mock-data';

const FLOWSTAY_API_BASE = (
  process.env.FLOWSTAY_API_URL ||
  process.env.NEXT_PUBLIC_FLOWSTAY_URL ||
  'https://flowstay.live'
).replace(/\/+$/, '');

function normalizeSlugForFlowStay(slug: string): string {
  const clean = (slug || '').trim().toLowerCase();
  if (clean === 'the-par-phuket' || clean === 'hotel-1784206393534') {
    return 'theparphuket';
  }
  return clean;
}

interface CachedFlowStayContact {
  expiresAt: number;
  flowstayId: number | null;
  phone: string;
  email: string;
  lineId: string;
  whatsapp: string;
}

const contactCache = new Map<string, CachedFlowStayContact>();

async function lookupFlowStayHotelContact(slug: string): Promise<CachedFlowStayContact> {
  const normalized = normalizeSlugForFlowStay(slug);
  const now = Date.now();
  const cached = contactCache.get(normalized);
  if (cached && cached.expiresAt > now) {
    return cached;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const encoded = encodeURIComponent(JSON.stringify({ json: { slug: normalized } }));
    const res = await fetch(`${FLOWSTAY_API_BASE}/api/trpc/hotel.bySlug?input=${encoded}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (res.ok) {
      const payload = await res.json();
      const h = payload?.result?.data?.json ?? payload?.result?.data;
      if (h && typeof h === 'object') {
        const entry: CachedFlowStayContact = {
          expiresAt: now + 60_000,
          flowstayId: typeof h.id === 'number' ? h.id : Number(h.id) || null,
          phone: String(h.contactPhone || '').trim(),
          email: String(h.contactEmail || h.bookingEmail || '').trim(),
          lineId: String(h.lineId || '').trim(),
          whatsapp: String(h.whatsapp || '').trim(),
        };
        contactCache.set(normalized, entry);
        return entry;
      }
    }
  } catch {
    // Fallback to empty entry below
  } finally {
    clearTimeout(timer);
  }

  return {
    expiresAt: now + 15_000,
    flowstayId: null,
    phone: '',
    email: '',
    lineId: '',
    whatsapp: '',
  };
}

async function buildLocalConciergeReply(slug: string, message: string): Promise<string> {
  const isThai = /[\u0E00-\u0E7F]/.test(message);
  const hotel = await getHotelBySlug(slug);
  if (!hotel) {
    return isThai
      ? 'ขออภัยครับ ขณะนี้ไม่สามารถดึงข้อมูลที่พักได้ กรุณาติดต่อโรงแรมโดยตรงครับ'
      : 'Sorry, hotel information is temporarily unavailable. Please contact the hotel directly.';
  }

  const [rooms, promotions] = await Promise.all([
    getRooms(hotel.id).catch(() => []),
    getPromotions(hotel.id).catch(() => []),
  ]);

  const lowestPrice = rooms.reduce((min, r) => {
    const p = Number(r.price || 0);
    return p > 0 && (min === 0 || p < min) ? p : min;
  }, 0);

  const q = message.toLowerCase();
  if (/โปร|ส่วนลด|promo|discount|offer|deal/.test(q)) {
    if (promotions.length > 0) {
      const list = promotions.slice(0, 4).map((p) => `• ${p.title}`).join('\n');
      return isThai
        ? `โปรโมชั่นปัจจุบันของ ${hotel.name}:\n${list}\nสามารถกดปุ่มจองห้องพักเพื่อรับราคาพิเศษได้ทันทีครับ`
        : `Current promotions at ${hotel.name}:\n${list}\nYou can click Book Now to view live discounted rates.`;
    }
    return isThai
      ? `สามารถตรวจสอบราคาพิเศษล่าสุดของ ${hotel.name} ได้ที่หน้าจองห้องพักโดยตรงครับ`
      : `You can check our latest direct booking rates at ${hotel.name} on the booking page.`;
  }

  if (/เช็คอิน|เช็คเอาท์|เวลา|กี่โมง|check-?in|check-?out|time/.test(q)) {
    return isThai
      ? `เวลาเช็คอินปกติของ ${hotel.name} คือตั้งแต่ 14:00 น. และเช็คเอาท์ไม่เกิน 12:00 น. ครับ หากต้องการเช็คอินก่อนเวลา สามารถติดต่อแจ้งที่พักล่วงหน้าได้ครับ`
      : `Standard check-in at ${hotel.name} is from 14:00 and check-out is until 12:00. Please contact us in advance if you need early check-in.`;
  }

  if (/ราคา|เท่าไหร่|เริ่มต้น|price|rate|cost|how much/.test(q) && lowestPrice > 0) {
    return isThai
      ? `ราคาห้องพักของ ${hotel.name} เริ่มต้นประมาณ ฿${lowestPrice.toLocaleString()} / คืน (ขึ้นอยู่กับวันที่เข้าพักและประเภทห้อง) สามารถเลือกวันเข้าพักเพื่อเช็กราคาว่างแบบเรียลไทม์ได้เลยครับ`
      : `Room rates at ${hotel.name} start from THB ${lowestPrice.toLocaleString()} / night depending on dates and room type. Select your dates on our booking page for real-time availability.`;
  }

  if (rooms.length > 0) {
    const roomSummary = rooms
      .slice(0, 5)
      .map((r) => `• ${r.name}${r.price ? ` (฿${Math.round(r.price).toLocaleString()}/คืน)` : ''}`)
      .join('\n');
    return isThai
      ? `สวัสดีครับ! ยินดีต้อนรับสู่ ${hotel.name}\nห้องพักของเรามีดังนี้ครับ:\n${roomSummary}${hotel.phone ? `\n\nสอบถามเพิ่มเติมโทร ${hotel.phone}` : ''}`
      : `Welcome to ${hotel.name}! Here are our room types:\n${rooms
          .slice(0, 5)
          .map((r) => `• ${r.name}${r.price ? ` (THB ${Math.round(r.price).toLocaleString()}/night)` : ''}`)
          .join('\n')}${hotel.phone ? `\n\nFeel free to call us at ${hotel.phone} for assistance.` : ''}`;
  }

  return isThai
    ? `สวัสดีครับ! ยินดีต้อนรับสู่ ${hotel.name}${hotel.address ? ` (${hotel.address})` : ''}${hotel.phone ? ` สามารถติดต่อเราได้ที่เบอร์ ${hotel.phone}` : ''}`
    : `Welcome to ${hotel.name}!${hotel.address ? ` Address: ${hotel.address}.` : ''}${hotel.phone ? ` Contact us at ${hotel.phone}.` : ''}`;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') || '';
  if (!slug.trim()) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  const info = await lookupFlowStayHotelContact(slug);
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
    const rawHotelId = Number(body?.flowstayId || body?.hotelId || 0);

    let resolvedFlowstayId = Number.isFinite(rawHotelId) && rawHotelId > 0 ? rawHotelId : null;
    if (!resolvedFlowstayId && slug) {
      const contact = await lookupFlowStayHotelContact(slug);
      resolvedFlowstayId = contact.flowstayId;
    }

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

    if (resolvedFlowstayId && sessionId) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
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
          if (data?.response) {
            return NextResponse.json({ response: String(data.response) });
          }
        }
      } catch {
        // Fall through to local concierge fallback
      } finally {
        clearTimeout(timer);
      }
    }

    const fallbackReply = await buildLocalConciergeReply(slug, message);
    return NextResponse.json({ response: fallbackReply });
  } catch {
    return NextResponse.json(
      { response: 'Sorry, something went wrong. Please try again.' },
      { status: 200 }
    );
  }
}
