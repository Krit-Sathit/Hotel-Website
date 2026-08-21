export default function TenantSiteLoading() {
  return (
    <div className="animate-pulse bg-hotel-bg px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="mx-auto h-10 w-64 rounded bg-slate-200/70" />
        <div className="mx-auto h-4 w-40 rounded bg-accent/20" />
        <div className="flex justify-center gap-3">
          <div className="h-10 w-20 rounded-lg bg-slate-200/70" />
          <div className="h-10 w-24 rounded-lg bg-slate-200/70" />
          <div className="h-10 w-20 rounded-lg bg-slate-200/70" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-hotel border border-slate-200/60 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-slate-200/80" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 rounded bg-slate-200/80" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
