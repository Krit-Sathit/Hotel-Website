import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  content: {
    title: string;
    subtitle?: string;
    items: Array<{ guest: string; text: string; location?: string }>;
  };
}

export default function TestimonialsSection({ content }: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="w-full py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 px-6">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          {content.subtitle && (
            <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
              {content.subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-5xl font-light tracking-wide font-hotel capitalize">
            {content.title}
          </h2>
          <div className="w-12 h-[1px] bg-accent/60 mx-auto" />
        </div>

        {/* TESTIMONIALS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {content.items.map((item, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-slate-950 p-8 md:p-10 rounded-hotel border border-slate-100 dark:border-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative space-y-6"
            >
              {/* Giant Decorative Quote Icon */}
              <div className="absolute top-6 right-8 text-accent/10 pointer-events-none">
                <Quote className="w-16 h-16 transform scale-x-[-1]" />
              </div>

              {/* Review Text */}
              <p className="text-sm md:text-base italic leading-relaxed text-slate-655 dark:text-slate-350 relative z-10 font-hotel font-light">
                “{item.text}”
              </p>

              {/* Guest Details */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-900">
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center font-bold text-accent text-xs">
                  {item.guest.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-primary font-sans">{item.guest}</h4>
                  {item.location && <p className="text-[10px] text-slate-400 font-medium tracking-wide">{item.location}</p>}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
