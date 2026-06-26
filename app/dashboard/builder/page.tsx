'use client';

import React, { useState, useEffect } from 'react';
import { Save, ChevronUp, ChevronDown, Eye, EyeOff, AlertCircle, CheckCircle, GripVertical } from 'lucide-react';
import { saveHomepageLayoutAction } from '@/lib/db/actions';

interface BlockItem {
  id: string;
  name: string;
  isEnabled: boolean;
  description: string;
}

export default function BuilderPage() {
  const [hotelId, setHotelId] = useState('');
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // All possible sections and their definitions
  const sectionDefinitions: Record<string, { name: string; desc: string }> = {
    hero: { name: 'Hero Slider Banner', desc: 'Full-screen visual slideshow with custom headlines, subheadings and call to actions.' },
    about: { name: 'About Introduction', desc: 'Introduction to the hotel heritage, featuring overlapping luxury image composition.' },
    rooms: { name: 'Accommodations Showcase', desc: 'Grid display of available suites and room types, details, pricing and booking triggers.' },
    facilities: { name: 'Resort Amenities', desc: 'Grid listing of premium services such as spa, restaurants, swimming pools, and butler services.' },
    promotions: { name: 'Special Offers', desc: 'Active promotion campaigns, timelines, CTAs and copyable coupon codes.' },
    gallery: { name: 'Filterable Media Gallery', desc: 'Grouped photo gallery with category filter tabs and interactive modal lightbox.' },
    testimonials: { name: 'Guest Reviews', desc: 'Double column cards displaying elegant guest reviews and location markers.' },
    awards: { name: 'Prestige Accolades', desc: 'Accreditation ribbon displaying Michelin Keys, Conde Nast Traveler or Travel+Leisure titles.' },
    location: { name: 'Map & Nearby attractions', desc: 'Responsive embedded Google Map alongside curated lists of local tourist spots.' },
    contact: { name: 'Digital Contact Form', desc: 'Direct contact phone and email directories plus interactive inquiry submission form.' }
  };

  useEffect(() => {
    const getActiveLayout = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        if (hotel) {
          setHotelId(hotel.id);
          
          // Map current homepage_layout array to block items
          const currentLayout = hotel.homepage_layout || [];
          
          // 1. Map existing layout elements in order, treating them as enabled
          const mappedBlocks: BlockItem[] = currentLayout.map((key: string) => ({
            id: key,
            name: sectionDefinitions[key]?.name || key,
            description: sectionDefinitions[key]?.desc || '',
            isEnabled: true
          }));

          // 2. Identify any defined sections missing from layout (disabled ones)
          Object.keys(sectionDefinitions).forEach((key: string) => {
            if (!currentLayout.includes(key)) {
              mappedBlocks.push({
                id: key,
                name: sectionDefinitions[key].name,
                description: sectionDefinitions[key].desc,
                isEnabled: false
              });
            }
          });

          setBlocks(mappedBlocks);
        }
      } catch (err) {
        console.error('Failed to load layout via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getActiveLayout();
  }, []);

  const toggleBlock = (index: number) => {
    const updated = [...blocks];
    updated[index].isEnabled = !updated[index].isEnabled;
    setBlocks(updated);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    
    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setBlocks(updated);
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    setNotification(null);

    // Filter only enabled blocks to construct the new homepage layout order
    const enabledLayoutOrder = blocks
      .filter(b => b.isEnabled)
      .map(b => b.id);

    const result = await saveHomepageLayoutAction(hotelId, enabledLayoutOrder);

    if (result.success) {
      setNotification({
        type: 'success',
        message: 'Homepage layout structure updated successfully. Reordering is now live on your site.',
      });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to save homepage layout configuration.',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading homepage layout...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
            Homepage Section Builder
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Drag, reorder, enable, or disable homepage content blocks dynamically. Section orders update instantly.
          </p>
        </div>
        <button
          onClick={handleSaveLayout}
          disabled={isSaving}
          className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] self-start sm:self-center"
        >
          {isSaving ? 'Saving Order...' : 'Save Structure'}
          <Save className="w-4 h-4" />
        </button>
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
            <h5 className="text-xs font-bold uppercase tracking-wider">Layout Update</h5>
            <p className="text-[11px] leading-relaxed opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* BLOCKS LAYOUT MANAGER LIST */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden divide-y divide-slate-850">
        {blocks.map((block, index) => (
          <div 
            key={block.id} 
            className={`p-5 flex items-center justify-between gap-4 transition-colors ${
              block.isEnabled 
                ? 'bg-slate-900/40' 
                : 'bg-slate-950/25 opacity-60'
            }`}
          >
            {/* Grab handle & Title Column */}
            <div className="flex items-start gap-4 text-left flex-1">
              <div className="text-slate-600 mt-1 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                    {block.name}
                  </h4>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-widest ${
                    block.isEnabled 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {block.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-450 leading-relaxed max-w-xl">
                  {block.description}
                </p>
              </div>
            </div>

            {/* Reorder and Visibility Controls Column */}
            <div className="flex items-center gap-4">
              
              {/* Up / Down Reordering Buttons */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  title="Move Section Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-slate-800 mx-1" />
                <button
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  title="Move Section Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Visibility Toggle Switch */}
              <button
                onClick={() => toggleBlock(index)}
                className={`p-2.5 rounded-lg border flex items-center justify-center transition-all ${
                  block.isEnabled
                    ? 'bg-primary/90 border-slate-800 text-accent hover:bg-primary shadow-sm'
                    : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                }`}
                title={block.isEnabled ? 'Disable Section' : 'Enable Section'}
              >
                {block.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

            </div>

          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-500 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <span>Sections placed higher in the builder list will appear closer to the top of your website. Disabled sections are excluded from the render array entirely, optimizing SEO index weight and page load speed.</span>
      </div>

    </div>
  );
}
