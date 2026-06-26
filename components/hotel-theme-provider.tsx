import React from 'react';
import { HotelTheme } from '@/lib/db/mock-data';

interface HotelThemeProviderProps {
  theme: HotelTheme;
  children: React.ReactNode;
}

export default function HotelThemeProvider({ theme, children }: HotelThemeProviderProps) {
  // Map font families to Google Fonts import names
  const fontImportName = theme.font_family ? theme.font_family.replace(/ /g, '+') : 'Inter';
  
  // Resolve button border radius based on style setting
  const borderRadius = 
    theme.button_style === 'square' 
      ? '0px' 
      : theme.button_style === 'pill' 
        ? '9999px' 
        : theme.border_radius || '6px';

  // Inject CSS variables
  const cssVariables = `
    :root {
      --primary-color: ${theme.primary_color || '#0f172a'};
      --secondary-color: ${theme.secondary_color || '#475569'};
      --accent-color: ${theme.accent_color || '#c5a880'};
      --background-color: ${theme.background_color || '#fafafa'};
      --text-color: ${theme.text_color || '#0f172a'};
      --border-radius: ${borderRadius};
      --font-family: '${theme.font_family || 'Inter'}', sans-serif;
    }
    
    body {
      background-color: var(--background-color) !important;
      color: var(--text-color) !important;
      font-family: var(--font-family) !important;
    }
  `;

  return (
    <>
      {/* Preconnect to Google Fonts CDN for speed */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Load Google Font dynamically */}
      {theme.font_family && (
        <link 
          rel="stylesheet" 
          href={`https://fonts.googleapis.com/css2?family=${fontImportName}:wght@300;400;500;600;700&display=swap`}
        />
      )}
      
      {/* Inject Style Block containing active theme variables */}
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      
      {children}
    </>
  );
}
