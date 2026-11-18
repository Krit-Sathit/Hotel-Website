import React from 'react';
import { HotelTheme } from '@/lib/db/mock-data';

interface HotelThemeProviderProps {
  theme: HotelTheme;
  children: React.ReactNode;
}

export default function HotelThemeProvider({ theme, children }: HotelThemeProviderProps) {
  const fontFamily = theme.font_family || 'Inter';
  const fontImportName = fontFamily.replace(/ /g, '+');

  const borderRadius =
    theme.button_style === 'square'
      ? '0px'
      : theme.button_style === 'pill'
      ? '9999px'
      : theme.border_radius || '8px';

  const isDark = Boolean(theme.dark_mode);
  const bgColor = theme.background_color || (isDark ? '#0b0f19' : '#ffffff');
  const textColor = theme.text_color || (isDark ? '#f8fafc' : '#0f172a');

  const cssVariables = `
    :root {
      color-scheme: ${isDark ? 'dark' : 'light'};
      --primary-color: ${theme.primary_color || '#0f172a'};
      --secondary-color: ${theme.secondary_color || '#475569'};
      --accent-color: ${theme.accent_color || '#c5a880'};
      --background-color: ${bgColor};
      --text-color: ${textColor};
      --border-radius: ${borderRadius};
      --font-family: '${fontFamily}', sans-serif;
    }

    body {
      background-color: ${bgColor} !important;
      color: ${textColor} !important;
      font-family: var(--font-family), sans-serif !important;
    }

    ${
      isDark
        ? `
      .tenant-theme-root section.bg-white,
      .tenant-theme-root section.bg-slate-50 {
        background-color: ${bgColor} !important;
        color: ${textColor} !important;
      }
      .tenant-theme-root .text-slate-800,
      .tenant-theme-root .text-slate-900 {
        color: ${textColor} !important;
      }
      .tenant-theme-root .text-slate-600,
      .tenant-theme-root .text-slate-500 {
        color: rgba(248, 250, 252, 0.72) !important;
      }
    `
        : ''
    }
  `;

  return (
    <div className={`tenant-theme-root ${isDark ? 'dark' : ''}`}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {fontFamily && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${fontImportName}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap`}
        />
      )}
      {theme.template_id === 'metadee-concept' && fontFamily !== 'Playfair Display' && (
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap"
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

      {children}
    </div>
  );
}
