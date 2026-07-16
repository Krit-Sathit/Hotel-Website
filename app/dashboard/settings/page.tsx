'use client';

import React, { useState, useEffect } from 'react';
import { Save, HelpCircle, AlertCircle, CheckCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { saveGeneralSettingsAction, deleteHotelAction, getAllHotelsAction } from '@/lib/db/actions';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [hotelId, setHotelId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    google_map_url: '',
    custom_domain: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    twitter: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States for Danger Zone delete hotel
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteHotel = async () => {
    if (deleteConfirmName !== formData.name) {
      setDeleteError('Hotel name does not match.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Fetch other hotels first to decide fallback
      const hotelsResult = await getAllHotelsAction();
      let nextHotelId = '';

      if (hotelsResult.success && hotelsResult.hotels) {
        const remaining = hotelsResult.hotels.filter((h: any) => h.id !== hotelId);
        if (remaining.length > 0) {
          nextHotelId = remaining[0].id;
        }
      }

      // 2. Trigger server deletion action
      const deleteResult = await deleteHotelAction(hotelId);

      if (deleteResult.success) {
        if (nextHotelId) {
          // Switch active hotel ID cookie
          document.cookie = `active_hotel_id=${nextHotelId}; path=/; max-age=31536000; SameSite=Lax`;
          // Refresh and redirect to dashboard
          window.location.href = '/dashboard';
        } else {
          // Clear active hotel ID cookie and redirect to signup
          document.cookie = 'active_hotel_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
          window.location.href = '/auth/signup';
        }
      } else {
        setDeleteError(deleteResult.error || 'Failed to delete hotel.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      console.error('Delete hotel error:', err);
      setDeleteError(err.message || 'An error occurred during deletion.');
      setIsDeleting(false);
    }
  };

  // Load active hotel data from our secure API endpoint
  useEffect(() => {
    const getActiveHotel = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        if (hotel) {
          setHotelId(hotel.id);
          setFormData({
            name: hotel.name,
            email: hotel.email,
            phone: hotel.phone || '',
            address: hotel.address || '',
            google_map_url: hotel.google_map_url || '',
            custom_domain: hotel.custom_domain || '',
            facebook: hotel.social_links?.facebook || '',
            instagram: hotel.social_links?.instagram || '',
            whatsapp: hotel.social_links?.whatsapp || '',
            twitter: hotel.social_links?.twitter || '',
          });
        }
      } catch (err) {
        console.error('Failed to load settings via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getActiveHotel();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    const result = await saveGeneralSettingsAction(hotelId, formData);

    if (result.success) {
      setNotification({
        type: 'success',
        message: 'Hotel configuration updated successfully. Changes are now live on your website.',
      });
      // Clear notification after 4 seconds
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to update settings. Please try again.',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading configurations...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
          General Settings
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Manage core hotel branding, contact channels, location details, and social networks.
        </p>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div 
          className={`p-4 rounded-lg flex items-start gap-3 border ${
            notification.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          } animate-fade-in`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold uppercase tracking-wider">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </h5>
            <p className="text-[11px] leading-relaxed opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* SETTINGS FORM */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Profile block */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 md:p-8 rounded-xl space-y-6">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3">
            Hotel Profile & Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotel Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Hotel Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Public Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            {/* Telephone */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Concierge Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
              />
            </div>
            {/* Custom Domain mapping */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Custom Domain Name</label>
                <span className="text-[9px] text-slate-550 font-medium">e.g. yourhotel.com</span>
              </div>
              <input
                type="text"
                name="custom_domain"
                value={formData.custom_domain}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
                placeholder="thpparphuket.com"
              />
            </div>
          </div>
        </div>

        {/* Location & Map block */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 md:p-8 rounded-xl space-y-6">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3">
            Location & Map Embed
          </h3>

          <div className="space-y-5">
            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Physical Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full bg-slate-955 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors resize-none"
                required
              />
            </div>
            
            {/* Google Map URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Google Maps Embed Iframe URL</label>
                <span className="text-[9px] text-slate-500 font-medium">src attribute inside iframe tag</span>
              </div>
              <input
                type="text"
                name="google_map_url"
                value={formData.google_map_url}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs text-slate-300 outline-none focus:border-accent transition-colors"
                placeholder="https://www.google.com/maps/embed?pb=..."
                required
              />
            </div>
          </div>
        </div>

        {/* Social Links block */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 md:p-8 rounded-xl space-y-6">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3">
            Social Media & Communication
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">WhatsApp Link</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-250 placeholder-slate-600 outline-none focus:border-accent transition-colors"
                placeholder="https://wa.me/..."
              />
            </div>
            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Instagram Link</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-255 placeholder-slate-600 outline-none focus:border-accent transition-colors"
                placeholder="https://instagram.com/..."
              />
            </div>
            {/* Facebook */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Facebook Link</label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-250 placeholder-slate-600 outline-none focus:border-accent transition-colors"
                placeholder="https://facebook.com/..."
              />
            </div>
            {/* Twitter */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Twitter Link</label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-250 placeholder-slate-600 outline-none focus:border-accent transition-colors"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>

        {/* Submit Action row */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-4 px-10 rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSaving ? 'Saving Changes...' : 'Save Configuration'}
            <Save className="w-4 h-4" />
          </button>
        </div>

      </form>

      {/* DANGER ZONE */}
      <div className="bg-red-500/5 border border-red-500/20 p-6 md:p-8 rounded-xl space-y-6 mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest">
                Danger Zone
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                ลบโรงแรมนี้ออกจากระบบ แพลตฟอร์มจะลบข้อมูลหน้าแรก ห้องพัก โปรโมชั่น ไฟล์รูปภาพ และสถิติวิเคราะห์ทั้งหมดอย่างถาวรโดยไม่สามารถกู้คืนได้อีก
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirm(true);
              setDeleteConfirmName('');
              setDeleteError(null);
            }}
            className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40 text-red-500 font-bold text-[10px] tracking-wider uppercase py-3.5 px-6 rounded-lg transition-all active:scale-[0.98] whitespace-nowrap"
          >
            Delete Hotel
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL OVERLAY */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full space-y-5 shadow-2xl text-left animate-fade-in text-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-red-100 text-red-650 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                ลบโรงแรมนี้อย่างถาวร?
              </h4>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-650 font-medium">
              <p>
                คุณแน่ใจหรือไม่ว่าต้องการลบโรงแรม <strong className="text-slate-900 font-bold">&ldquo;{formData.name}&rdquo;</strong>? การกระทำนี้ไม่สามารถกู้คืนได้ในภายหลัง
              </p>
              <p className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[11px] leading-normal font-semibold">
                ข้อมูลทั้งหมด เช่น ห้องพัก, สไลด์หน้าแรก, โปรโมชั่น, สถิติการจอง และการตั้งค่าของโรงแรมนี้จะถูกลบออกจากระบบ
              </p>
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  พิมพ์ชื่อโรงแรมเพื่อยืนยันการลบ:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={formData.name}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 font-bold outline-none focus:border-red-500 transition-colors"
                  disabled={isDeleting}
                />
              </div>

              {deleteError && (
                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {deleteError}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg font-bold text-[10px] tracking-wider uppercase transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteHotel}
                disabled={isDeleting || deleteConfirmName !== formData.name}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] tracking-wider uppercase transition-colors flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
