import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';
import {
  buildGoogleDirectionsUrl,
  extractLatLng,
  normalizeMapEmbedUrl,
} from '@/lib/map-utils';

interface LocationSectionProps {
  hotelName: string;
  address: string;
  mapUrl: string;
}

export default function LocationSection({ hotelName, address, mapUrl }: LocationSectionProps) {
  const lowerName = hotelName.toLowerCase();
  const isMalibu = lowerName.includes('horizon') || lowerName.includes('malibu');
  const isSoho = lowerName.includes('urban nest') || lowerName.includes('soho');

  const defaultAttractions = isMalibu
    ? [
        { name: 'Malibu Pier', distance: '1.2 miles / 5 mins drive', desc: 'Historic wooden pier featuring organic dining, fishing, and beautiful ocean vistas.' },
        { name: 'Zuma Beach', distance: '4.5 miles / 10 mins drive', desc: 'World-renowned pristine sandy shoreline, popular for surfing and dolphin sightings.' },
        { name: 'The Getty Villa', distance: '8.0 miles / 15 mins drive', desc: 'An educational center and museum dedicated to the study of ancient Greek and Roman arts.' }
      ]
    : isSoho
    ? [
        { name: 'Soho Shopping Broadway', distance: '0.1 miles / 2 mins walk', desc: 'World-famous cobblestone streets featuring flagship designer fashion and luxury boutiques.' },
        { name: 'Washington Square Park', distance: '0.6 miles / 12 mins walk', desc: 'Historic Manhattan public park featuring the iconic arch, fountains, and vibrant local arts.' },
        { name: 'Museum of Modern Art (MoMA)', distance: '2.4 miles / 15 mins taxi', desc: 'The world’s preeminent collection of modern and contemporary masterpieces.' }
      ]
    : null;

  const safeEmbedUrl = normalizeMapEmbedUrl(mapUrl, address || hotelName);
  const coords = extractLatLng(mapUrl) || extractLatLng(safeEmbedUrl);
  const googleDirectionsUrl = buildGoogleDirectionsUrl(safeEmbedUrl || mapUrl, hotelName, address);

  return (
    <section id="location" className="w-full py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-stretch">
        
        {/* LEFT COLUMN: MAP */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-hotel overflow-hidden shadow-lg border border-slate-200/40 dark:border-slate-800 bg-slate-200 min-h-[350px] lg:min-h-0 relative">
          {safeEmbedUrl ? (
            <iframe
              src={safeEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${hotelName} Location Map`}
              className="w-full h-full transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full min-h-[380px] flex items-center justify-center text-xs text-slate-500 p-6 text-center">
              {address || hotelName}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LOCATION DETAILS */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8 text-left">
          <div className="space-y-3">
            <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
              Location & Directions
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide font-hotel capitalize">
              {hotelName}
            </h2>
            <div className="w-12 h-[1px] bg-accent/60" />
            
            <div className="flex items-start gap-2.5 pt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
              <span>{address || hotelName}</span>
            </div>

            {coords && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
                <Compass className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>
                  GPS: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          {defaultAttractions && (
            <div className="space-y-6">
              <h4 className="text-xs font-bold tracking-widest uppercase text-primary/70 font-sans">
                Nearby Sights
              </h4>
              <div className="space-y-5">
                {defaultAttractions.map((attr, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    <div className="p-2 bg-accent/5 dark:bg-accent/10 rounded-hotel text-accent border border-accent/10 flex-shrink-0 mt-0.5">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h5 className="text-xs font-bold tracking-wider uppercase text-primary font-sans">{attr.name}</h5>
                        <span className="text-[9px] font-bold text-accent tracking-wide uppercase bg-accent/5 px-2 py-0.5 rounded">
                          {attr.distance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed">
                        {attr.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <a
              href={googleDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-hotel hover:bg-accent transition-all duration-300 shadow-md w-fit"
            >
              <Navigation className="w-4 h-4" />
              {coords ? 'Navigate via Exact GPS Pin' : 'Open in Google Maps'}
            </a>
            {coords && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct GPS navigation verified by {hotelName} ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
