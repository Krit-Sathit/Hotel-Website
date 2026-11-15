import type { HotelTheme } from '@/lib/db/mock-data';

export interface ColorPalettePreset {
  id: string;
  nameTh: string;
  nameEn: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  dark_mode: boolean;
}

/**
 * Curated Luxury & Boutique Brand Color Palettes that can be applied to ANY Structural Layout
 */
export const COLOR_PALETTE_PRESETS: ColorPalettePreset[] = [
  {
    id: 'indigo-boutique',
    nameTh: 'อินดิโก้ บูทีค & ทองอำพัน',
    nameEn: 'Hotel Indigo Teal & Amber',
    primary_color: '#102B3C',
    secondary_color: '#0D2230',
    accent_color: '#D59B2D',
    background_color: '#FCFCFA',
    text_color: '#102B3C',
    dark_mode: false,
  },
  {
    id: 'navy-gold',
    nameTh: 'เนวี่ & แชมเปญโกลด์',
    nameEn: 'Classic Navy & Gold',
    primary_color: '#0f172a',
    secondary_color: '#1e293b',
    accent_color: '#c5a880',
    background_color: '#ffffff',
    text_color: '#0f172a',
    dark_mode: false,
  },
  {
    id: 'andaman-teal',
    nameTh: 'เขียวน้ำทะเลอันดามัน',
    nameEn: 'Andaman Ocean Teal',
    primary_color: '#0f4c5c',
    secondary_color: '#134e4a',
    accent_color: '#0d9488',
    background_color: '#f8fafc',
    text_color: '#0f172a',
    dark_mode: false,
  },
  {
    id: 'emerald-resort',
    nameTh: 'เขียวมรกต & ทองคำ',
    nameEn: 'Emerald Sanctuary',
    primary_color: '#064e3b',
    secondary_color: '#065f46',
    accent_color: '#b48a4e',
    background_color: '#fbfcfa',
    text_color: '#0f291e',
    dark_mode: false,
  },
  {
    id: 'espresso-cream',
    nameTh: 'เอสเปรสโซ่ & ครีมมุก',
    nameEn: 'Espresso & Ivory',
    primary_color: '#2c1810',
    secondary_color: '#432818',
    accent_color: '#c09553',
    background_color: '#fdfbf7',
    text_color: '#2a1f15',
    dark_mode: false,
  },
  {
    id: 'terracotta-sun',
    nameTh: 'เทอราคอตต้า เมดิเตอร์เรเนียน',
    nameEn: 'Mediterranean Terracotta',
    primary_color: '#7c2d12',
    secondary_color: '#9a3412',
    accent_color: '#d97706',
    background_color: '#fffbf5',
    text_color: '#291711',
    dark_mode: false,
  },
  {
    id: 'kyoto-sage',
    nameTh: 'เกียวโต มัทฉะเซน',
    nameEn: 'Kyoto Matcha Zen',
    primary_color: '#2f3e34',
    secondary_color: '#3f5245',
    accent_color: '#7c9070',
    background_color: '#f8f7f3',
    text_color: '#1f2922',
    dark_mode: false,
  },
  {
    id: 'royal-burgundy',
    nameTh: 'ไวน์เบอร์กันดีหรู',
    nameEn: 'Royal Burgundy',
    primary_color: '#4c0519',
    secondary_color: '#6b1229',
    accent_color: '#cfa363',
    background_color: '#fffcfd',
    text_color: '#280812',
    dark_mode: false,
  },
  {
    id: 'azure-santorini',
    nameTh: 'ฟ้าซานโตรินี & ขาวคลีน',
    nameEn: 'Santorini Azure',
    primary_color: '#1d4ed8',
    secondary_color: '#1e40af',
    accent_color: '#0284c7',
    background_color: '#ffffff',
    text_color: '#0f172a',
    dark_mode: false,
  },
  {
    id: 'blush-rose',
    nameTh: 'โรสโกลด์ บูทีคสปา',
    nameEn: 'Rose Champagne',
    primary_color: '#581c3c',
    secondary_color: '#70244d',
    accent_color: '#c98a7b',
    background_color: '#fffafb',
    text_color: '#2c1220',
    dark_mode: false,
  },
  {
    id: 'minimal-graphite',
    nameTh: 'กราไฟต์ โมเดิร์นคลีน',
    nameEn: 'Minimal Graphite',
    primary_color: '#18181b',
    secondary_color: '#27272a',
    accent_color: '#71717a',
    background_color: '#ffffff',
    text_color: '#18181b',
    dark_mode: false,
  },
  {
    id: 'midnight-noir',
    nameTh: 'มิดไนท์ดาร์ก & ทอง',
    nameEn: 'Midnight Dark Gold',
    primary_color: '#c5a880',
    secondary_color: '#111827',
    accent_color: '#e2c08d',
    background_color: '#090d16',
    text_color: '#f8fafc',
    dark_mode: true,
  },
  {
    id: 'obsidian-emerald',
    nameTh: 'ดาร์กออบซิเดียน & มรกต',
    nameEn: 'Dark Obsidian Emerald',
    primary_color: '#10b981',
    secondary_color: '#0f172a',
    accent_color: '#34d399',
    background_color: '#0b1315',
    text_color: '#f0fdf4',
    dark_mode: true,
  },
];

function parseHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = (hex || '').trim().replace(/^#/, '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }
  return null;
}

export function isDarkColor(hex: string | undefined | null): boolean {
  if (!hex) return false;
  const rgb = parseHexToRgb(hex);
  if (!rgb) return false;
  // Perceived brightness formula (YIQ)
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq < 140;
}

export function getContrastText(
  bgHex: string | undefined | null,
  lightText = '#ffffff',
  darkText = '#0f172a'
): string {
  return isDarkColor(bgHex) ? lightText : darkText;
}

export function mixHex(hexA: string, hexB: string, weightB = 0.08): string {
  const a = parseHexToRgb(hexA) || { r: 255, g: 255, b: 255 };
  const b = parseHexToRgb(hexB) || { r: 15, g: 23, b: 42 };
  const w = Math.max(0, Math.min(1, weightB));
  const r = Math.round(a.r * (1 - w) + b.r * w);
  const g = Math.round(a.g * (1 - w) + b.g * w);
  const bl = Math.round(a.b * (1 - w) + b.b * w);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function withAlpha(hex: string | undefined | null, alpha: number, fallback = 'rgba(15,23,42,0.1)'): string {
  const rgb = parseHexToRgb(hex || '');
  if (!rgb) return fallback;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function deriveSurfacePalette(theme: HotelTheme) {
  const bg = theme.background_color || (theme.dark_mode ? '#0b0f19' : '#ffffff');
  const bgIsDark = isDarkColor(bg);
  const text = theme.text_color || (bgIsDark ? '#f8fafc' : '#0f172a');
  const primary = theme.primary_color || '#0f172a';
  const secondary = theme.secondary_color || mixHex(primary, '#334155', 0.35);
  const accent = theme.accent_color || '#c5a880';

  const cardBg = bgIsDark ? mixHex(bg, '#ffffff', 0.06) : mixHex(bg, '#ffffff', 0.82);
  const subtleSurface = bgIsDark ? mixHex(bg, '#ffffff', 0.035) : mixHex(bg, primary, 0.045);
  const canvasStackBg = bgIsDark ? bg : bg.toLowerCase() === '#ffffff' ? mixHex('#f8fafc', primary, 0.05) : bg;
  const cardBorder = bgIsDark ? 'rgba(255,255,255,0.12)' : withAlpha(text, 0.11, '#e2e8f0');
  const mutedText = bgIsDark ? withAlpha(text, 0.7, 'rgba(248,250,252,0.7)') : withAlpha(text, 0.65, '#64748b');

  const primaryText = getContrastText(primary);
  const secondaryText = getContrastText(secondary);
  const accentText = getContrastText(accent);

  return {
    bg,
    bgIsDark,
    text,
    primary,
    secondary,
    accent,
    cardBg,
    subtleSurface,
    canvasStackBg,
    cardBorder,
    mutedText,
    primaryText,
    secondaryText,
    accentText,
  };
}
