import React from 'react';
import { Award } from 'lucide-react';

interface AwardsSectionProps {
  content: {
    title: string;
    subtitle?: string;
    items: Array<{ name: string; detail: string }>;
  };
}

export default function AwardsSection({ content }: AwardsSectionProps) {
  return (
    <section id="awards" className="w-full py-16 md:py-24 bg-hotel-bg text-hotel-text px-6">
      <div className="max-w-7xl mx-auto space-y-10 md:space-y-12">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          {content.subtitle && (
            <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
              {content.subtitle}
            </p>
          )}
          <h2 className="text-2xl md:text-4xl font-light tracking-wide font-hotel capitalize">
            {content.title}
          </h2>
          <div className="w-12 h-[1px] bg-accent/60 mx-auto" />
        </div>

        {/* AWARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-center">
          {content.items.map((award, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 space-y-3 border-r last:border-none border-slate-250/20 dark:border-slate-800/30 md:border-b-0"
            >
              <Award className="w-8 h-8 text-accent animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-widest uppercase text-primary font-sans">
                  {award.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                  {award.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
