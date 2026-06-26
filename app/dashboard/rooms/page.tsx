'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Hotel as HotelIcon, Save, X, BedDouble, Users, Maximize2, CheckCircle, AlertCircle } from 'lucide-react';
import { saveRoomAction, deleteRoomAction } from '@/lib/db/actions';
import type { Room } from '@/lib/db/mock-data';

export default function RoomsManagerPage() {
  const [hotelId, setHotelId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);

  // Available amenities presets
  const amenitiesPreset = [
    'Free Wi-Fi', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'City View',
    'Private Terrace', 'Soaking Tub', 'Nespresso Machine', '24h Room Service',
    'Private Plunge Pool', 'Butler Service', 'Kitchenette', 'Marshall Speaker'
  ];

  const fetchRoomsList = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error('Failed to reload rooms via API:', err);
    }
  };

  useEffect(() => {
    const getActiveRooms = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        if (hotel) {
          setHotelId(hotel.id);
          setRooms(data.rooms || []);
        }
      } catch (err) {
        console.error('Failed to load active rooms via API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getActiveRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom({
      id: '',
      name: '',
      description: '',
      gallery: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      amenities: ['Free Wi-Fi', 'Air Conditioning'],
      max_guests: 2,
      room_size: 30,
      bed_type: 'King Bed',
      price: 350,
      sort_order: rooms.length
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom({ ...room });
    setIsModalOpen(true);
  };

  const handleFieldChange = (field: keyof Room, value: any) => {
    if (!editingRoom) return;
    setEditingRoom({
      ...editingRoom,
      [field]: value
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    if (!editingRoom || !editingRoom.amenities) return;
    const current = editingRoom.amenities;
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    
    handleFieldChange('amenities', updated);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    
    setIsSaving(true);
    setNotification(null);

    // Validate fields
    if (!editingRoom.name?.trim()) {
      setNotification({ type: 'error', message: 'Room name is required.' });
      setIsSaving(false);
      return;
    }

    const result = await saveRoomAction(hotelId, editingRoom as Room);

    if (result.success) {
      setNotification({
        type: 'success',
        message: `Suite "${editingRoom.name}" saved successfully. Room catalog is updated.`,
      });
      setIsModalOpen(false);
      setEditingRoom(null);
      fetchRoomsList();
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to save suite details.',
      });
    }
    setIsSaving(false);
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!confirm(`Are you sure you want to delete the suite "${roomName}"?`)) return;

    const result = await deleteRoomAction(roomId);

    if (result.success) {
      setNotification({
        type: 'success',
        message: `Suite "${roomName}" deleted successfully.`,
      });
      fetchRoomsList();
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to delete suite.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading rooms catalog...
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
            Rooms Manager
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage your accommodations, details, pricing structures, and amenities listings.
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add New Suite
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
            <h5 className="text-xs font-bold uppercase tracking-wider">Rooms Manager</h5>
            <p className="text-[11px] leading-relaxed opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* ROOMS GRID LIST */}
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id}
              className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group"
            >
              {/* Image & Price row */}
              <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={room.gallery[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'} 
                  alt={room.name} 
                  className="w-full h-full object-cover" 
                />
                {room.price && (
                  <div className="absolute top-3 right-3 bg-black/75 text-accent text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded border border-white/10">
                    ${room.price} / Night
                  </div>
                )}
              </div>

              {/* Room details */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white tracking-wide uppercase font-sans">
                    {room.name}
                  </h3>
                  <p className="text-xs text-slate-455 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                {/* Specs row */}
                <div className="flex justify-between items-center border-t border-b border-slate-850 py-2.5 text-[10px] text-slate-450 tracking-wider font-mono">
                  <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-accent" /> {room.room_size} m²</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-accent" /> Max {room.max_guests}</span>
                  <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-accent" /> {room.bed_type}</span>
                </div>

                {/* Edit Actions row */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    onClick={() => openEditModal(room)}
                    className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-accent" />
                    Edit Details
                  </button>
                  
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.name)}
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
          <HotelIcon className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-bounce" />
          <p className="text-sm font-bold uppercase tracking-wider">No Suites Registered</p>
          <p className="text-xs text-slate-550 mt-1">
            Click &ldquo;Add New Suite&rdquo; above to catalog your first accommodation offering.
          </p>
        </div>
      )}

      {/* ADD/EDIT MODAL FORM */}
      {isModalOpen && editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-md font-bold text-white tracking-wider uppercase">
                {editingRoom.id ? 'Edit Suite Accommodations' : 'Add New Accommodation'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRoom} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Room Name */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Suite Name</label>
                  <input
                    type="text"
                    value={editingRoom.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Starting Price ($ / Night)</label>
                  <input
                    type="number"
                    value={editingRoom.price || ''}
                    onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Marketing Description</label>
                  <textarea
                    value={editingRoom.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent resize-none"
                    required
                  />
                </div>

                {/* Size (sqm) */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Room Size (Square Meters)</label>
                  <input
                    type="number"
                    value={editingRoom.room_size || ''}
                    onChange={(e) => handleFieldChange('room_size', parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Max Guests */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Maximum Guest Capacity</label>
                  <input
                    type="number"
                    value={editingRoom.max_guests || ''}
                    onChange={(e) => handleFieldChange('max_guests', parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Bed Type */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Bed Configuration</label>
                  <input
                    type="text"
                    value={editingRoom.bed_type || ''}
                    onChange={(e) => handleFieldChange('bed_type', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Gallery Primary Image */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Featured Image URL</label>
                  <input
                    type="text"
                    value={editingRoom.gallery?.[0] || ''}
                    onChange={(e) => {
                      const gallery = [...(editingRoom.gallery || [])];
                      gallery[0] = e.target.value;
                      handleFieldChange('gallery', gallery);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                  />
                </div>

              </div>

              {/* Amenities checkboxes */}
              <div className="space-y-3">
                <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block border-b border-slate-800 pb-2">
                  Select Suite Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesPreset.map((amenity) => {
                    const isChecked = editingRoom.amenities?.includes(amenity) || false;
                    return (
                      <label 
                        key={amenity} 
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-primary/50 border-accent/40 text-accent' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="hidden"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
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
                  {isSaving ? 'Saving...' : 'Save Suite'}
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
