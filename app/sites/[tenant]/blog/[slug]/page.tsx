import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react';
import { getHotelBySlug, getBlogPostBySlug, trackAnalyticsEvent } from '@/lib/db/mock-data';

interface BlogPostDetailPageProps {
  params: Promise<{ tenant: string; slug: string }>;
}

export default async function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const { tenant, slug } = await params;
  const hotel = getHotelBySlug(tenant);

  if (!hotel || hotel.status !== 'active') {
    notFound();
  }

  const post = getBlogPostBySlug(hotel.id, slug);
  if (!post) {
    notFound();
  }

  // Track blog post view analytics on the server
  trackAnalyticsEvent(hotel.id, 'page_view', `/blog/${slug}`);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <article className="w-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* BACK BUTTON */}
        <div className="text-left">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Journal
          </Link>
        </div>

        {/* METADATA & HEADER */}
        <div className="space-y-4 text-left">
          
          <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-accent" />
              By Guest Relations
            </span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-1 bg-accent/5 px-2.5 py-1 rounded text-accent">
              <Tag className="w-3 h-3 flex-shrink-0 mr-1" />
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-light tracking-wide text-primary font-hotel leading-tight capitalize">
            {post.title}
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 italic font-light leading-relaxed max-w-3xl border-l-2 border-accent/60 pl-4 py-1">
            {post.excerpt}
          </p>
        </div>

        {/* LARGE FEATURED IMAGE */}
        {post.featured_image && (
          <div className="w-full aspect-[21/9] rounded-hotel overflow-hidden shadow-md bg-slate-100 border border-slate-200/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <div 
          className="text-left text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 pt-4 space-y-6 max-w-3xl font-light"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* FOOTER AUTHOR SIGN-OFF */}
        <div className="max-w-3xl pt-10 border-t border-slate-100 dark:border-slate-900 text-left flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center font-bold text-accent text-sm">
            GR
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold tracking-wider uppercase text-primary font-sans">Guest Relations Editorial</h4>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Curating stories of wellness, design, and local culture for {hotel.name}.
            </p>
          </div>
        </div>

      </div>
    </article>
  );
}
