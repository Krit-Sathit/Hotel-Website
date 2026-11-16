import type {
  Hotel,
  HeroSlide,
  HomepageSection,
  Room,
  Promotion,
} from '@/lib/db/mock-data';
import { isTheParPhuketHotel } from '@/lib/hotel-seo-highlights';

export type HotelLocale = 'en' | 'th';

export const HOTEL_LOCALE_COOKIE = 'hotel_locale';

export function parseHotelLocale(raw?: string | null): HotelLocale {
  return raw?.trim().toLowerCase() === 'th' ? 'th' : 'en';
}

const AMENITY_EN_TO_TH: Record<string, string> = {
  'free wifi': 'Wi-Fi ฟรี',
  'free wi-fi': 'Wi-Fi ฟรี',
  'wi-fi': 'Wi-Fi ฟรี',
  wifi: 'Wi-Fi ฟรี',
  'high-speed wi-fi': 'Wi-Fi ความเร็วสูงฟรี',
  'air conditioning': 'เครื่องปรับอากาศ',
  minibar: 'มินิบาร์',
  'private bathroom': 'ห้องน้ำส่วนตัว',
  shower: 'ฝักบัวอาบน้ำ',
  hairdryer: 'ไดร์เป่าผม',
  towels: 'ผ้าเช็ดตัว',
  'flat-screen tv': 'ทีวีจอแบน',
  'satellite channels': 'ช่องดาวเทียม',
  telephone: 'โทรศัพท์ในห้องพัก',
  'socket near bed': 'ปลั๊กไฟข้างเตียง',
  'wake-up service': 'บริการโทรปลุก',
  'alarm clock': 'นาฬิกาปลุก',
  'clothes rack': 'ราวแขวนเสื้อผ้า',
  desk: 'โต๊ะทำงาน',
  balcony: 'ระเบียงส่วนตัว',
  'garden view': 'วิวสวน',
  'pool view': 'วิวสระว่ายน้ำ',
  'sea view': 'วิวทะเล',
  'city view': 'วิวเมือง',
  'mountain view': 'วิวภูเขา',
  'sitting area': 'มุมนั่งเล่น',
  linens: 'ชุดเครื่องนอนคุณภาพสูง',
  'interconnecting rooms': 'ห้องเชื่อมถึงกัน',
  'outdoor furniture': 'เฟอร์นิเจอร์ระเบียงกลางแจ้ง',
  'ironing facilities': 'อุปกรณ์รีดผ้า',
  bathtub: 'อ่างอาบน้ำ',
  'free toiletries': 'ของใช้ในห้องน้ำฟรี',
  toiletries: 'ของใช้ในห้องน้ำฟรี',
  bathrobe: 'เสื้อคลุมอาบน้ำ',
  slippers: 'รองเท้าแตะในห้องพัก',
  'no smoking': 'ห้องปลอดบุหรี่',
  'electric kettle': 'กาต้มน้ำไฟฟ้า',
  'tea/coffee maker': 'ชุดชงชาและกาแฟ',
  refrigerator: 'ตู้เย็น',
  'dining area': 'พื้นที่รับประทานอาหาร',
  safe: 'ตู้นิรภัย',
  wardrobe: 'ตู้เสื้อผ้า',
};

const BED_TYPE_EN_TO_TH: Record<string, string> = {
  'king bed': 'เตียงคิงไซส์',
  king: 'เตียงคิงไซส์',
  'queen bed': 'เตียงควีนไซส์',
  queen: 'เตียงควีนไซส์',
  'double bed': 'เตียงใหญ่',
  double: 'เตียงใหญ่',
  'twin beds': 'เตียงแฝด (2 เตียงเดี่ยว)',
  'twin bed': 'เตียงแฝด',
  twin: 'เตียงแฝด',
  'single bed': 'เตียงเดี่ยว',
  single: 'เตียงเดี่ยว',
  'bunk bed': 'เตียงสองชั้น',
  'standard bed': 'เตียงมาตรฐาน',
};

export function translateAmenityLabel(label: string, locale: HotelLocale): string {
  if (locale !== 'th' || !label) return label;
  const key = label.trim().toLowerCase();
  return AMENITY_EN_TO_TH[key] || label;
}

