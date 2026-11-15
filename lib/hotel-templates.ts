import type { HotelTheme } from '@/lib/db/mock-data';

export type TemplateCategory =
  | 'all'
  | 'resort'
  | 'editorial'
  | 'boutique'
  | 'conversion'
  | 'architectural';

export type HeroLayoutVariant =
  | 'full-slider'
  | 'split-screen'
  | 'floating-dock'
  | 'cinema-crest'
  | 'photo-mosaic'
  | 'zen-framed'
  | 'curved-coastal'
  | 'sidebar-canvas'
  | 'magazine-masthead'
  | 'booking-card-hero'
  | 'arched-courtyard'
  | 'widescreen-noir'
  | 'story-above-hero'
  | 'compact-direct'
  | 'triptych-panels'
  | 'bento-stack'
  | 'indigo-story-hero';

export type RoomsLayoutVariant =
  | 'grid-2'
  | 'zigzag-horizontal'
  | 'grid-3-bento'
  | 'luxury-rows'
  | 'sidebar-sticky-list'
  | 'zen-minimal-list'
  | 'villa-multi-thumb'
  | 'arched-cards'
  | 'portrait-posters'
  | 'rate-table-pro'
  | 'indigo-boutique-suites';

export type AboutLayoutVariant =
  | 'overlapping-photos'
  | 'centered-manifesto'
  | 'bento-highlights'
  | 'arched-trio'
  | 'split-sticky'
  | 'minimal-zen'
  | 'indigo-coastal-story';

export type ShellStyleVariant =
  | 'standard'
  | 'left-sidebar'
  | 'floating-pill-nav'
  | 'card-stack-canvas'
  | 'indigo-boutique';

export interface HotelWebsiteTemplate {
  id: string;
  number: number;
  name: string;
  nameTh: string;
  layoutBadge: string;
  category: Exclude<TemplateCategory, 'all'>;
  categoryLabel: string;
  tagline: string;
  features: string[];
  shellStyle: ShellStyleVariant;
  heroLayout: HeroLayoutVariant;
  aboutLayout: AboutLayoutVariant;
  roomsLayout: RoomsLayoutVariant;
  fallbackHeroImage: string;
  theme: HotelTheme;
}

export const TEMPLATE_CATEGORIES: Array<{ id: TemplateCategory; label: string }> = [
  { id: 'all', label: 'ทั้งหมด (17 Layout)' },
  { id: 'resort', label: 'รีสอร์ท & พูลวิลล่า' },
  { id: 'editorial', label: 'นิตยสาร & สปลิตสกรีน' },
  { id: 'boutique', label: 'บูทีค & โมเสกแกลเลอรี' },
  { id: 'architectural', label: 'เมนูข้าง & สถาปัตยกรรม' },
  { id: 'conversion', label: 'เน้นจองตรง (Direct Booking)' },
];

