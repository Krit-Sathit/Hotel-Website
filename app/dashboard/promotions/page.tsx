'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Upload,
  RotateCcw,
} from 'lucide-react';
import {
  savePromotionAction,
  deletePromotionAction,
  restoreHiddenPromotionsAction,
} from '@/lib/db/actions';
import { peekAdminBundle, loadAdminBundle, invalidateAdminCache } from '@/lib/admin-client-cache';
import type { Promotion } from '@/lib/db/mock-data';

async function compressImageToWebP(file: File, maxWidth = 1400, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                resolve(new File([blob], `${base}.webp`, { type: 'image/webp' }));
              } else {
                resolve(file);
              }
            },
            'image/webp',
            quality
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export default function PromotionsManagerPage() {
  const initialCached = peekAdminBundle();
  const [hotelId, setHotelId] = useState(initialCached?.hotel?.id || '');
  const [promotions, setPromotions] = useState<Promotion[]>(initialCached?.promotions || []);
  const [mediaItems, setMediaItems] = useState<any[]>(initialCached?.media || []);
  const [roomsList, setRoomsList] = useState<any[]>(initialCached?.rooms || []);
  const [isLoading, setIsLoading] = useState(!initialCached?.complete);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);

  const libraryPhotos = useMemo(() => {
    const urls: string[] = [];
    const seen = new Set<string>();
    const pushUrl = (u?: string | null) => {
      const clean = (u || '').trim();
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        urls.push(clean);
      }
    };
    for (const m of mediaItems) pushUrl(m?.url || m?.image_url || m?.file_path);
    for (const r of roomsList) {
      if (Array.isArray(r?.gallery)) {
        for (const g of r.gallery) pushUrl(g);
      }
    }
    return urls.slice(0, 24);
  }, [mediaItems, roomsList]);

  const fetchPromotionsList = async () => {
    try {
      invalidateAdminCache(hotelId);
      const data = await loadAdminBundle({ force: true });
      if (data) {
        if (data.hotel?.id) setHotelId(data.hotel.id);
        setPromotions(data.promotions || []);
        if (data.media) setMediaItems(data.media);
        if (data.rooms) setRoomsList(data.rooms);
      }
    } catch (err) {
      console.error('Failed to reload promotions via API:', err);
    }
  };

  useEffect(() => {
    const getActivePromotions = async () => {
      try {
        const cached = peekAdminBundle();
        if (cached?.complete) {
          setHotelId(cached.hotel.id);
          setPromotions(cached.promotions || []);
          setMediaItems(cached.media || []);
          setRoomsList(cached.rooms || []);
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        const data = await loadAdminBundle({ force: true });
        if (data?.hotel) {
          setHotelId(data.hotel.id);
          setPromotions(data.promotions || []);
          setMediaItems(data.media || []);
          setRoomsList(data.rooms || []);
        }
      } catch (err) {
        console.error('Failed to load active promotions via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void getActivePromotions();
    window.addEventListener('active-hotel-changed', getActivePromotions);
    return () => window.removeEventListener('active-hotel-changed', getActivePromotions);
  }, []);

  const openAddModal = () => {
    setEditingPromo({
      id: '',
      title: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      promo_code: '',
      cta_text: 'Book Now',
      cta_link: '#booking',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromo({ ...promo });
    setIsModalOpen(true);
  };

  const handleFieldChange = (field: keyof Promotion, value: any) => {
    if (!editingPromo) return;
    setEditingPromo({
      ...editingPromo,
      [field]: value
    });
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;

    setIsSaving(true);
    setNotification(null);

    if (!editingPromo.title?.trim()) {
      setNotification({ type: 'error', message: 'Campaign title is required.' });
      setIsSaving(false);
      return;
    }

    const result = await savePromotionAction(hotelId, editingPromo as Promotion);

    if (result.success) {
      setNotification({
        type: 'success',
        message: `Campaign "${editingPromo.title}" saved successfully. Offers catalog is updated.`,
      });
      setIsModalOpen(false);
      setEditingPromo(null);
      fetchPromotionsList();
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to save offer details.',
      });
    }
    setIsSaving(false);
  };

  const handleDeletePromo = async (promoId: string, title: string) => {
    setIsDeletingId(promoId);
    setNotification(null);

    const result = await deletePromotionAction(promoId, hotelId, title);

    if (result.success) {
      setConfirmDeleteId(null);
      setPromotions((prev) => prev.filter((p) => p.id !== promoId));
      setNotification({
        type: 'success',
        message: `ลบโปรโมชั่น "${title}" เรียบร้อยแล้ว`,
      });
      await fetchPromotionsList();
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to delete offer.',
      });
    }
    setIsDeletingId(null);
  };

  const handleRestoreFlowStayPromos = async () => {
    if (!hotelId) return;
    setIsSaving(true);
    const result = await restoreHiddenPromotionsAction(hotelId);
    if (result.success) {
      await fetchPromotionsList();
      setNotification({
        type: 'success',
        message: 'ดึงโปรโมชั่นที่ซิงค์จาก FlowStay กลับมาแสดงครบเรียบร้อยแล้ว',
      });
      setTimeout(() => setNotification(null), 4000);
    }
    setIsSaving(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading offers catalog...
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
            Promotions Manager
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage your seasonal marketing campaigns, discount package banners, and booking promo codes.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={handleRestoreFlowStayPromos}
            disabled={isSaving}
            title="ดึงแคมเปญจาก FlowStay ที่เคยลบกลับมาแสดงใหม่"
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 font-bold text-xs tracking-wider uppercase py-3.5 px-4 rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-accent" />
            Sync FlowStay
          </button>

          <button
            onClick={openAddModal}
            className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Special Offer
          </button>
        </div>
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
            <h5 className="text-xs font-bold uppercase tracking-wider">Promotions Manager</h5>
            <p className="text-[11px] leading-relaxed opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* PROMOTIONS LIST GRID */}
      {promotions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promotions.map((promo) => (
            <div 
              key={promo.id}
              className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group"
            >
              {/* Image & Status Row */}
              <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={promo.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'} 
                  alt={promo.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover" 
                />
                
                {/* Status Float */}
                <div className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded border ${
                  promo.is_active 
                    ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {promo.is_active ? 'Active' : 'Inactive'}
                </div>

                {/* Promo Code Float */}
                {promo.promo_code && (
                  <div className="absolute top-3 right-3 bg-black/75 text-accent text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded border border-white/10 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Code: {promo.promo_code}
                  </div>
                )}
              </div>

              {/* Promo details */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white tracking-wide uppercase font-sans">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-slate-455 line-clamp-2 leading-relaxed">
                    {promo.description}
                  </p>
                </div>

                {/* Date range details */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 tracking-wider uppercase font-mono border-t border-b border-slate-850 py-2.5">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{formatDate(promo.start_date)} – {formatDate(promo.end_date)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(promo)}
                    className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-accent" />
                    Edit Campaign
                  </button>

                  {confirmDeleteId === promo.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isDeletingId === promo.id}
                        onClick={() => handleDeletePromo(promo.id, promo.title)}
                        className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        {isDeletingId === promo.id ? 'กำลังลบ...' : 'ยืนยันลบ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(promo.id)}
                      className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 bg-slate-900 border border-slate-800/60 rounded-xl text-center text-slate-450">
          <Tag className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-bold uppercase tracking-wider">No Promotions Registered</p>
          <p className="text-xs text-slate-550 mt-1">
            Click &ldquo;Add Special Offer&rdquo; above to create your first discount campaign.
          </p>
        </div>
      )}

      {/* ADD/EDIT PROMOTIONS MODAL */}
      {isModalOpen && editingPromo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-md font-bold text-white tracking-wider uppercase">
                {editingPromo.id ? 'Edit Marketing Campaign' : 'Create Special Offer'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePromo} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Campaign Title</label>
                  <input
                    type="text"
                    value={editingPromo.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Promo Code */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Discount Coupon Code</label>
                  <input
                    type="text"
                    value={editingPromo.promo_code || ''}
                    onChange={(e) => handleFieldChange('promo_code', e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent uppercase"
                    placeholder="e.g. SUMMER26"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Campaign Description</label>
                  <textarea
                    value={editingPromo.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent resize-none"
                    required
                  />
                </div>

                {/* Campaign Image URL + 1-Click Upload & Media Library Picker */}
                <div className="md:col-span-2 space-y-3 bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Campaign Banner Image (เปลี่ยนรูปโปรโมชั่น)
                    </label>
                    <label className="text-[11px] font-bold text-accent hover:opacity-80 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปใหม่'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          try {
                            const processed = await compressImageToWebP(file);
                            const formData = new FormData();
                            formData.append('file', processed);
                            const res = await fetch('/api/admin/media/upload', {
                              method: 'POST',
                              body: formData,
                            });
                            if (!res.ok) throw new Error('Upload failed');
                            const data = await res.json();
                            if (data?.url) {
                              handleFieldChange('image_url', data.url);
                            }
                          } catch {
                            setNotification({
                              type: 'error',
                              message: 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง',
                            });
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 aspect-[16/9] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      {editingPromo.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editingPromo.image_url}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="sm:col-span-8 space-y-2">
                      <input
                        type="text"
                        value={editingPromo.image_url || ''}
                        onChange={(e) => handleFieldChange('image_url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                        required
                      />
                      {libraryPhotos.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            หรือคลิกเลือกจากคลังรูปภาพของโรงแรม:
                          </span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {libraryPhotos.map((url, idx) => (
                              <button
                                key={`${url}-${idx}`}
                                type="button"
                                onClick={() => handleFieldChange('image_url', url)}
                                className={`w-16 h-11 rounded overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                                  editingPromo.image_url === url
                                    ? 'border-accent scale-105'
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt=""
                                  className="w-full h-full object-cover pointer-events-none"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block mb-1">Campaign Status</label>
                  <select
                    value={editingPromo.is_active ? 'true' : 'false'}
                    onChange={(e) => handleFieldChange('is_active', e.target.value === 'true')}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="true">Active & Visible on Site</option>
                    <option value="false">Inactive / Draft</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Campaign Start Date</label>
                  <input
                    type="date"
                    value={editingPromo.start_date || ''}
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent [color-scheme:dark]"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Campaign End Date</label>
                  <input
                    type="date"
                    value={editingPromo.end_date || ''}
                    onChange={(e) => handleFieldChange('end_date', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent [color-scheme:dark]"
                    required
                  />
                </div>

                {/* CTA Text */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingPromo.cta_text || ''}
                    onChange={(e) => handleFieldChange('cta_text', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* CTA Link */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">CTA Redirect Link</label>
                  <input
                    type="text"
                    value={editingPromo.cta_link || ''}
                    onChange={(e) => handleFieldChange('cta_link', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 bg-accent hover:opacity-90 text-primary font-bold text-xs uppercase tracking-wider rounded shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Publish Offer'}
                  <Save className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
