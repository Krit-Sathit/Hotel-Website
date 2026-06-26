'use client';

import React, { useState } from 'react';
import { Tag, Calendar, Copy, Check, ArrowRight } from 'lucide-react';
import { Promotion } from '@/lib/db/mock-data';

interface PromotionsSectionProps {
  promotions: Promotion[];
}

export default function PromotionsSection({ promotions }: PromotionsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPromoCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDateRange = (start: string, end: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const startDate = new Date(start).toLocaleDateString('en-US', options);
    const endDate = new Date(end).toLocaleDateString('en-US', options);
    return `${startDate} – ${endDate}`;
  };

  return (
    <section id="promotions" className="w-full py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-250 px-6">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
            Curated Campaigns
          </p>
          <h2 className="text-3xl md:text-5xl font-light tracking-wide font-hotel capitalize">
            Exclusive Offers
          </h2>
          <div className="w-12 h-[1px] bg-accent/60 mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enjoy premium privileges and tailored experiences designed to elevate your stay.
          </p>
        </div>

        {/* PROMOTIONS DISPLAY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {promotions.map((promo) => (
            <div 
              key={promo.id} 
              className="relative bg-white dark:bg-slate-950 rounded-hotel overflow-hidden shadow-lg border border-slate-100 dark:border-slate-900 flex flex-col md:flex-row group"
            >
              {/* Promotion Banner Image (Left Column on larger viewports) */}
              <div className="relative w-full md:w-[42%] aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-150 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={promo.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'} 
                  alt={promo.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                />
                <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
              </div>

              {/* Promotion Description (Right Column) */}
              <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-3">
                  
                  {/* Date Range Badge */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {formatDateRange(promo.start_date, promo.end_date)}
                  </div>

                  <h3 className="text-lg md:text-xl font-bold tracking-wide text-primary font-hotel">
                    {promo.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {promo.description}
                  </p>
                </div>

                {/* Promo Code Box & CTA */}
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-900">
                  {promo.promo_code && (
                    <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Promo Code:</span>
                        <code className="text-xs font-bold text-primary font-mono select-all tracking-wider uppercase bg-primary/5 px-2 py-0.5 rounded">
                          {promo.promo_code}
                        </code>
                      </div>
                      <button
                        onClick={() => copyPromoCode(promo.promo_code || '', promo.id)}
                        className="text-slate-400 hover:text-accent hover:bg-slate-150 dark:hover:bg-slate-800 p-1.5 rounded transition-colors"
                        title="Copy Promo Code"
                      >
                        {copiedId === promo.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  <a 
                    href={promo.cta_link || '#booking'}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-hotel transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {promo.cta_text}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
