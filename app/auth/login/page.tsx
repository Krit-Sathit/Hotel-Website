'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sathit2527@gmail.com');
  const [password, setPassword] = useState('Krit075388271');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const users: any[] = data.users || [];

      // Check for user matching email and password
      const user = users.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
      );

      // Super Admin fallback check for platform owner
      const isPlatformOwner = normalizedEmail === 'sathit2527@gmail.com' && password === 'Krit075388271';

      if (!user && !isPlatformOwner) {
        setIsSubmitting(false);
        setErrorMsg('Invalid email address or security password. Access denied.');
        return;
      }

      const role = isPlatformOwner ? 'super_admin' : (user?.role || 'hotel_admin');
      const assignedHotelId = user?.hotel_id;

      // For Super Admin (Sathit), allow full hotel switching access (default to The Par Phuket or current cookie)
      // For Hotel Admin, lock active_hotel_id to their specific assigned hotel
      if (role === 'super_admin') {
        if (!document.cookie.includes('active_hotel_id=')) {
          document.cookie = `active_hotel_id=hotel-1784206393534; path=/; max-age=31536000; SameSite=Lax`;
        }
      } else if (assignedHotelId) {
        document.cookie = `active_hotel_id=${assignedHotelId}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // Save session cookies
      document.cookie = `auth_session=authenticated; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `user_role=${role}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `user_email=${normalizedEmail}; path=/; max-age=31536000; SameSite=Lax`;

      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Authentication server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 relative overflow-hidden text-slate-800 font-sans select-none">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

      {/* Main card container */}
      <div className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-2xl shadow-xl shadow-slate-200/40 space-y-6 animate-fade-in relative z-10">
        
        {/* Branding & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-accent/10 border border-accent/20 rounded-full text-accent mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-widest uppercase text-slate-900 font-sans">
              FlowStay Hotel CMS
            </h2>
            <p className="text-xs text-slate-450 uppercase tracking-widest font-semibold">
              Bespoke SaaS Administration
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700 text-xs leading-relaxed text-left animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px]">Authentication Failed</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Email Address</label>
            <div className="relative bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3.5 text-slate-400 focus-within:border-accent focus-within:bg-white transition-all">
              <Mail className="w-4 h-4 mr-2.5 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none py-3.5 text-xs text-slate-800 w-full placeholder-slate-400"
                placeholder="Enter your registered email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Security Password</label>
              <span className="text-[9px] text-accent hover:underline cursor-pointer font-bold uppercase tracking-wider">Forgot?</span>
            </div>
            <div className="relative bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3.5 text-slate-400 focus-within:border-accent focus-within:bg-white transition-all">
              <Lock className="w-4 h-4 mr-2.5 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none py-3.5 text-xs text-slate-800 w-full placeholder-slate-400 font-mono"
                placeholder="Enter your security code"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 focus:outline-none p-1 transition-colors ml-1 flex-shrink-0"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me box */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="remember"
              defaultChecked
              className="accent-accent bg-white border-slate-300 rounded w-3.5 h-3.5"
            />
            <label htmlFor="remember" className="text-slate-600 select-none cursor-pointer">
              Authorize session cache on this machine
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-widest uppercase py-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Sign In To Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Onboarding Signup redirect */}
        <div className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
          <span>New hotel partner? </span>
          <Link href="/auth/signup" className="text-accent hover:underline font-bold uppercase tracking-wider text-[10px]">
            Join FlowStay
          </Link>
        </div>

      </div>

      {/* Footer Branding Statement */}
      <div className="absolute bottom-6 text-[10px] text-slate-400 tracking-widest uppercase flex items-center gap-1">
        <span>Powered by</span>
        <span className="font-bold text-slate-500 tracking-[0.2em]">FlowStay Platform</span>
      </div>

    </div>
  );
}
