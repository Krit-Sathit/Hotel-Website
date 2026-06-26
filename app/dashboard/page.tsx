import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Eye, MousePointer, Percent, Flame, Layers } from 'lucide-react';
import { getHotelBySlug, getAnalyticsOverview } from '@/lib/db/mock-data';

export default async function DashboardPage() {
  // Retrieve the active hotel from the cookies
  const cookieStore = await cookies();
  let activeHotelId = cookieStore.get('active_hotel_id')?.value;
  
  if (!activeHotelId) {
    activeHotelId = '11111111-1111-1111-1111-111111111111'; // Hotel A ID
  }

  const hotel = getHotelBySlug(activeHotelId);
  if (!hotel) {
    redirect('/auth/login');
  }

  // Fetch compiled analytics for the active hotel
  const analytics = getAnalyticsOverview(hotel.id);

  // Helper to draw clean SVG charts dynamically
  const getMaxChartValue = (chartData: Array<{ value: number }>) => {
    const max = Math.max(...chartData.map(d => d.value), 10);
    return Math.ceil(max / 10) * 10;
  };

  const viewsMax = getMaxChartValue(analytics.viewsChart);
  const clicksMax = getMaxChartValue(analytics.clicksChart);

  // Generate SVG path for line chart
  const getSvgPath = (chartData: Array<{ value: number }>, width: number, height: number, maxValue: number) => {
    if (chartData.length === 0) return '';
    const xStep = width / (chartData.length - 1);
    return chartData.map((d, i) => {
      const x = i * xStep;
      const y = height - (d.value / maxValue) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const svgViewsPath = getSvgPath(analytics.viewsChart, 500, 150, viewsMax);
  const svgClicksPath = getSvgPath(analytics.clicksChart, 500, 150, clicksMax);

  return (
    <div className="space-y-8 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-wide uppercase">
            Analytics Overview
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Performance dashboard for <span className="text-accent font-semibold">{hotel.name}</span> over the last 7 days.
          </p>
        </div>
        <div className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded uppercase tracking-widest">
          Live Data
        </div>
      </div>

      {/* METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Views */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Page Views</span>
            <div className="p-2 bg-blue-50/10 text-blue-600 rounded-lg border border-blue-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">{analytics.totalViews}</h3>
            <p className="text-[10px] text-green-600 font-semibold">↑ 12.4% vs last week</p>
          </div>
        </div>

        {/* Booking Clicks */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booking Clicks</span>
            <div className="p-2 bg-emerald-50/10 text-emerald-600 rounded-lg border border-emerald-100">
              <MousePointer className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">{analytics.totalClicks}</h3>
            <p className="text-[10px] text-green-600 font-semibold">↑ 8.2% vs last week</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conversion Rate</span>
            <div className="p-2 bg-accent/10 text-accent rounded-lg border border-accent/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">{analytics.conversionRate}%</h3>
            <p className="text-[10px] text-slate-550 font-medium">Clicks / Unique Views</p>
          </div>
        </div>

        {/* Widget Usage */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Widget Engagement</span>
            <div className="p-2 bg-purple-50/10 text-purple-600 rounded-lg border border-purple-100">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">{analytics.totalWidgetUse}</h3>
            <p className="text-[10px] text-green-600 font-semibold">↑ 15.1% widget usage</p>
          </div>
        </div>

      </div>

      {/* CHARTS GRID (Dependency-free SVG line charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Page Views Chart */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Weekly Page Views</h4>
            <span className="text-[10px] text-slate-500">Peak: {viewsMax} views</span>
          </div>
          <div className="relative h-40 w-full pt-4">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="500" y2="0" className="stroke-slate-200/50 stroke-1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" className="stroke-slate-200/50 stroke-1" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" className="stroke-slate-200 stroke-1" />
              
              {/* Chart Line */}
              <path
                d={svgViewsPath}
                fill="none"
                className="stroke-blue-500 stroke-2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2">
            {analytics.viewsChart.map(d => <span key={d.date}>{d.date}</span>)}
          </div>
        </div>

        {/* Booking Clicks Chart */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Weekly Booking Clicks</h4>
            <span className="text-[10px] text-slate-500">Peak: {clicksMax} clicks</span>
          </div>
          <div className="relative h-40 w-full pt-4">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="500" y2="0" className="stroke-slate-200/50 stroke-1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" className="stroke-slate-200/50 stroke-1" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" className="stroke-slate-200 stroke-1" />
              
              {/* Chart Line */}
              <path
                d={svgClicksPath}
                fill="none"
                className="stroke-emerald-500 stroke-2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2">
            {analytics.clicksChart.map(d => <span key={d.date}>{d.date}</span>)}
          </div>
        </div>

      </div>

      {/* DETAILED STATS (Popular Pages & Rooms) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Top Pages */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            Top Visited Pages
          </h4>
          <div className="space-y-3">
            {analytics.topPages.map((page, i) => (
              <div key={page.path} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold font-mono">0{i + 1}</span>
                  <span className="font-semibold text-slate-700 font-mono">{page.path}</span>
                </div>
                <span className="text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded text-[10px] border border-slate-100">
                  {page.count} views
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Rooms */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-xl space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            Popular Room Types
          </h4>
          <div className="space-y-3">
            {hotel.slug === 'hotel-a' ? (
              <>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Oceanfront King Suite</span>
                  <span className="text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded text-[10px] border border-slate-100">68% share</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Horizon Two-Bedroom Villa</span>
                  <span className="text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded text-[10px] border border-slate-100">32% share</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Soho Loft Studio</span>
                <span className="text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded text-[10px] border border-slate-100">100% share</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
