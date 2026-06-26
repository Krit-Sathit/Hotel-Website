import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
  BarChart3, 
  Settings, 
  Palette, 
  Layers, 
  Image as ImageIcon, 
  CalendarRange, 
  Hotel as HotelIcon, 
  Grid,
  ExternalLink, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { getHotelBySlug, getAllHotels } from '@/lib/db/mock-data';
import TenantSelector from '@/components/dashboard/tenant-selector';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Read active hotel from cookie, default to hotel-a
  const cookieStore = await cookies();
  let activeHotelId = cookieStore.get('active_hotel_id')?.value;
  
  if (!activeHotelId) {
    activeHotelId = '11111111-1111-1111-1111-111111111111'; // Hotel A ID
  }

  const hotel = getHotelBySlug(activeHotelId);
  if (!hotel) {
    // Fallback if not found
    redirect('/auth/login');
  }

  const hotelsList = getAllHotels().map(h => ({ id: h.id, name: h.name }));

  // Sidebar navigation menu items
  const menuItems = [
    { label: 'Analytics Overview', href: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'General Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
    { label: 'Design & Theme', href: '/dashboard/theme', icon: <Palette className="w-4 h-4" /> },
    { label: 'Homepage Builder', href: '/dashboard/builder', icon: <Grid className="w-4 h-4" /> },
    { label: 'Hero Slides', href: '/dashboard/hero', icon: <Layers className="w-4 h-4" /> },
    { label: 'Rooms Manager', href: '/dashboard/rooms', icon: <HotelIcon className="w-4 h-4" /> },
    { label: 'Promotions Manager', href: '/dashboard/promotions', icon: <CalendarRange className="w-4 h-4" /> },
    { label: 'Media Library', href: '/dashboard/media', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  // Map public website URL based on local port
  const publicUrl = `http://${hotel.slug}.localhost:3000`;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden dashboard-light-override">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-250/60 flex-shrink-0">
        
        {/* Branding header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-2.5">
          <div className="p-1.5 bg-accent/20 border border-accent/30 rounded-lg text-accent">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold tracking-widest uppercase text-slate-900">FlowStay</span>
            <span className="text-[9px] tracking-widest font-semibold uppercase text-accent block -mt-0.5">
              Hotel CMS Suite
            </span>
          </div>
        </div>

        {/* Dynamic Tenant Selector Dropdown */}
        <div className="p-4 border-b border-slate-100 space-y-2">
          <TenantSelector currentHotelId={hotel.id} currentHotelName={hotel.name} hotels={hotelsList} />
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-slate-200 hover:border-accent hover:bg-accent/5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-accent rounded-lg transition-all"
          >
            <span>+ Add Another Hotel</span>
          </Link>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto text-left">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar bottom footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Quick view website link */}
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold tracking-wider text-accent uppercase transition-colors"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Logout mock link */}
          <Link
            href="/auth/login"
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-500/5 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Link>
        </div>

      </aside>

      {/* MAIN PANEL VIEWPORT */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50">
        
        {/* TOP DASHBOARD HEADER */}
        <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0">
          <div className="text-left">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-sans">
              CMS Dashboard
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Active Tenant: <span className="text-accent font-bold">{hotel.name}</span>
            </p>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">Alex Mercer</p>
              <p className="text-[9px] text-accent uppercase font-bold tracking-wider">Hotel Owner</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/35 flex items-center justify-center font-bold text-accent text-xs">
              AM
            </div>
          </div>
        </header>

        {/* CONTAINER FOR CHILDREN ROUTE VIEWS */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
