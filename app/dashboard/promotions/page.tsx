'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Calendar, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { savePromotionAction, deletePromotionAction } from '@/lib/db/actions';
import type { Promotion } from '@/lib/db/mock-data';

export default function PromotionsManagerPage() {
  const [hotelId, setHotelId] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);

  const fetchPromotionsList = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPromotions(data.promotions || []);
    } catch (err) {
      console.error('Failed to reload promotions via API:', err);
    }
  };

  useEffect(() => {
    const getActivePromotions = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        if (hotel) {
          setHotelId(hotel.id);
          setPromotions(data.promotions || []);
        }
      } catch (err) {
        console.error('Failed to load active promotions via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getActivePromotions();
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
    if (!confirm(`Are you sure you want to delete the offer "${title}"?`)) return;

    const result = await deletePromotionAction(promoId);

    if (result.success) {
      setNotification({
        type: 'success',
        message: `Campaign "${title}" deleted successfully.`,
      });
      fetchPromotionsList();
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to delete offer.',
      });
    }
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
        
        <button
          onClick={openAddModal}
          className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Special Offer
        </button>
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
                    onClick={() => openEditModal(promo)}
                    className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-accent" />
                    Edit Campaign
                  </button>
                  
                  <button
                    onClick={() => handleDeletePromo(promo.id, promo.title)}
                    className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
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

                {/* Campaign Image URL */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Campaign Banner Image URL</label>
                  <input
                    type="text"
                    value={editingPromo.image_url || ''}
                    onChange={(e) => handleFieldChange('image_url', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Active Toggle */}
                <div className="space-y-1">
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
