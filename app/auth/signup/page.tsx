'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lock, Mail, Building, User, Globe, AlertCircle } from 'lucide-react';
import { registerNewHotelAction } from '@/lib/db/actions';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronously auto-generate slug as the user types their hotel name
  const handleHotelNameChange = (val: string) => {
    setHotelName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Trigger our server action to securely register the new hotel and seed default tables
      const result = await registerNewHotelAction(hotelName, slug, email);

      if (result.success && result.hotelId) {
        // Save the new hotel's ID to cookies as the active tenant
        document.cookie = `active_hotel_id=${result.hotelId}; path=/; max-age=31536000; SameSite=Lax`;
        
        // Redirect to console dashboard
        router.push('/dashboard');
      } else {
        setErrorMsg(result.error || 'Failed to register hotel. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Failed to register hotel:', err);
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 relative overflow-hidden text-slate-800 font-sans select-none animate-fade-in">
      
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      {/* Card Wrapper */}
      <div className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-2xl shadow-xl shadow-slate-200/40 space-y-7 relative z-10">
        
        {/* Branding header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex p-3 bg-accent/10 border border-accent/20 rounded-full text-accent mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-widest uppercase text-slate-900">Join FlowStay™</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Register Hotel & Launch Website
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4 text-left">
          
          {/* Owner Full Name */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Owner Name</label>
            <div className="relative bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3.5 text-slate-400 focus-within:border-accent focus-within:bg-white transition-all">
              <User className="w-4 h-4 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none outline-none py-3 text-xs text-slate-800 w-full placeholder-slate-400"
                placeholder="Alex Mercer"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Hotel Name */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Hotel Name</label>
            <div className="relative bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3.5 text-slate-400 focus-within:border-accent focus-within:bg-white transition-all">
              <Building className="w-4 h-4 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                value={hotelName}
                onChange={(e) => handleHotelNameChange(e.target.value)}
                className="bg-transparent border-none outline-none py-3 text-xs text-slate-800 w-full placeholder-slate-400"
                placeholder="Grand Horizon Resort"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Subdomain slug */}
          {slug && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Temporary Subdomain</label>
              <div className="relative bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3.5 text-slate-400">
                <Globe className="w-4 h-4 mr-2.5 flex-shrink-0 text-accent" />
                <span className="text-xs font-mono text-slate-700 font-semibold">{slug}</span>
                <span className="text-[10px] text-slate-500 font-mono font-medium ml-1">.flowstay.com</span>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Owner Email</label>
            <div className="relative bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3.5 text-slate-400 focus-within:border-accent focus-within:bg-white transition-all">
              <Mail className="w-4 h-4 mr-2.5 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none py-3 text-xs text-slate-800 w-full placeholder-slate-400"
                placeholder="alex@horizon.com"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Security Password</label>
            <div className="relative bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3.5 text-slate-400 focus-within:border-accent focus-within:bg-white transition-all">
              <Lock className="w-4 h-4 mr-2.5 flex-shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none py-3 text-xs text-slate-800 w-full placeholder-slate-400"
                placeholder="Choose a strong password"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-widest uppercase py-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Provisioning Cloud Instances...' : 'Create & Deploy CMS'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Redirect back to login */}
        <div className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <Link href="/auth/login" className="text-accent hover:underline font-bold uppercase tracking-wider text-[10px]">
            Console Sign In
          </Link>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-6 text-[10px] text-slate-400 tracking-widest uppercase flex items-center gap-1">
        <span>Powered by</span>
        <span className="font-bold text-slate-500 tracking-[0.2em]">FlowStay Platform</span>
      </div>

    </div>
  );
}
