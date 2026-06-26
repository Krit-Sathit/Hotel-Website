'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { saveHeroSlidesAction } from '@/lib/db/actions';
import type { HeroSlide } from '@/lib/db/mock-data';

export default function HeroPage() {
  const [hotelId, setHotelId] = useState('');
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const getActiveSlides = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        const slidesList = data.slides;
        if (hotel) {
          setHotelId(hotel.id);
          setSlides(slidesList || []);
        }
      } catch (err) {
        console.error('Failed to load slides via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getActiveSlides();
  }, []);

  const handleFieldChange = (index: number, field: keyof HeroSlide, value: any) => {
    const updated = [...slides];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setSlides(updated);
  };

  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      hotel_id: hotelId,
      image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
      headline: 'Brand New Experience',
      subheadline: 'Luxury Redefined',
      button_text: 'Book Now',
      button_link: '#booking',
      overlay_color: '#000000',
      overlay_opacity: 0.4,
      sort_order: slides.length
    };
    setSlides([...slides, newSlide]);
  };

  const deleteSlide = (index: number) => {
    const updated = slides.filter((_, i) => i !== index);
    // Recalculate sort_order
    const reordered = updated.map((slide, idx) => ({
      ...slide,
      sort_order: idx
    }));
    setSlides(reordered);
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...slides];

    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-assign sort orders
    const reordered = updated.map((slide, idx) => ({
      ...slide,
      sort_order: idx
    }));

    setSlides(reordered);
  };

  const handleSaveSlides = async () => {
    setIsSaving(true);
    setNotification(null);

    // Validate that all slides have image URLs
    const invalidSlide = slides.find(s => !s.image_url.trim());
    if (invalidSlide) {
      setNotification({
        type: 'error',
        message: 'All hero slides must have a valid Image URL.'
      });
      setIsSaving(false);
      return;
    }

    const result = await saveHeroSlidesAction(hotelId, slides);

    if (result.success) {
      setNotification({
        type: 'success',
        message: 'Hero slider configuration saved successfully. Slider updates are now live.',
      });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to save slides.',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading hero slides...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
            Hero Slider Editor
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Add, delete, or reorder the prominent background slides shown on your homepage hero carousel.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={addSlide}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-white font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-accent" />
            Add Slide
          </button>

          <button
            onClick={handleSaveSlides}
            disabled={isSaving}
            className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSaving ? 'Publishing...' : 'Publish Slides'}
            <Save className="w-4 h-4" />
          </button>
        </div>
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
            <h5 className="text-xs font-bold uppercase tracking-wider">Hero Configuration</h5>
            <p className="text-[11px] leading-relaxed opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* SLIDES LIST */}
      {slides.length > 0 ? (
        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div 
              key={slide.id}
              className="bg-slate-900 border border-slate-800/60 p-6 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-6 relative shadow-sm hover:border-slate-750 transition-all"
            >
              
              {/* Left Column: Image Preview & Sorting Actions (3 cols) */}
              <div className="md:col-span-3 flex flex-col justify-between items-center gap-4">
                <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center text-slate-600">
                  {slide.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={slide.image_url} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/75 text-accent text-[9px] font-bold px-2 py-0.5 rounded border border-white/10 tracking-widest uppercase">
                    Slide {index + 1}
                  </div>
                </div>

                {/* Move & Trash Buttons */}
                <div className="flex items-center justify-between w-full border-t border-slate-850 pt-3">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-1">
                    <button
                      onClick={() => moveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => deleteSlide(index)}
                    className="p-2 bg-red-550/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/10 rounded transition-colors"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Slide Text Inputs (9 cols) */}
              <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {/* Image URL */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Slide Image URL</label>
                  <input
                    type="text"
                    value={slide.image_url}
                    onChange={(e) => handleFieldChange(index, 'image_url', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Headline */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Headline Title</label>
                  <input
                    type="text"
                    value={slide.headline || ''}
                    onChange={(e) => handleFieldChange(index, 'headline', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                  />
                </div>

                {/* Subheadline */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Subheading (Top badge)</label>
                  <input
                    type="text"
                    value={slide.subheadline || ''}
                    onChange={(e) => handleFieldChange(index, 'subheadline', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                  />
                </div>

                {/* Button Text */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Button Text</label>
                  <input
                    type="text"
                    value={slide.button_text || ''}
                    onChange={(e) => handleFieldChange(index, 'button_text', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                  />
                </div>

                {/* Button Link */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Button Redirect Link</label>
                  <input
                    type="text"
                    value={slide.button_link || ''}
                    onChange={(e) => handleFieldChange(index, 'button_link', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                  />
                </div>

                {/* Overlay Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Overlay Tint Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.overlay_color || '#000000'}
                      onChange={(e) => handleFieldChange(index, 'overlay_color', e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <code className="text-[10px] text-slate-400 font-mono uppercase">{slide.overlay_color}</code>
                  </div>
                </div>

                {/* Overlay Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Overlay Opacity</label>
                    <span className="text-[9px] text-accent font-bold font-mono">{(slide.overlay_opacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={slide.overlay_opacity}
                    onChange={(e) => handleFieldChange(index, 'overlay_opacity', parseFloat(e.target.value))}
                    className="w-full accent-accent bg-slate-950 cursor-pointer h-1 rounded"
                  />
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 bg-slate-900 border border-slate-800/60 rounded-xl text-center text-slate-450">
          <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-bold uppercase tracking-wider">No Hero Slides Configured</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Click &ldquo;Add Slide&rdquo; above to create your first visual homepage background slides.
          </p>
        </div>
      )}

      <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-500 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <span>For the best high-performance visual aesthetics, we recommend using compressed WebP images with a 16:9 ratio and a width of 1920px. Adjusting overlay opacity helps guarantee high typography readability.</span>
      </div>

    </div>
  );
}
