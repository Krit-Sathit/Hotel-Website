'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Image as ImageIcon, Save } from 'lucide-react';
import { saveAboutSectionAction } from '@/lib/db/actions';

type AboutContent = {
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  primary_image_url?: string;
  secondary_image_url?: string;
  features?: Array<{ title: string; desc: string }>;
};

const emptyContent: AboutContent = {
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  primary_image_url: '',
  secondary_image_url: '',
  features: [],
};

export default function AboutSectionEditorPage() {
  const [hotelId, setHotelId] = useState('');
  const [content, setContent] = useState<AboutContent>(emptyContent);
  const [media, setMedia] = useState<Array<{ id: string; image_url?: string; url?: string; alt_text?: string; file_name?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/data');
        if (!response.ok) throw new Error('Unable to load the About section.');
        const data = await response.json();
        const about = data.sections?.find((section: { section_type: string }) => section.section_type === 'about');
        setHotelId(data.hotel?.id || '');
        setContent({ ...emptyContent, ...(about?.content || {}) });
        setMedia(data.media || []);
      } catch (error) {
        setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load this section.' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const mediaOptions = useMemo(() => media
    .map(item => ({
      id: item.id,
      url: item.image_url || item.url || '',
      label: item.alt_text || item.file_name || 'Media image',
    }))
    .filter(item => item.url), [media]);

  const update = (field: keyof AboutContent, value: string) => {
    setContent(current => ({ ...current, [field]: value }));
  };

  const save = async () => {
    if (!hotelId || !content.title.trim() || !content.description.trim()) {
      setNotification({ type: 'error', message: 'Please provide a title and description before saving.' });
      return;
    }
    setIsSaving(true);
    setNotification(null);
    const result = await saveAboutSectionAction(hotelId, content);
    setNotification(result.success
      ? { type: 'success', message: 'About Introduction saved. Your website has been updated.' }
      : { type: 'error', message: result.error || 'Unable to save the About Introduction.' });
    setIsSaving(false);
  };

  if (isLoading) return <div className="py-24 text-center text-slate-400 font-medium">Loading About Introduction...</div>;

  return (
    <div className="max-w-5xl space-y-7 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-wide uppercase text-slate-900">Edit About Introduction</h1>
          <p className="mt-1 text-sm text-slate-500">Update the text and the two overlapping images shown on your homepage.</p>
        </div>
        <button onClick={save} disabled={isSaving} className="bg-accent text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save About Section'} <Save className="w-4 h-4" />
        </button>
      </div>

      {notification && <div className={`p-4 rounded-lg flex items-start gap-3 border ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
        {notification.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
        <p className="text-sm">{notification.message}</p>
      </div>}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Badge
            <input value={content.badge || ''} onChange={e => update('badge', e.target.value)} className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800" placeholder="Bespoke Retreat" />
          </label>
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Subtitle
            <input value={content.subtitle || ''} onChange={e => update('subtitle', e.target.value)} className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800" placeholder="Welcome to your hotel" />
          </label>
        </div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Headline title
          <input value={content.title} onChange={e => update('title', e.target.value)} className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800" />
        </label>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description
          <textarea value={content.description} onChange={e => update('description', e.target.value)} rows={5} className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['primary_image_url', 'secondary_image_url'] as const).map((field, index) => (
          <div key={field} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-accent" /><h2 className="font-bold text-slate-900">{index === 0 ? 'Main image' : 'Overlapping image'}</h2></div>
            {content[field] && <img src={content[field]} alt="Selected About section" className="w-full aspect-[4/3] object-cover rounded-lg border border-slate-100" />}
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Choose from Media Library
              <select value={content[field] || ''} onChange={e => update(field, e.target.value)} className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800">
                <option value="">Select an image</option>
                {mediaOptions.map(item => <option key={item.id} value={item.url}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Or paste image URL
              <input value={content[field] || ''} onChange={e => update(field, e.target.value)} className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800" placeholder="https://..." />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