export function translateBedType(bedType: string, locale: HotelLocale): string {
  if (locale !== 'th' || !bedType) return bedType;
  const key = bedType.trim().toLowerCase();
  return BED_TYPE_EN_TO_TH[key] || bedType;
}

export function localizeHotel(hotel: Hotel, locale: HotelLocale): Hotel {
  if (locale !== 'th') return hotel;
  return {
    ...hotel,
    name: hotel.name_th?.trim() || hotel.name,
    address: hotel.address_th?.trim() || hotel.address,
    description: hotel.description_th?.trim() || hotel.description,
  };
}

export function localizeSlides(slides: HeroSlide[], locale: HotelLocale): HeroSlide[] {
  if (locale !== 'th') return slides;
  return slides.map((s) => ({
    ...s,
    headline: s.headline_th?.trim() || s.headline,
    subheadline:
      s.subheadline_th?.trim() ||
      (s.subheadline === 'Direct Booking • Best Rate Guaranteed'
        ? 'จองตรงกับที่พัก • การันตีราคาดีที่สุด'
        : s.subheadline === 'Comfort & Warm Hospitality'
        ? 'ความสะดวกสบายและการบริการที่อบอุ่น'
        : s.subheadline === 'Explore Our Accommodations'
        ? 'สำรวจห้องพักของเรา'
        : s.subheadline === 'Unforgettable Moments'
        ? 'ช่วงเวลาแห่งการพักผ่อนที่น่าประทับใจ'
        : s.subheadline),
    button_text:
      s.button_text_th?.trim() ||
      (s.button_text?.toLowerCase() === 'book your stay' ? 'จองห้องพัก' : s.button_text),
  }));
}

export function localizeRooms(rooms: Room[], locale: HotelLocale): Room[] {
  if (locale !== 'th') return rooms;
  return rooms.map((r) => {
    const amenitiesTh =
      Array.isArray(r.amenities_th) && r.amenities_th.length > 0
        ? r.amenities_th
        : (r.amenities || []).map((a) => translateAmenityLabel(a, 'th'));

    return {
      ...r,
      name: r.name_th?.trim() || r.name,
      description: r.description_th?.trim() || r.description,
      amenities: amenitiesTh,
      bed_type: translateBedType(r.bed_type, 'th'),
      promo_name: r.promo_name_th?.trim() || r.promo_name,
    };
  });
}

export function localizePromotions(promotions: Promotion[], locale: HotelLocale): Promotion[] {
  if (locale !== 'th') return promotions;
  return promotions.map((p) => ({
    ...p,
    title: p.title_th?.trim() || p.title,
    description: p.description_th?.trim() || p.description,
    cta_text:
      p.cta_text_th?.trim() ||
      (p.cta_text?.toLowerCase() === 'book offer' ? 'จองโปรโมชั่นนี้' : p.cta_text),
  }));
}

