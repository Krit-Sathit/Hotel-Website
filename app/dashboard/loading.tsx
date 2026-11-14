import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl space-y-6 animate-pulse text-left">
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="h-6 w-56 bg-slate-200 rounded-md" />
        <div className="h-3.5 w-80 bg-slate-100 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="h-28 bg-white border border-slate-200/70 rounded-xl" />
        <div className="h-28 bg-white border border-slate-200/70 rounded-xl" />
        <div className="h-28 bg-white border border-slate-200/70 rounded-xl" />
        <div className="h-28 bg-white border border-slate-200/70 rounded-xl" />
      </div>
      <div className="h-64 bg-white border border-slate-200/70 rounded-xl" />
    </div>
  );
}