export const HOTEL_WEBSITE_TEMPLATES: HotelWebsiteTemplate[] = [
  {
    id: 'classic-gold',
    number: 1,
    name: 'Classic Full-Bleed Resort',
    nameTh: 'แบบที่ 1: คลาสสิก ฟูลสกรีน รีสอร์ท',
    layoutBadge: 'Full-Width Slider + 2-Col Grid',
    category: 'resort',
    categoryLabel: 'รีสอร์ท & พูลวิลล่า',
    tagline: 'เลย์เอาต์มาตรฐานสากล สไลด์ภาพเต็มจอ แถบจองติดขอบบน ภาพซ้อนแบบอสมมาตร และการ์ดห้องพัก 2 คอลัมน์',
    features: ['สไลด์ภาพเต็มจอ 100%', 'แถบจองแนวนอนด้านบน', 'ห้องพัก 2 คอลัมน์ใหญ่'],
    shellStyle: 'standard',
    heroLayout: 'full-slider',
    aboutLayout: 'overlapping-photos',
    roomsLayout: 'grid-2',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'classic-gold',
      primary_color: '#0f172a',
      secondary_color: '#334155',
      accent_color: '#c5a880',
      background_color: '#ffffff',
      text_color: '#0f172a',
      button_style: 'rounded',
      border_radius: '8px',
      font_family: 'Inter',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'columns',
      animation_style: 'fade',
    },
  },
  {
    id: 'split-editorial',
    number: 2,
    name: 'Split-Screen Editorial',
    nameTh: 'แบบที่ 2: สปลิตสกรีน แมกกาซีน (50/50)',
    layoutBadge: '50/50 Split Hero + Zig-Zag Rooms',
    category: 'editorial',
    categoryLabel: 'นิตยสาร & สปลิตสกรีน',
    tagline: 'แบ่งครึ่งจอซ้าย-ขวา (ซ้ายเป็นเรื่องราวและกล่องจอง ขวาเป็นภาพแนวตั้งเต็มพื้นที่) พร้อมรายการห้องพักสลับฟันปลาซ้าย-ขวา',
    features: ['Hero แบ่งครึ่งจอ 50/50', 'ห้องพักสลับซ้าย-ขวา (Zig-Zag)', 'สไตล์นิตยสารดีไซน์'],
    shellStyle: 'standard',
    heroLayout: 'split-screen',
    aboutLayout: 'centered-manifesto',
    roomsLayout: 'zigzag-horizontal',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'split-editorial',
      primary_color: '#1c1917',
      secondary_color: '#44403c',
      accent_color: '#b45309',
      background_color: '#fafaf9',
      text_color: '#1c1917',
      button_style: 'square',
      border_radius: '0px',
      font_family: 'Playfair Display',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'simple',
      animation_style: 'slide',
    },
  },
  {
    id: 'floating-glass',
    number: 3,
    name: 'Floating Glass & Bento Grid',
    nameTh: 'แบบที่ 3: โฟลทติ้ง กลาส & เบนโตะ 3 คอลัมน์',
    layoutBadge: 'Floating Nav + Bento 3-Col',
    category: 'boutique',
    categoryLabel: 'บูทีค & โมเสกแกลเลอรี',
    tagline: 'เมนูลอยตัวทรงแคปซูล ภาพปกขอบมนแบบกรอบลอย ซ้อนแถบจองกระจกใส (Glass Dock) และตาราง Bento 3 คอลัมน์',
    features: ['เมนูลอยตัวทรงแคปซูล', 'แถบจอง Glass ลอยทับขอบภาพ', 'ห้องพัก 3 คอลัมน์ทันสมัย'],
    shellStyle: 'floating-pill-nav',
    heroLayout: 'floating-dock',
    aboutLayout: 'bento-highlights',
    roomsLayout: 'grid-3-bento',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'floating-glass',
      primary_color: '#0c4a6e',
      secondary_color: '#0369a1',
      accent_color: '#0284c7',
      background_color: '#f8fafc',
      text_color: '#0f172a',
      button_style: 'pill',
      border_radius: '9999px',
      font_family: 'Plus Jakarta Sans',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'columns',
      animation_style: 'fade',
    },
  },
  {
    id: 'grand-palace',
    number: 4,
    name: 'Grand Crest & Panoramic Suites',
    nameTh: 'แบบที่ 4: แกรนด์ พาเลซ สมมาตร & ห้องพักแถวยาว',
    layoutBadge: 'Centered Crest + Full-Row Suites',
    category: 'resort',
    categoryLabel: 'รีสอร์ท & พูลวิลล่า',
    tagline: 'หัวเว็บตราสัญลักษณ์กึ่งกลาง 2 ชั้น ภาพปกขนาบข้างด้วยภาพย่อซ้าย-ขวา และโชว์ห้องพักเป็นแถวยาวเต็มความกว้าง',
    features: ['หัวเว็บกึ่งกลาง 2 ชั้น', 'Hero ขนาบภาพซ้าย-ขวา', 'แถวห้องพักแนวนอนเต็มจอ'],
    shellStyle: 'standard',
    heroLayout: 'cinema-crest',
    aboutLayout: 'centered-manifesto',
    roomsLayout: 'luxury-rows',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'grand-palace',
      primary_color: '#1e1b2e',
      secondary_color: '#312e47',
      accent_color: '#c8a45d',
      background_color: '#fdfcf9',
      text_color: '#1e1b2e',
      button_style: 'square',
      border_radius: '2px',
      font_family: 'Cormorant Garamond',
      dark_mode: false,
      header_layout: 'centered',
      footer_layout: 'luxury',
      animation_style: 'fade',
    },
  },
  {
    id: 'bento-mosaic',
    number: 5,
    name: '5-Photo Mosaic & Sticky Booking',
    nameTh: 'แบบที่ 5: โมเสก 5 ภาพ & กล่องจองด้านขวา (สไตล์ Airbnb Luxe)',
    layoutBadge: '5-Photo Collage + Sticky Sidebar',
    category: 'conversion',
    categoryLabel: 'เน้นจองตรง (Direct Booking)',
    tagline: 'เปิดหัวเว็บด้วยแกลเลอรีตาราง 5 ภาพ (ภาพใหญ่ซ้าย + 4 ภาพย่อยขวา) เนื้อหาซ้ายคู่กับกล่องจองตรงที่ลอยตามด้านขวาตลอดเวลา',
    features: ['ตารางภาพเปิดหัวเว็บ 5 รูป', 'กล่องจองติดหนึบคอลัมน์ขวา', 'กระตุ้นยอดจองตรงสูงสุด'],
    shellStyle: 'standard',
    heroLayout: 'photo-mosaic',
    aboutLayout: 'split-sticky',
    roomsLayout: 'sidebar-sticky-list',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'bento-mosaic',
      primary_color: '#111827',
      secondary_color: '#374151',
      accent_color: '#e11d48',
      background_color: '#ffffff',
      text_color: '#111827',
      button_style: 'rounded',
      border_radius: '12px',
      font_family: 'Plus Jakarta Sans',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'simple',
      animation_style: 'fade',
    },
  },
  {
    id: 'zen-frame',
    number: 6,
    name: 'Kyoto Zen Minimalist Frame',
    nameTh: 'แบบที่ 6: เซน มินิมอล เว้นขอบขาว & แคตตาล็อกเส้นบาง',
    layoutBadge: 'Whitespace Frame + Hairline List',
    category: 'architectural',
    categoryLabel: 'เมนูข้าง & สถาปัตยกรรม',
    tagline: 'เว้นพื้นที่ว่างรอบภาพสไตล์เรียวกังญี่ปุ่น มีอักษรแนวตั้งด้านข้าง และรายการห้องพักแบบเส้นคั่นบางไร้กรอบเงา',
    features: ['ภาพเว้นขอบขาวพร้อมป้ายแนวตั้ง', 'รายการห้องพักเส้นคั่นมินิมอล', 'เรียบสงบสไตล์ญี่ปุ่น'],
    shellStyle: 'standard',
    heroLayout: 'zen-framed',
    aboutLayout: 'minimal-zen',
    roomsLayout: 'zen-minimal-list',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'zen-frame',
      primary_color: '#292524',
      secondary_color: '#57534e',
      accent_color: '#658354',
      background_color: '#faf8f5',
      text_color: '#1c1917',
      button_style: 'square',
      border_radius: '0px',
      font_family: 'Noto Serif',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'simple',
      animation_style: 'fade',
    },
  },
  {
    id: 'coastal-panoramic',
    number: 7,
    name: 'Curved Coastal & Villa Strip',
    nameTh: 'แบบที่ 7: โค้งคลื่นทะเล & พูลวิลล่าพร้อมแถบรูปย่อย',
    layoutBadge: 'Curved Hero + Multi-Thumb Villas',
    category: 'resort',
    categoryLabel: 'รีสอร์ท & พูลวิลล่า',
    tagline: 'ขอบล่างภาพ Hero โค้งมนรับกับแคปซูลค้นหาห้องพัก พร้อมการ์ดวิลล่าขนาดใหญ่ที่โชว์ภาพย่อย 4 มุมใต้ภาพหลักทันที',
    features: ['ภาพปกขอบโค้ง + แคปซูลจอง', 'การ์ดห้องมีแถบภาพย่อย 4 รูป', 'โปร่งสบายเหมาะกับบีชรีสอร์ท'],
    shellStyle: 'standard',
    heroLayout: 'curved-coastal',
    aboutLayout: 'overlapping-photos',
    roomsLayout: 'villa-multi-thumb',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'coastal-panoramic',
      primary_color: '#134e4a',
      secondary_color: '#0f766e',
      accent_color: '#14b8a6',
      background_color: '#f7fefa',
      text_color: '#0f2926',
      button_style: 'pill',
      border_radius: '9999px',
      font_family: 'DM Sans',
      dark_mode: false,
      header_layout: 'centered',
      footer_layout: 'columns',
      animation_style: 'slide',
    },
  },
  {
    id: 'sidebar-atelier',
    number: 8,
    name: 'Left Sidebar Architectural Atelier',
    nameTh: 'แบบที่ 8: แถบเมนูแนวตั้งด้านซ้าย (Left Sidebar Layout)',
    layoutBadge: 'Fixed Left Sidebar + Right Canvas',
    category: 'architectural',
    categoryLabel: 'เมนูข้าง & สถาปัตยกรรม',
    tagline: 'โครงสร้างแตกต่างชัดเจน! ย้ายโลโก้ เมนูนำทาง เบอร์โทร และปุ่มจองไว้ที่แถบด้านซ้ายถาวร ส่วนด้านขวา 80% เลื่อนชมเนื้อหาเต็มตา',
    features: ['เมนูแนวตั้งด้านซ้ายถาวร', 'พื้นที่เนื้อหาขวาไร้แถบบังบน', 'สไตล์สตูดิโอสถาปัตยกรรม'],
    shellStyle: 'left-sidebar',
    heroLayout: 'sidebar-canvas',
    aboutLayout: 'bento-highlights',
    roomsLayout: 'zigzag-horizontal',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'sidebar-atelier',
      primary_color: '#18181b',
      secondary_color: '#3f3f46',
      accent_color: '#a16207',
      background_color: '#ffffff',
      text_color: '#18181b',
      button_style: 'square',
      border_radius: '0px',
      font_family: 'Outfit',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'simple',
      animation_style: 'fade',
    },
  },
  {
    id: 'magazine-gazette',
    number: 9,
    name: 'Traveler Magazine Gazette',
    nameTh: 'แบบที่ 9: แมกกาซีน 3 คอลัมน์ (Condé Nast Style)',
    layoutBadge: 'Masthead + 3-Col Editorial Grid',
    category: 'editorial',
    categoryLabel: 'นิตยสาร & สปลิตสกรีน',
    tagline: 'พาดหัวใหญ่สไตล์นิตยสารท่องเที่ยวระดับโลก แบ่ง Hero เป็น 3 คอลัมน์เรื่องราว พร้อมลำดับไฮไลท์ตัวเลข 01 / 02 / 03',
    features: ['พาดหัว Masthead สไตล์นิตยสาร', 'ตารางเรื่องราวเปิดเว็บ 3 ช่อง', 'ห้องพักเด่น + ตารางการ์ดรอง'],
    shellStyle: 'standard',
    heroLayout: 'magazine-masthead',
    aboutLayout: 'minimal-zen',
    roomsLayout: 'grid-3-bento',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'magazine-gazette',
      primary_color: '#171717',
      secondary_color: '#404040',
      accent_color: '#9a3412',
      background_color: '#fbf9f5',
      text_color: '#171717',
      button_style: 'square',
      border_radius: '0px',
      font_family: 'Bodoni Moda',
      dark_mode: false,
      header_layout: 'centered',
      footer_layout: 'luxury',
      animation_style: 'fade',
    },
  },
  {
    id: 'villa-spotlight',
    number: 10,
    name: 'Hero Check-In Card Villa',
    nameTh: 'แบบที่ 10: กล่องฟอร์มจองลอยในภาพปก (Booking Card Hero)',
    layoutBadge: 'Hero + Right Floating Booking Form',
    category: 'conversion',
    categoryLabel: 'เน้นจองตรง (Direct Booking)',
    tagline: 'วางฟอร์มเลือกวันเข้าพักแนวตั้งซ้อนไว้ด้านขวาของภาพปกทันทีที่เข้าเว็บ ลูกค้ากรอกวันและกดค้นหาห้องว่างได้ทันทีโดยไม่ต้องเลื่อนจอ',
    features: ['ฟอร์มจองแนวตั้งซ้อนในภาพปก', 'แถบไอคอนจุดเด่น 4 ช่อง', 'การ์ดวิลล่าพร้อมอัลบั้มย่อย'],
    shellStyle: 'standard',
    heroLayout: 'booking-card-hero',
    aboutLayout: 'bento-highlights',
    roomsLayout: 'villa-multi-thumb',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'villa-spotlight',
      primary_color: '#064e3b',
      secondary_color: '#065f46',
      accent_color: '#d97706',
      background_color: '#fcfdfb',
      text_color: '#14261c',
      button_style: 'rounded',
      border_radius: '12px',
      font_family: 'Plus Jakarta Sans',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'columns',
      animation_style: 'fade',
    },
  },
  {
    id: 'mediterranean-arch',
    number: 11,
    name: 'Mediterranean Arched Courtyard',
    nameTh: 'แบบที่ 11: ซุ้มประตูโค้งเมดิเตอร์เรเนียน (Arched Frames)',
    layoutBadge: '3-Arch Hero + Arched Room Cards',
    category: 'boutique',
    categoryLabel: 'บูทีค & โมเสกแกลเลอรี',
    tagline: 'โดดเด่นไม่ซ้ำใครด้วยกรอบภาพทรงซุ้มประตูโค้ง (Arch) ทั้งส่วนภาพเปิด 3 ซุ้ม ภาพเล่าเรื่อง และการ์ดห้องพักทรงโค้งมนด้านบน',
    features: ['ภาพเปิดทรงซุ้มโค้ง 3 ช่อง', 'การ์ดห้องพักกรอบซุ้มโค้ง', 'บรรยากาศซานโตรินี & วิลล่า'],
    shellStyle: 'standard',
    heroLayout: 'arched-courtyard',
    aboutLayout: 'arched-trio',
    roomsLayout: 'arched-cards',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'mediterranean-arch',
      primary_color: '#431407',
      secondary_color: '#7c2d12',
      accent_color: '#c2410c',
      background_color: '#fdfaf6',
      text_color: '#29150e',
      button_style: 'pill',
      border_radius: '9999px',
      font_family: 'Lora',
      dark_mode: false,
      header_layout: 'centered',
      footer_layout: 'luxury',
      animation_style: 'fade',
    },
  },
  {
    id: 'cinema-noir',
    number: 12,
    name: 'Dark Widescreen Cinema & Poster Cards',
    nameTh: 'แบบที่ 12: ซีเนม่า จอกว้าง 21:9 & การ์ดห้องแนวตั้ง (Dark Noir)',
    layoutBadge: '21:9 Cinema + 3:4 Portrait Posters',
    category: 'editorial',
    categoryLabel: 'นิตยสาร & สปลิตสกรีน',
    tagline: 'โหมดมืดสไตล์ภาพยนตร์ ภาพจอกว้าง Widescreen 21:9 พร้อมโชว์ห้องพักเป็นการ์ดโปสเตอร์แนวตั้ง (3:4) เรียงกันอย่างมีเอกลักษณ์',
    features: ['ภาพจอกว้าง 21:9 Widescreen', 'การ์ดห้องพักแนวตั้งทรงโปสเตอร์', 'แถบจองสีดำทองสุดหรู'],
    shellStyle: 'standard',
    heroLayout: 'widescreen-noir',
    aboutLayout: 'centered-manifesto',
    roomsLayout: 'portrait-posters',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'cinema-noir',
      primary_color: '#090d16',
      secondary_color: '#1e293b',
      accent_color: '#d4af37',
      background_color: '#0b0f19',
      text_color: '#f8fafc',
      button_style: 'rounded',
      border_radius: '6px',
      font_family: 'Cinzel',
      dark_mode: true,
      header_layout: 'luxury',
      footer_layout: 'luxury',
      animation_style: 'fade',
    },
  },
  {
    id: 'story-sanctuary',
    number: 13,
    name: 'Story-First Eco Sanctuary',
    nameTh: 'แบบที่ 13: เปิดด้วยคำต้อนรับ & หน้าต่างธรรมชาติ (Story-First)',
    layoutBadge: 'Intro Above Hero + Horizontal Cabins',
    category: 'resort',
    categoryLabel: 'รีสอร์ท & พูลวิลล่า',
    tagline: 'สลับลำดับใหม่! เริ่มด้วยชื่อโรงแรม คำโปรยต้อนรับ และแถบจองกลางหน้าจอก่อน แล้วค่อยตามด้วยกรอบภาพธรรมชาติมุมกว้างด้านล่าง',
    features: ['หัวเรื่อง & แถบจองอยู่เหนือภาพปก', 'ภาพปกกรอบโค้งมุมกว้าง', 'รายการห้องพักแนวนอนดูง่าย'],
    shellStyle: 'standard',
    heroLayout: 'story-above-hero',
    aboutLayout: 'split-sticky',
    roomsLayout: 'luxury-rows',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'story-sanctuary',
      primary_color: '#143326',
      secondary_color: '#1f4d3a',
      accent_color: '#b5945b',
      background_color: '#f7faf8',
      text_color: '#142920',
      button_style: 'pill',
      border_radius: '9999px',
      font_family: 'Marcellus',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'columns',
      animation_style: 'fade',
    },
  },
  {
    id: 'booking-first',
    number: 14,
    name: 'Direct-Booking Rate Table Pro',
    nameTh: 'แบบที่ 14: ตารางเปรียบเทียบห้องพักขึ้นก่อน (Direct-Booking Pro)',
    layoutBadge: 'Compact Header + Instant Rate Table',
    category: 'conversion',
    categoryLabel: 'เน้นจองตรง (Direct Booking)',
    tagline: 'ออกแบบเพื่อเน้นขายห้องพักโดยเฉพาะ! แบนเนอร์กระชับ ดันตารางเปรียบเทียบห้องพัก สิ่งอำนวยความสะดวก และราคาจองตรงขึ้นมาแสดงบนสุดทันที',
    features: ['ดันตารางห้องพักขึ้นแสดงทันที', 'แสดงรายการสิทธิพิเศษจองตรง', 'เหมาะกับโรงแรมเน้นยอดขายเร็ว'],
    shellStyle: 'standard',
    heroLayout: 'compact-direct',
    aboutLayout: 'bento-highlights',
    roomsLayout: 'rate-table-pro',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'booking-first',
      primary_color: '#1e3a8a',
      secondary_color: '#1d4ed8',
      accent_color: '#0284c7',
      background_color: '#f8fafc',
      text_color: '#0f172a',
      button_style: 'rounded',
      border_radius: '8px',
      font_family: 'Inter',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'simple',
      animation_style: 'fade',
    },
  },
  {
    id: 'imperial-galleria',
    number: 15,
    name: '3-Panel Triptych Galleria',
    nameTh: 'แบบที่ 15: แกลเลอรี 3 เฟรมแนวตั้ง (Triptych Panels)',
    layoutBadge: '3-Panel Hero + Double-Border Suites',
    category: 'boutique',
    categoryLabel: 'บูทีค & โมเสกแกลเลอรี',
    tagline: 'โชว์ 3 ภาพแนวตั้งเคียงข้างกันตั้งแต่เปิดหน้าเว็บ (บรรยากาศโรงแรม ห้องพัก และไลฟ์สไตล์) พร้อมการ์ดห้องพักตีกรอบเส้นคู่สุดประณีต',
    features: ['Hero แบ่ง 3 เฟรมแนวตั้งพร้อมกัน', 'การ์ดห้องตีกรอบทอง 2 ชั้น', 'สมมาตรหรูหราทุกสัดส่วน'],
    shellStyle: 'standard',
    heroLayout: 'triptych-panels',
    aboutLayout: 'centered-manifesto',
    roomsLayout: 'grid-2',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'imperial-galleria',
      primary_color: '#241236',
      secondary_color: '#3b1f54',
      accent_color: '#c8a45d',
      background_color: '#fdfcff',
      text_color: '#1e102d',
      button_style: 'square',
      border_radius: '0px',
      font_family: 'Cormorant Garamond',
      dark_mode: false,
      header_layout: 'luxury',
      footer_layout: 'luxury',
      animation_style: 'fade',
    },
  },
  {
    id: 'studio-cards',
    number: 16,
    name: 'Modular Bento Card-Stack',
    nameTh: 'แบบที่ 16: การ์ดลอยแยกบล็อกสไตล์ Apple Bento',
    layoutBadge: 'Floating 28px Section Cards',
    category: 'architectural',
    categoryLabel: 'เมนูข้าง & สถาปัตยกรรม',
    tagline: 'วางทุกส่วนของเว็บไซต์ (หัวเว็บ ภาพปก เรื่องราว ห้องพัก แกลเลอรี) แยกเป็นการ์ดสีขาวขอบมนขนาดใหญ่เรียงซ้อนกันบนพื้นสีเทาอ่อนสะอาดตา',
    features: ['แยกทุก Section เป็นการ์ดขอบมน', 'พื้นหลังต่างระดับเห็นบล็อกชัดเจน', 'โมเดิร์นสะอาดสไตล์ Apple'],
    shellStyle: 'card-stack-canvas',
    heroLayout: 'bento-stack',
    aboutLayout: 'bento-highlights',
    roomsLayout: 'grid-3-bento',
    fallbackHeroImage: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1400&q=80',
    theme: {
      template_id: 'studio-cards',
      primary_color: '#0f172a',
      secondary_color: '#334155',
      accent_color: '#0d9488',
      background_color: '#f1f5f9',
      text_color: '#0f172a',
      button_style: 'pill',
      border_radius: '9999px',
      font_family: 'Outfit',
      dark_mode: false,
      header_layout: 'minimal',
      footer_layout: 'simple',
      animation_style: 'slide',
    },
  },
  {
    id: 'indigo-neighborhood',
    number: 17,
    name: 'Hotel Indigo Boutique Story & Mosaic',
    nameTh: 'แบบที่ 17: อินดิโก้ บูทีค สตอรี่ & โมเสกเต็มจอ (Hotel Indigo Style)',
    layoutBadge: 'Indigo Nav + Brushstroke Story + 50/50 Mosaic',
    category: 'boutique',
    categoryLabel: 'บูทีค & โมเสกแกลเลอรี',
    tagline:
      'สไตล์ Hotel Indigo บูทีคระดับสากล แถบเมนูสีน้ำเงินครามพร้อมป้าย HOME สีทองและปุ่ม BOOK NOW สีขาว พาดหัวใหญ่กลางภาพปก สตอรี่ภาพวาดพู่กัน โมเสกภาพเต็มขอบจอ 50/50 ไร้ช่องว่าง และแบนเนอร์ทัวร์ภาพมุมกว้าง',
    features: [
      'หัวเว็บ Indigo + ป้าย HOME ทอง & ปุ่มขาว',
      'สตอรี่ภาพวาดพู่กันชายฝั่ง 2 ชั้น',
      'ตารางภาพเต็มจอ 50/50 ไร้ขอบคั่น + 360° Tour',
    ],
    shellStyle: 'indigo-boutique',
    heroLayout: 'indigo-story-hero',
    aboutLayout: 'indigo-coastal-story',
    roomsLayout: 'indigo-boutique-suites',
    fallbackHeroImage:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    theme: {
      template_id: 'indigo-neighborhood',
      primary_color: '#102B3C',
      secondary_color: '#0D2230',
      accent_color: '#D59B2D',
      background_color: '#FCFCFA',
      text_color: '#102B3C',
      button_style: 'square',
      border_radius: '2px',
      font_family: 'Playfair Display',
      dark_mode: false,
      header_layout: 'luxury',
      footer_layout: 'columns',
      animation_style: 'fade',
    },
  },
];

export function getTemplateByTheme(theme?: Partial<HotelTheme> | null): HotelWebsiteTemplate {
  if (theme?.template_id) {
    const exact = HOTEL_WEBSITE_TEMPLATES.find((t) => t.id === theme.template_id);
    if (exact) return exact;
  }
  const matched = HOTEL_WEBSITE_TEMPLATES.find(
    (t) =>
      t.theme.primary_color.toLowerCase() === (theme?.primary_color || '').toLowerCase() &&
      t.theme.accent_color.toLowerCase() === (theme?.accent_color || '').toLowerCase() &&
      t.theme.font_family === theme?.font_family
  );
  return matched || HOTEL_WEBSITE_TEMPLATES[0];
}

export const findMatchingTemplate = getTemplateByTheme;
