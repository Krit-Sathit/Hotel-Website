import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Layers, Layout, Compass, Flame, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function PlatformLandingPage() {
  const features = [
    {
      icon: <Layers className="w-5 h-5 text-accent" />,
      title: 'Multi-Tenant Architecture',
      desc: 'Run thousands of hotel websites from a single, high-performance Next.js codebase. Map custom domains and route host headers dynamically.'
    },
    {
      icon: <Layout className="w-5 h-5 text-accent" />,
      title: 'Apple-Inspired Design',
      desc: 'Wow guests at first glance with minimalist grids, curated color palettes, elegant animations, and premium typography.'
    },
    {
      icon: <Compass className="w-5 h-5 text-accent" />,
      title: 'CMS Homepage Builder',
      desc: 'Enable hotel owners and staff to customize colors, fonts, slide orders, and content blocks in real-time with zero code changes.'
    },
    {
      icon: <Flame className="w-5 h-5 text-accent" />,
      title: 'FlowStay Booking Widget',
      desc: 'Guarantee high conversion rates with a reusable booking widget visible on every page, featuring sticky desktop headers and mobile action bars.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans selection:bg-accent/20 select-none">
      
      {/* BACKGROUND ORBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-accent/20 border border-accent/30 rounded-lg text-accent">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-white font-sans">
            FlowStay™
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors"
          >
            Console Sign In
          </Link>
          <Link 
            href="/auth/signup" 
            className="bg-accent hover:opacity-90 text-primary font-bold text-[10px] md:text-xs tracking-widest uppercase py-3 px-6 rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            Launch Partner Site
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative z-10 space-y-6 flex flex-col items-center">
        
        {/* Onboarding Badge */}
        <span className="text-[9px] md:text-[10px] tracking-[0.25em] font-bold text-accent uppercase bg-accent/10 py-1.5 px-4 rounded-full border border-accent/20 animate-pulse">
          SaaS Platform Live
        </span>

        {/* Title */}
        <h1 className="text-4xl md:text-7xl font-light tracking-tight leading-tight text-white max-w-4xl font-sans">
          One Codebase. <br />
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-purple-400">
            Unlimited Hotel Websites.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-md text-slate-400 max-w-2xl leading-relaxed font-light">
          Deploy bespoke, high-conversion websites integrated directly with the FlowStay™ Booking Engine in seconds. Enable hotel administrators to manage themes, hero slides, and rooms with zero code.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center max-w-sm">
          <Link 
            href="/auth/signup" 
            className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs tracking-widest uppercase py-4 px-8 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/auth/login" 
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-bold text-xs tracking-widest uppercase py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            CMS Dashboard
          </Link>
        </div>

      </section>

      {/* MULTI-TENANT LIVE SAMPLES (The most impressive part) */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative z-10 border-t border-slate-900">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">Architecture Proof</span>
          <h3 className="text-xl md:text-2xl font-light tracking-wide text-white">
            Browse Mapped Tenant Websites
          </h3>
          <p className="text-xs text-slate-405 max-w-md mx-auto">
            These live sites run on the exact same codebase, loading custom domains, themes, and rooms instantly from Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Sample Site 1 */}
          <a 
            href="http://hotel-a.localhost:3000" 
            target="_blank" 
            rel="noreferrer"
            className="group bg-slate-900 border border-slate-800/60 rounded-2xl p-6 text-left flex flex-col justify-between hover:border-accent/40 hover:shadow-xl transition-all relative"
          >
            <div className="absolute top-4 right-4 text-slate-500 group-hover:text-accent transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <span className="text-[9px] tracking-widest font-bold uppercase text-accent/80 bg-accent/5 px-2.5 py-1 rounded border border-accent/10">
                Classic Luxury / Serif
              </span>
              <h4 className="text-lg font-bold text-white font-sans uppercase tracking-wider group-hover:text-accent transition-colors">
                The Grand Horizon Resort & Spa
              </h4>
              <p className="text-xs text-slate-455 leading-relaxed font-light">
                Simulation of a high-end Malibu oceanfront retreat. Featuring warm luxury gold/cream theme colors, Cormorant Garamond typography, and classic square borders.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-4 text-xs font-bold text-slate-400 group-hover:text-white transition-colors border-t border-slate-850 mt-4 uppercase tracking-wider text-[10px]">
              Open Mapped Domain: <code className="font-mono text-accent">hotel-a.localhost:3000</code>
            </div>
          </a>

          {/* Sample Site 2 */}
          <a 
            href="http://hotel-b.localhost:3000" 
            target="_blank" 
            rel="noreferrer"
            className="group bg-slate-900 border border-slate-800/60 rounded-2xl p-6 text-left flex flex-col justify-between hover:border-accent/40 hover:shadow-xl transition-all relative"
          >
            <div className="absolute top-4 right-4 text-slate-500 group-hover:text-accent transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <span className="text-[9px] tracking-widest font-bold uppercase text-accent/80 bg-accent/5 px-2.5 py-1 rounded border border-accent/10">
                Boutique Modern / Sans-Serif
              </span>
              <h4 className="text-lg font-bold text-white font-sans uppercase tracking-wider group-hover:text-accent transition-colors">
                Urban Nest Hotel
              </h4>
              <p className="text-xs text-slate-455 leading-relaxed font-light">
                Simulation of an industrial-chic Soho sanctuary in Manhattan. Featuring cold charcoal/teal theme colors, Outfit sans-serif typography, and sleek pill-shaped buttons.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-4 text-xs font-bold text-slate-400 group-hover:text-white transition-colors border-t border-slate-850 mt-4 uppercase tracking-wider text-[10px]">
              Open Mapped Domain: <code className="font-mono text-accent">hotel-b.localhost:3000</code>
            </div>
          </a>

        </div>
      </section>

      {/* CORE FEATURES LIST */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-1 space-y-4 text-left">
            <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">Platform Stack</span>
            <h2 className="text-2xl md:text-4xl font-light tracking-wide text-white leading-tight font-sans">
              Complete Digital Suite
            </h2>
            <p className="text-xs text-slate-450 leading-relaxed font-light">
              FlowStay CMS is built for extreme performance, clean folder organization, and instant theme delivery across thousands of sites.
            </p>
            <div className="space-y-2 pt-2 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Next.js App Router (Latest)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Tailwind CSS v4 & PostCSS</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> TypeScript & ES6+ standards</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Supabase Storage & RLS policies</div>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
            {features.map((feat) => (
              <div key={feat.title} className="space-y-3 bg-slate-900/45 p-6 rounded-xl border border-slate-900">
                <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-lg text-accent w-max">
                  {feat.icon}
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide uppercase font-sans">{feat.title}</h4>
                <p className="text-xs text-slate-450 leading-relaxed font-light">{feat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-8 text-center text-[10px] text-slate-600 tracking-widest uppercase relative z-10">
        <p>© {new Date().getFullYear()} FlowStay Technologies. All rights reserved. One codebase, unlimited luxury.</p>
      </footer>

    </div>
  );
}