export function localizeSections(
  sections: HomepageSection[],
  hotel: Hotel,
  locale: HotelLocale
): HomepageSection[] {
  if (locale !== 'th') {
    // Clean up facility desc if English mode had Thai label in desc
    return sections.map((sec) => {
      if (sec.section_type === 'facilities' && Array.isArray(sec.content?.items)) {
        return {
          ...sec,
          content: {
            ...sec.content,
            items: sec.content.items.map((it: any) => ({
              ...it,
              desc: it.desc_en || it.desc,
            })),
          },
        };
      }
      return sec;
    });
  }

  const isParPhuket = isTheParPhuketHotel(hotel.slug, hotel.name);
  const hotelNameTh = hotel.name_th?.trim() || hotel.name;

  return sections.map((sec) => {
    if (sec.section_type === 'about') {
      const c = sec.content || {};
      const descTh =
        c.description_th?.trim() ||
        hotel.description_th?.trim() ||
        (isParPhuket
          ? 'เดอะ พาร์ ภูเก็ต (The Par Phuket) โรงแรมสไตล์ Golf & Lifestyle ท่ามกลางบรรยากาศร่มรื่นเขียวขจีของสนามกอล์ฟ ภูเก็ต คันทรี คลับ ย่านกะทู้ ผสานความเงียบสงบของธรรมชาติเข้ากับความสะดวกสบายทันสมัยอย่างลงตัว\n\nภายในโรงแรมเพียบพร้อมด้วยสระว่ายน้ำกลางแจ้ง ค่ายมวยไทยมาตรฐาน ห้องประชุมสัมมนา ที่จอดรถกว้างขวาง และเดินทางสะดวกใกล้เขื่อนบางวาดและเซ็นทรัล ภูเก็ต'
          : c.description);

      const features = Array.isArray(c.features)
        ? c.features.map((f: any) => ({
            ...f,
            title:
              f.title_th ||
              (f.title === 'Check-in / Check-out'
                ? 'เวลาเช็คอิน / เช็คเอาท์'
                : f.title === 'Best Rate Guaranteed'
                ? 'การันตีราคาดีที่สุด'
                : f.title),
            desc: f.desc_th || f.desc,
          }))
        : c.features;

      return {
        ...sec,
        content: {
          ...c,
          badge:
            c.badge_th ||
            (isParPhuket
              ? 'โรงแรมสไตล์กอล์ฟและไลฟ์สไตล์ในภูเก็ต'
              : c.badge === 'Official Hotel Website'
              ? 'เว็บไซต์ทางการของโรงแรม'
              : c.badge),
          subtitle: c.subtitle_th || `ยินดีต้อนรับสู่ ${hotelNameTh}`,
          title:
            c.title_th ||
            (isParPhuket ? 'พักผ่อนท่ามกลางสนามกอล์ฟและธรรมชาติ ที่ เดอะ พาร์ ภูเก็ต' : hotelNameTh),
          description: descTh,
          story2_title: c.story2_title_th || (c.story2_title ? c.story2_title : `วางแผนการเข้าพักที่ ${hotelNameTh}`),
          story2_description: c.story2_description_th || c.story2_description,
          features,
        },
      };
    }

    if (sec.section_type === 'facilities') {
      const c = sec.content || {};
      const items = Array.isArray(c.items)
        ? c.items.map((it: any) => ({
            ...it,
            title: it.title_th || translateAmenityLabel(it.title || '', 'th'),
            desc: it.desc_th || it.desc,
          }))
        : c.items;
      return {
        ...sec,
        content: {
          ...c,
          title: c.title_th || 'สิ่งอำนวยความสะดวกและบริการ',
          subtitle: c.subtitle_th || 'คัดสรรอย่างใส่ใจเพื่อการพักผ่อนของคุณ',
          items,
        },
      };
    }

    return sec;
  });
}

