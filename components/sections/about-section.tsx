import React from 'react';
import { Compass, Feather, Waves } from 'lucide-react';

interface AboutSectionProps {
  content: {
    title: string;
    subtitle?: string;
    description: string;
    badge?: string;
    features?: Array<{ title: string; desc: string }>;
  };
}

export default function AboutSection({ content }: AboutSectionProps) {
  // Simple icon mapper to keep the interface visual and professional
  const getFeatureIcon = (index: number) => {
    switch (index % 3) {
      case 0: return <Feather className="w-5 h-5 text-accent" />;
      case 1: return <Compass className="w-5 h-5 text-accent" />;
      case 2: return <Waves className="w-5 h-5 text-accent" />;
      default: return <Feather className="w-5 h-5 text-accent" />;
    }
  };

  return (
    <section id="about" className="w-full py-20 md:py-28 bg-hotel-bg text-hotel-text px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LEFT COLUMN: DESCRIPTION & COPY */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {content.badge && (
            <span className="text-[10px] md:text-xs tracking-[0.3em] font-bold text-accent uppercase bg-accent/5 py-1.5 px-4 rounded-full border border-accent/10">
              {content.badge}
            </span>
          )}
          
          <div className="space-y-2">
            {content.subtitle && (
              <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-slate-450 dark:text-slate-400">
                {content.subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-5xl font-light tracking-wide leading-tight font-hotel capitalize">
              {content.title}
            </h2>
          </div>
          
          {/* Decorative Divider */}
          <div className="w-16 h-[1px] bg-accent/50" />
          
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-350 max-w-xl">
            {content.description}
          </p>

          {/* List of features */}
          {content.features && content.features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              {content.features.map((feat, index) => (
                <div key={feat.title} className="flex items-start gap-3">
                  <div className="p-2 bg-accent/5 dark:bg-accent/10 rounded-hotel border border-accent/10 flex-shrink-0 mt-0.5">
                    {getFeatureIcon(index)}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-primary font-sans">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PREMIUM IMAGES */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          {/* Overlapping Image Grid Layout */}
          <div className="relative w-full aspect-[4/3] md:aspect-square max-w-lg">
            {/* Primary Main Image */}
            <div className="absolute top-0 left-0 w-[80%] h-[80%] rounded-hotel overflow-hidden shadow-xl border border-slate-200/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" 
                alt="Luxury Lobby Lounge" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Overlapping Secondary Image */}
            <div className="absolute bottom-0 right-0 w-[55%] h-[55%] rounded-hotel overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80" 
                alt="Wellness Treatment Room" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Ornamental Frame Backing Card */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-l-2 border-b-2 border-accent/30 rounded-bl-hotel -z-10" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border-r-2 border-t-2 border-accent/30 rounded-tr-hotel -z-10" />
          </div>
        </div>

      </div>
    </section>
  );
}
