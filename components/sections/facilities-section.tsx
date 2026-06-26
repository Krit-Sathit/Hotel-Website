import React from 'react';
import { Sparkles, UtensilsCrossed, ConciergeBell, Droplet, HelpCircle } from 'lucide-react';

interface FacilitiesSectionProps {
  content: {
    title: string;
    subtitle?: string;
    items: Array<{ title: string; desc: string; icon?: string }>;
  };
}

export default function FacilitiesSection({ content }: FacilitiesSectionProps) {
  // Dynamically map icon names to Lucide icon components
  const getIconComponent = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'spa':
        return <Sparkles className="w-6 h-6 text-accent" />;
      case 'dining':
      case 'restaurant':
        return <UtensilsCrossed className="w-6 h-6 text-accent" />;
      case 'pool':
      case 'beach':
        return <Droplet className="w-6 h-6 text-accent" />;
      case 'service':
      case 'butler':
      case 'concierge':
        return <ConciergeBell className="w-6 h-6 text-accent" />;
      default:
        return <Sparkles className="w-6 h-6 text-accent" />;
    }
  };

  return (
    <section id="facilities" className="w-full py-20 md:py-28 bg-hotel-bg text-hotel-text px-6">
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

        {/* FACILITIES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {content.items.map((facility, index) => (
            <div 
              key={facility.title} 
              className="group p-8 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-hotel hover:border-accent/30 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              {/* Icon Container */}
              <div className="p-4 bg-accent/5 dark:bg-accent/10 rounded-full group-hover:bg-accent group-hover:text-white text-accent transition-all duration-300 shadow-sm border border-accent/10">
                {getIconComponent(facility.icon)}
              </div>

              {/* Title & Details */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold tracking-widest uppercase text-primary font-sans">
                  {facility.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                  {facility.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
