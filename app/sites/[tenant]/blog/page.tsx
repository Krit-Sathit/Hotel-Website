import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ChevronRight, BookOpen } from 'lucide-react';
import { getHotelBySlug, getBlogPosts, trackAnalyticsEvent } from '@/lib/db/mock-data';

interface BlogPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { tenant } = await params;
  const hotel = getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  // Track page view for blog listing
  trackAnalyticsEvent(hotel.id, 'page_view', '/blog');

  const posts = getBlogPosts(hotel.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="w-full py-16 md:py-24 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 px-6">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-accent">
            Resort Journal
          </p>
          <h1 className="text-3xl md:text-5xl font-light tracking-wide font-hotel capitalize">
            Our Stories & Insights
          </h1>
          <div className="w-12 h-[1px] bg-accent/60 mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immerse yourself in local recommendations, wellness insights, and culinary secrets curated by our specialists.
          </p>
        </div>

        {/* ARTICLES GRID */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white dark:bg-slate-950 rounded-hotel overflow-hidden shadow-sm hover:shadow-md border border-slate-150/45 dark:border-slate-900 transition-all duration-300 flex flex-col group"
              >
                {/* Featured Image */}
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-slate-150 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={post.featured_image || 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=800&q=80'} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  />
                  
                  {/* Category Floating Badge */}
                  <div className="absolute top-4 left-4 bg-primary/90 text-white/90 text-[9px] tracking-widest font-bold uppercase px-3 py-1.5 backdrop-blur-sm rounded">
                    {post.category}
                  </div>
                </Link>

                {/* Body details */}
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-6 text-left">
                  <div className="space-y-3">
                    
                    {/* Publication Date */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold tracking-wide text-primary font-hotel leading-snug group-hover:text-accent transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Read More Link */}
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-900">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase text-accent hover:underline group/btn"
                    >
                      Read Article
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

              </article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-slate-450">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg">No articles published yet.</p>
            <p className="text-xs mt-1">Please check back soon for stories and lifestyle guides.</p>
          </div>
        )}

      </div>
    </section>
  );
}
