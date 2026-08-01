'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Building2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Mail, 
  Check, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface UserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'hotel_admin';
  hotel_id: string | null;
  created_at: string;
}

interface HotelItem {
  id: string;
  name: string;
  slug: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'super_admin' | 'hotel_admin'>('hotel_admin');
  const [hotelId, setHotelId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setHotels(data.hotels || []);
        if (data.hotels && data.hotels.length > 0 && !hotelId) {
          setHotelId(data.hotels[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setAlertBanner(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0],
          role,
          hotel_id: role === 'super_admin' ? null : hotelId
        })
      });

      const data = await res.json();
      if (data.success) {
        setAlertBanner({ type: 'success', message: `User "${email}" created successfully!` });
        setEmail('');
        setPassword('');
        setName('');
        setIsModalOpen(false);
        fetchUsersData();
      } else {
        setAlertBanner({ type: 'error', message: data.error || 'Failed to create user' });
      }
    } catch (e) {
      setAlertBanner({ type: 'error', message: 'Network error creating user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (userEmail === 'sathit2527@gmail.com') {
      window.alert('Cannot delete the primary Platform Owner account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete account "${userEmail}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        window.alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      window.alert('Error deleting user');
    }
  };

  const getHotelName = (user: UserAccount) => {
    if (user.role === 'super_admin' || !user.hotel_id) {
      return 'All Hotels (Super Admin Access)';
    }
    const h = hotels.find(item => item.id === user.hotel_id);
    return h ? h.name : user.hotel_id;
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      
      {/* PAGE TITLE & TOP ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              User & Access Management
            </h1>
            <span className="bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-accent/20">
              Super Admin Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create user accounts and set login credentials for each hotel administrator.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-accent hover:opacity-90 text-primary font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Create New Hotel User
        </button>
      </div>

      {/* ALERT BANNERS */}
      {alertBanner && (
        <div className={`p-4 rounded-lg flex items-center justify-between text-xs font-medium ${
          alertBanner.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {alertBanner.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{alertBanner.message}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {/* USER LIST TABLE */}
      <div className="bg-white border border-slate-250/60 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Users className="w-4 h-4 text-accent" />
            Registered Accounts ({users.length})
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-150">
                <tr>
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">Login Email</th>
                  <th className="py-3.5 px-4">Security Password</th>
                  <th className="py-3.5 px-4">Access Scope</th>
                  <th className="py-3.5 px-4">Assigned Hotel</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  const isVisible = showPasswordMap[u.id];
                  const isSuperAdmin = u.role === 'super_admin' || u.email === 'sathit2527@gmail.com';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isSuperAdmin ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.name ? u.name.substring(0, 2).toUpperCase() : u.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{u.name}</p>
                          {isSuperAdmin && <span className="text-[9px] text-accent font-bold uppercase tracking-wider block">Super Admin</span>}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-medium text-slate-700">
                        {u.email}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600">
                        <div className="flex items-center gap-2">
                          <span>{isVisible ? u.password : '••••••••••••'}</span>
                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            title={isVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSuperAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {isSuperAdmin ? 'Super Admin' : 'Hotel Admin'}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          <span>{getHotelName(u)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {u.email !== 'sathit2527@gmail.com' ? (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Primary Account</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 text-accent rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Hotel User</h3>
                  <p className="text-[11px] text-slate-450">Set up login credentials for hotel manager</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* Account Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">Account Name / Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Par Phuket Manager"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Login Email */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">Login Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. manager@theparphuket.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-9 pr-3 outline-none focus:border-accent font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">Security Password</label>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set password for hotel user"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-9 pr-3 outline-none focus:border-accent font-mono"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">Role & Scope</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-accent font-medium cursor-pointer"
                >
                  <option value="hotel_admin">Hotel Admin (Assigned Single Hotel)</option>
                  <option value="super_admin">Super Admin (All Hotels Platform Owner)</option>
                </select>
              </div>

              {/* Assigned Hotel (if hotel_admin) */}
              {role === 'hotel_admin' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">Assigned Hotel Property</label>
                  <select
                    value={hotelId}
                    onChange={(e) => setHotelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-accent font-medium cursor-pointer"
                    required
                  >
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-accent hover:opacity-90 text-primary font-bold uppercase tracking-wider py-3 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
