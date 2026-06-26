'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Check } from 'lucide-react';

interface ContactSectionProps {
  hotelId: string;
  email?: string;
  phone?: string;
  address?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    twitter?: string;
  };
}

export default function ContactSection({ hotelId, email, phone, address, socials }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          ...formData,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit message');
      }

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Contact form submission error:', err);
      setSubmitError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="w-full py-20 md:py-28 bg-hotel-bg text-hotel-text px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
        
        {/* LEFT COLUMN: CONTACT DETAILS */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-3">
            <span className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
              Connect With Us
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide font-hotel capitalize">
              Inquiries & Contact
            </h2>
            <div className="w-12 h-[1px] bg-accent/60" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reach out to our concierge team to organize reservations or ask any questions regarding your arrival.
            </p>
          </div>

          <div className="space-y-5">
            {/* Phone */}
            {phone && (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/5 dark:bg-accent/10 rounded-hotel border border-accent/10 text-accent flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concierge Line</p>
                  <a href={`tel:${phone}`} className="text-xs font-semibold hover:text-accent transition-colors">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {email && (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/5 dark:bg-accent/10 rounded-hotel border border-accent/10 text-accent flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Relations</p>
                  <a href={`mailto:${email}`} className="text-xs font-semibold hover:text-accent transition-colors">
                    {email}
                  </a>
                </div>
              </div>
            )}

            {/* Address */}
            {address && (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/5 dark:bg-accent/10 rounded-hotel border border-accent/10 text-accent flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location Address</p>
                  <span className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                    {address}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Social Icons Quick links */}
          {socials && Object.values(socials).some(Boolean) && (
            <div className="space-y-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/30">
              <h4 className="text-xs font-bold tracking-widest uppercase text-slate-400">Direct Chat channels</h4>
              <div className="flex gap-4">
                {socials.whatsapp && (
                  <a 
                    href={socials.whatsapp} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-slate-400 hover:text-accent transition-colors text-xs tracking-wider font-semibold"
                  >
                    WhatsApp
                  </a>
                )}
                {socials.instagram && (
                  <a 
                    href={socials.instagram} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-slate-400 hover:text-accent transition-colors text-xs tracking-wider font-semibold"
                  >
                    Instagram
                  </a>
                )}
                {socials.facebook && (
                  <a 
                    href={socials.facebook} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-slate-400 hover:text-accent transition-colors text-xs tracking-wider font-semibold"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CONTACT FORM */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-6 md:p-8 rounded-hotel border border-slate-100 dark:border-slate-900 shadow-lg w-full">
          {submitSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="p-4 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide uppercase">Message Received</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Thank you for reaching out. A dedicated member of our guest relations team will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-xs font-bold text-accent tracking-widest uppercase hover:underline pt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <h4 className="text-sm font-bold tracking-widest uppercase text-primary/70 font-sans border-b border-slate-50 dark:border-slate-900 pb-3">
                Send Digital Inquiry
              </h4>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-4 py-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-accent transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-4 py-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-4 py-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Message Details</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="How may we assist you?"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded px-4 py-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-accent transition-colors resize-none"
                  required
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-500 font-medium">{submitError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:opacity-95 text-white font-bold text-xs tracking-widest uppercase py-4 rounded-hotel shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
