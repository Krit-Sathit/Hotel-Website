import React from 'react';
import Link from 'next/link';
import dns from 'node:dns/promises';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
  LogOut,
  Sparkles,
} from 'lucide-react';
import { getHotelBySlug, getAllHotels } from '@/lib/db/mock-data';
import TenantSelector, {
  ActiveTenantName,
  ActiveWebsiteLink,
} from '@/components/dashboard/tenant-selector';
import SidebarNav from '@/components/dashboard/sidebar-nav';

const PRIMARY_CMS_DOMAIN = 'flowweb.flowhubhotel.com';
let flowwebDnsCache: { ready: boolean; checkedAt: number } = { ready: false, checkedAt: 0 };

async function isFlowwebDomainReady(): Promise<boolean> {
  const now = Date.now();
  const ttl = flowwebDnsCache.ready ? 300_000 : 15_000;
  if (now - flowwebDnsCache.checkedAt < ttl) {
    return flowwebDnsCache.ready;
  }
  try {
    await dns.lookup(PRIMARY_CMS_DOMAIN);
    flowwebDnsCache = { ready: true, checkedAt: now };
    return true;
  } catch {
    flowwebDnsCache = { ready: false, checkedAt: now };
    return false;
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Automatically redirect legacy *.vercel.app URL to flowweb.flowhubhotel.com as soon as DNS is active
  const headerList = await headers();
  const rawHost = (headerList.get('x-forwarded-host') || headerList.get('host') || '').split(',')[0].trim().toLowerCase();
  if (rawHost.endsWith('.vercel.app') && (await isFlowwebDomainReady())) {
    redirect(`https://${PRIMARY_CMS_DOMAIN}/dashboard`);
  }

  // Read active hotel & session from cookies
  const cookieStore = await cookies();
  const authSession = cookieStore.get('auth_session')?.value;
  let activeHotelId = cookieStore.get('active_hotel_id')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'sathit2527@gmail.com';
  const userRole = cookieStore.get('user_role')?.value || (userEmail === 'sathit2527@gmail.com' ? 'super_admin' : 'hotel_admin');

  // Protect Dashboard: redirect to login if session is missing or invalid
  if (!authSession && !activeHotelId) {
    redirect('/auth/login');
  }
  
  if (!activeHotelId || activeHotelId === 'hotel-1784206393534') {
    activeHotelId = 'theparphuket'; // The Par Phuket canonical FlowStay slug
  }

  const [hotel, allHotels] = await Promise.all([
    getHotelBySlug(activeHotelId),
    getAllHotels(),
  ]);
  if (!hotel) {
    // Fallback if not found
    redirect('/auth/login');
  }

  const hotelsList =
    userRole === 'super_admin'
      ? allHotels.map(h => ({ id: h.id, name: h.name, slug: h.slug }))
      : [{ id: hotel.id, name: hotel.name, slug: hotel.slug }];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden dashboard-light-override">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-250/60 flex-shrink-0 relative z-30">
        
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
        <div className="p-4 border-b border-slate-100 space-y-2 relative z-40">
          <TenantSelector currentHotelId={hotel.id} currentHotelName={hotel.name} hotels={hotelsList} />
          {userRole === 'super_admin' && (
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-slate-200 hover:border-accent hover:bg-accent/5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-accent rounded-lg transition-all"
            >
              <span>+ Add Another Hotel</span>
            </Link>
          )}
        </div>

        {/* Sidebar Nav items (instant client active state + bundle prefetcher) */}
        <SidebarNav initialHotel={hotel} />

        {/* Sidebar bottom footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Quick view website link */}
          <ActiveWebsiteLink initialSlug={hotel.slug} />

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
              Active Tenant: <ActiveTenantName initialName={hotel.name} />
            </p>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">
                {userEmail === 'sathit2527@gmail.com' ? 'Sathit' : (userEmail.split('@')[0] || 'Hotel Admin')}
              </p>
              <p className="text-[9px] text-accent uppercase font-bold tracking-wider">
                {userRole === 'super_admin' ? 'Platform Owner' : 'Hotel Manager'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/35 flex items-center justify-center font-bold text-accent text-xs uppercase">
              {userEmail === 'sathit2527@gmail.com' ? 'ST' : userEmail.substring(0, 2)}
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
