'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { saveThemeSettingsAction } from '@/lib/db/actions';

export default function ThemePage() {
  const [hotelId, setHotelId] = useState('');
  const [theme, setTheme] = useState({
    primary_color: '#1a1a1a',
    secondary_color: '#4a4a4a',
    accent_color: '#d4af37',
    background_color: '#ffffff',
    text_color: '#111111',
    button_style: 'rounded' as 'square' | 'rounded' | 'pill',
    border_radius: '6px',
    font_family: 'Inter',
    dark_mode: false,
    header_layout: 'centered' as 'centered' | 'minimal' | 'luxury',
    footer_layout: 'simple' as 'simple' | 'luxury' | 'columns',
    animation_style: 'fade' as 'fade' | 'slide' | 'none',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const getActiveTheme = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        if (hotel && hotel.theme) {
          setHotelId(hotel.id);
          setTheme({ ...hotel.theme });
        }
      } catch (err) {
        console.error('Failed to load theme via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getActiveTheme();
  }, []);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme({
      ...theme,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme({
      ...theme,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    const result = await saveThemeSettingsAction(hotelId, theme);

    if (result.success) {
      setNotification({
        type: 'success',
        message: 'Theme customization successfully updated! Your website has updated instantly.',
      });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to update theme settings.',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading design configurations...
      </div>
    );
  }

  // Pre-calculate border-radius preview
  const previewRadius = 
    theme.button_style === 'square' 
      ? '0px' 
      : theme.button_style === 'pill' 
        ? '9999px' 
        : theme.border_radius || '6px';

  return (
    <div className="max-w-6xl space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
          Design & Theme Customizer
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Customize your website colors, premium typography, button shapes, headers, and navigation animations.
        </p>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div 
          className={`p-4 rounded-lg flex items-start gap-3 border ${
            notification.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          } animate-fade-in`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold uppercase tracking-wider">
              {notification.type === 'success' ? 'Theme Saved' : 'Error'}
            </h5>
            <p className="text-[11px] leading-relaxed opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* DESIGN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT CONTROLS (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Color Palettes Card */}
          <div className="bg-slate-900 border border-slate-800/60 p-6 md:p-8 rounded-xl space-y-6">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3">
              Color Palette Customization
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Primary Color */}
              <div className="space-y-2 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Primary (Dark)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="primary_color"
                    value={theme.primary_color}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <code className="text-[10px] text-slate-300 font-bold font-mono uppercase">{theme.primary_color}</code>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Secondary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="secondary_color"
                    value={theme.secondary_color}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <code className="text-[10px] text-slate-300 font-bold font-mono uppercase">{theme.secondary_color}</code>
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Accent (Gold/Teal)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="accent_color"
                    value={theme.accent_color}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <code className="text-[10px] text-slate-300 font-bold font-mono uppercase">{theme.accent_color}</code>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="background_color"
                    value={theme.background_color}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <code className="text-[10px] text-slate-300 font-bold font-mono uppercase">{theme.background_color}</code>
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Main Text</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="text_color"
                    value={theme.text_color}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <code className="text-[10px] text-slate-300 font-bold font-mono uppercase">{theme.text_color}</code>
                </div>
              </div>

            </div>
          </div>

          {/* Typography & Buttons Card */}
          <div className="bg-slate-900 border border-slate-800/60 p-6 md:p-8 rounded-xl space-y-6">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3">
              Typography & Buttons
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Font Family Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Font Family</label>
                <select
                  name="font_family"
                  value={theme.font_family}
                  onChange={handleSelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 outline-none focus:border-accent cursor-pointer"
                >
                  <optgroup label="Serif (Classic Luxury)">
                    <option value="Cormorant Garamond">Cormorant Garamond (Malibu Resort Style)</option>
                    <option value="Playfair Display">Playfair Display (Premium Classic)</option>
                    <option value="Bodoni Moda">Bodoni Moda (Ultra High-Fashion)</option>
                  </optgroup>
                  <optgroup label="Sans-Serif (Modern Minimal)">
                    <option value="Outfit">Outfit (Soho Industrial Minimal)</option>
                    <option value="Inter">Inter (Clean Apple Aesthetic)</option>
                    <option value="Montserrat">Montserrat (Solid Structural)</option>
                  </optgroup>
                </select>
              </div>

              {/* Button Style */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Button Style Preset</label>
                <select
                  name="button_style"
                  value={theme.button_style}
                  onChange={handleSelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 outline-none focus:border-accent cursor-pointer"
                >
                  <option value="square">Square Corners (0px radius)</option>
                  <option value="rounded">Rounded Corners (Dynamic radius)</option>
                  <option value="pill">Full Pill shape (Rounded-full)</option>
                </select>
              </div>

              {/* Border Radius Custom value */}
              {theme.button_style === 'rounded' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Custom Corner Radius (CSS)</label>
                  <input
                    type="text"
                    name="border_radius"
                    value={theme.border_radius}
                    onChange={(e) => setTheme({ ...theme, border_radius: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 outline-none focus:border-accent"
                    placeholder="6px"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Navigation Layouts Card */}
          <div className="bg-slate-900 border border-slate-800/60 p-6 md:p-8 rounded-xl space-y-6">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3">
              Navigation Layouts & Animations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Layout */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Header Navigation Layout</label>
                <select
                  name="header_layout"
                  value={theme.header_layout}
                  onChange={handleSelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 outline-none focus:border-accent cursor-pointer"
                >
                  <option value="centered">Centered Branding & Clean Nav</option>
                  <option value="minimal">Minimal Single-Row layout</option>
                  <option value="luxury">Luxury Dual-Row with Utility Bar</option>
                </select>
              </div>

              {/* Footer Layout */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Footer Layout</label>
                <select
                  name="footer_layout"
                  value={theme.footer_layout}
                  onChange={handleSelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 outline-none focus:border-accent cursor-pointer"
                >
                  <option value="simple">Simple Minimal Footer</option>
                  <option value="luxury">Luxury Columns with Brand Statement</option>
                </select>
              </div>

              {/* Animation style */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Page Transition Animations</label>
                <select
                  name="animation_style"
                  value={theme.animation_style}
                  onChange={handleSelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 outline-none focus:border-accent cursor-pointer"
                >
                  <option value="fade">Elegant Fade-In</option>
                  <option value="slide">Smooth Slide-Up & Fade</option>
                  <option value="none">Zero animations (Instant load)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-4 px-10 rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSaving ? 'Applying Design...' : 'Publish Theme'}
              <Save className="w-4 h-4" />
            </button>
          </div>

        </form>

        {/* RIGHT COLUMN: REAL-TIME RENDERING PREVIEW (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-xl space-y-5 shadow-sm text-left">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent animate-pulse" />
              Live Theme Preview
            </h4>
            
            {/* Simulation card of the hotel frontend */}
            <div 
              style={{ 
                backgroundColor: theme.background_color, 
                color: theme.text_color,
                fontFamily: `'${theme.font_family}', sans-serif`
              }} 
              className="w-full rounded-xl border border-slate-800/30 p-6 text-center space-y-6 transition-all duration-300 shadow-inner"
            >
              <div className="space-y-1">
                <span style={{ color: theme.accent_color }} className="text-[9px] tracking-[0.3em] font-bold uppercase block">
                  Bespoke Oasis
                </span>
                <h4 style={{ color: theme.primary_color }} className="text-2xl font-light tracking-wide capitalize">
                  Simulation Suite
                </h4>
                <div style={{ backgroundColor: theme.accent_color }} className="w-8 h-[1px] mx-auto opacity-70" />
              </div>

              <p style={{ color: theme.text_color }} className="text-[11px] leading-relaxed opacity-75 max-w-xs mx-auto">
                This simulated card renders live using your active colors, button border radii, and custom typography variables.
              </p>

              {/* Interactive buttons */}
              <div className="flex flex-col gap-2 pt-2 max-w-[200px] mx-auto">
                {/* Primary Button */}
                <button 
                  type="button"
                  style={{ 
                    backgroundColor: theme.primary_color, 
                    color: theme.background_color,
                    borderRadius: previewRadius
                  }} 
                  className="px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all hover:opacity-90"
                >
                  Reserve Now
                </button>
                
                {/* Accent Button */}
                <button 
                  type="button"
                  style={{ 
                    borderColor: theme.accent_color,
                    color: theme.accent_color,
                    borderRadius: previewRadius
                  }} 
                  className="px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase border transition-all hover:bg-black/5"
                >
                  Explore Rooms
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/45 rounded-lg border border-slate-850/60 flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>When you click &ldquo;Publish Theme&rdquo;, these parameters are pushed instantly to the tenant website, reloading headers and layouts without requiring a package build.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