export function getHotelUiText(locale: HotelLocale) {
  if (locale === 'th') {
    return {
      nav: {
        home: 'หน้าแรก',
        rooms: 'ห้องพัก',
        promotions: 'โปรโมชั่น',
        gallery: 'แกลเลอรี',
        contact: 'ติดต่อเรา',
        discover: 'ค้นพบที่พัก',
        overview: 'ภาพรวม',
        offers: 'โปรโมชั่นพิเศษ',
        accommodation: 'ห้องพัก',
        experiences: 'จุดเด่นที่พัก',
        location: 'แผนที่และที่ตั้ง',
        ourRooms: 'ห้องพักของเรา',
        amenitiesFacilities: 'สิ่งอำนวยความสะดวก',
        neighborhoodStory: 'เรื่องราวของที่พัก',
        directPrivileges: 'สิทธิพิเศษจองตรง',
        locationContact: 'ที่ตั้งและติดต่อ',
      },
      cta: {
        bookNow: 'จองเลย',
        book: 'จอง',
        reserve: 'จองห้องพัก',
        reserveDirect: 'จองตรงราคาพิเศษ →',
        bookDirectBestRate: 'จองตรงกับโรงแรม — ราคาดีที่สุด',
        checkAvailability: 'เช็กห้องว่าง',
        searchRooms: 'ค้นหาห้องว่าง',
        viewAllRooms: 'ดูห้องพักทั้งหมด',
        viewDetails: 'ดูรายละเอียด',
        clickView: 'เปิดชมภาพถ่าย',
        openMaps: 'เปิดนำทางด้วย Google Maps',
      },
      badges: {
        officialWebsite: 'เว็บไซต์ทางการของโรงแรม',
        officialStay: 'จองตรงกับที่พัก',
        officialDirectRate: 'การันตีราคาจองตรงดีที่สุด',
        lowestDirectRate: 'ราคาจองตรงถูกที่สุด',
        perNight: '/ คืน',
        guaranteedBestRates: 'การันตีราคาดีที่สุดเมื่อจองตรง',
        allRightsReserved: 'สงวนลิขสิทธิ์',
        bestRateGuaranteed: 'การันตีราคาดีที่สุด • ยืนยันห้องพักทันที',
      },
      bookingForm: {
        officialDirectBooking: 'ระบบจองตรงกับโรงแรม',
        checkAvailability: 'เช็กห้องว่างและราคา',
        bestRateAt: 'การันตีราคาดีที่สุดเมื่อจองตรงกับ',
        checkIn: 'วันเช็คอิน',
        checkOut: 'วันเช็คเอาท์',
        guests: 'ผู้เข้าพัก',
        promoCode: 'รหัสโปรโมชั่น',
        optional: 'ถ้ามี',
        codePlaceholder: 'กรอกโค้ด',
        searchAvailableRooms: 'ค้นหาห้องว่าง',
        adult1: 'ผู้ใหญ่ 1 ท่าน',
        adults2: 'ผู้ใหญ่ 2 ท่าน',
        adults3: 'ผู้ใหญ่ 3 ท่าน',
        adults4: 'ผู้ใหญ่ 4 ท่าน',
        adults5Plus: 'ผู้ใหญ่ 5+ ท่าน',
        guestCount: (n: number) => `${n} ท่าน`,
      },
      sections: {
        accommodationsEyebrow: 'ห้องพักและสวีท',
        accommodationsTitle: 'ห้องพักของเรา',
        accommodationsSubtitle: 'พักผ่อนอย่างสะดวกสบายด้วยสิ่งอำนวยความสะดวกครบครัน พร้อมราคาพิเศษเมื่อจองตรง',
        upToGuests: (n: number) => `สูงสุด ${n} ท่าน`,
        maxGuests: (n: number) => `พักได้ ${n} ท่าน`,
        promotionsEyebrow: 'ข้อเสนอสุดพิเศษ',
        promotionsTitle: 'โปรโมชั่นสำหรับการจองตรง',
        promotionsSubtitle: 'รับสิทธิพิเศษและส่วนลดคุ้มค่าที่สุดเมื่อสำรองห้องพักผ่านเว็บไซต์ทางการของเรา',
        noPromotions: 'ยังไม่มีโปรโมชั่นเพิ่มเติมในขณะนี้',
        noPromotionsSub: 'คุณยังสามารถรับราคาพิเศษ Best Rate Guaranteed ได้ทันทีที่หน้าจองห้องพัก',
        promoCodeLabel: 'โค้ดส่วนลด:',
        galleryEyebrow: 'ภาพบรรยากาศ',
        galleryTitle: 'แกลเลอรีที่พัก',
        explorePhotoTour: 'ชมภาพบรรยากาศทั้งหมด',
        locationEyebrow: 'แผนที่และการเดินทาง',
        nearbySights: 'สถานที่สำคัญใกล้เคียง',
        contactEyebrow: 'ติดต่อสอบถาม',
        contactTitle: 'สอบถามข้อมูลและสำรองห้องพัก',
        contactSubtitle: 'ติดต่อทีมงานของโรงแรมโดยตรงเพื่อสอบถามข้อมูลห้องพัก เส้นทาง หรือบริการเพิ่มเติม',
        conciergeLine: 'เบอร์โทรศัพท์ติดต่อ',
        emailRelations: 'อีเมลติดต่อ',
        addressLabel: 'ที่ตั้งโรงแรม',
        sendMessageTitle: 'ส่งข้อความถึงโรงแรม',
        yourName: 'ชื่อ - นามสกุล',
        yourEmail: 'อีเมล',
        yourPhone: 'เบอร์โทรศัพท์',
        yourMessage: 'ข้อความที่ต้องการสอบถาม',
        sendBtn: 'ส่งข้อความ',
        sendingBtn: 'กำลังส่งข้อความ...',
        sentSuccess: 'ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ',
        backToRooms: 'กลับไปหน้าห้องพักทั้งหมด',
        theExperience: 'รายละเอียดห้องพัก',
        roomSize: 'ขนาดห้องพัก',
        capacity: 'จำนวนผู้เข้าพัก',
        beddingConfig: 'ประเภทเตียง',
        premiumAmenities: 'สิ่งอำนวยความสะดวกในห้องพัก',
      },
    };
  }

  return {
    nav: {
      home: 'Home',
      rooms: 'Rooms',
      promotions: 'Promotions',
      gallery: 'Gallery',
      contact: 'Contact',
      discover: 'Discover',
      overview: 'Overview',
      offers: 'Offers',
      accommodation: 'Accommodation',
      experiences: 'Experiences',
      location: 'Location',
      ourRooms: 'OUR ROOMS',
      amenitiesFacilities: 'AMENITIES & FACILITIES',
      neighborhoodStory: 'NEIGHBORHOOD STORY',
      directPrivileges: 'DIRECT PRIVILEGES',
      locationContact: 'LOCATION & CONTACT',
    },
    cta: {
      bookNow: 'Book Now',
      book: 'Book',
      reserve: 'Reserve',
      reserveDirect: 'Reserve Direct →',
      bookDirectBestRate: 'Book Direct — Best Rate',
      checkAvailability: 'Check Availability',
      searchRooms: 'Search Rooms',
      viewAllRooms: 'View All Rooms',
      viewDetails: 'View Details',
      clickView: 'CLICK VIEW',
      openMaps: 'Open Exact GPS in Google Maps',
    },
    badges: {
      officialWebsite: 'Official Hotel Website',
      officialStay: 'Official Stay',
      officialDirectRate: 'Official Direct Rate',
      lowestDirectRate: 'Lowest Direct Rate',
      perNight: '/ night',
      guaranteedBestRates: 'Guaranteed Best Rates',
      allRightsReserved: 'All Rights Reserved.',
      bestRateGuaranteed: 'Official Direct Booking • Best Rate Guaranteed',
    },
    bookingForm: {
      officialDirectBooking: 'Official Direct Booking',
      checkAvailability: 'Check Availability',
      bestRateAt: 'Best Rate Guaranteed at',
      checkIn: 'Check-In',
      checkOut: 'Check-Out',
      guests: 'Guests',
      promoCode: 'Promo Code',
      optional: 'Optional',
      codePlaceholder: 'Code',
      searchAvailableRooms: 'Search Available Rooms',
      adult1: '1 Adult',
      adults2: '2 Adults',
      adults3: '3 Adults',
      adults4: '4 Adults',
      adults5Plus: '5+ Adults',
      guestCount: (n: number) => `${n} ${n === 1 ? 'Adult' : 'Adults'}`,
    },
    sections: {
      accommodationsEyebrow: 'Bespoke Sanctuaries',
      accommodationsTitle: 'Our Accommodations',
      accommodationsSubtitle:
        'Immerse yourself in complete comfort and luxury crafted down to the finest detail.',
      upToGuests: (n: number) => `Up to ${n} Guests`,
      maxGuests: (n: number) => `Max ${n} Guests`,
      promotionsEyebrow: 'Curated Campaigns',
      promotionsTitle: 'Exclusive Offers',
      promotionsSubtitle:
        'Enjoy premium privileges and tailored experiences designed to elevate your stay.',
      noPromotions: 'No active promotions at this time.',
      noPromotionsSub: 'Book directly on our booking page for our Best Rate Guaranteed.',
      promoCodeLabel: 'Promo Code:',
      galleryEyebrow: 'Visual Journey',
      galleryTitle: 'Property Gallery',
      explorePhotoTour: 'Explore Full Photo Tour',
      locationEyebrow: 'Location & Directions',
      nearbySights: 'Nearby Sights',
      contactEyebrow: 'Connect With Us',
      contactTitle: 'Inquiries & Contact',
      contactSubtitle:
        'Reach out to our concierge team to organize reservations or ask any questions regarding your arrival.',
      conciergeLine: 'Concierge Line',
      emailRelations: 'Email Relations',
      addressLabel: 'Property Address',
      sendMessageTitle: 'Send Us a Direct Inquiry',
      yourName: 'Full Name',
      yourEmail: 'Email Address',
      yourPhone: 'Phone Number',
      yourMessage: 'How can we assist with your stay?',
      sendBtn: 'Send Inquiry',
      sendingBtn: 'Sending...',
      sentSuccess: 'Thank you! Your message has been received by our front desk team.',
      backToRooms: 'Back to Accommodations',
      theExperience: 'The Experience',
      roomSize: 'Room Size',
      capacity: 'Capacity',
      beddingConfig: 'Bedding Config',
      premiumAmenities: 'Premium Amenities',
    },
  };
}
