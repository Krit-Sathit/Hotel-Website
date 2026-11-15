'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { saveAboutSectionAction } from '@/lib/db/actions';
import {
  peekAdminBundle,
  loadAdminBundle,
  invalidateAdminCache,
} from '@/lib/admin-client-cache';

type FeatureItem = {
  title: string;
  desc: string;
  image_url?: string;
};

type AboutContent = {
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  story2_title?: string;
  story2_description?: string;
  primary_image_url?: string;
  secondary_image_url?: string;
  features?: FeatureItem[];
};

const emptyContent: AboutContent = {
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  story2_title: '',
  story2_description: '',
  primary_image_url: '',
  secondary_image_url: '',
  features: [],
};

async function compressImageToWebP(
  file: File,
  maxWidth = 1400,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const base =
                file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              resolve(
                new File([blob], `${base}.webp`, { type: 'image/webp' })
              );
            },
            'image/webp',
            quality
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

function extractPhotoPool(bundle: any): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  const add = (raw?: string) => {
    const u = (raw || '').trim();
    if (u && !seen.has(u) && list.length < 36) {
      seen.add(u);
      list.push(u);
    }
  };
  for (const m of bundle?.media || []) add(m.image_url || m.url);
  for (const s of bundle?.slides || []) add(s.image_url);
  for (const r of bundle?.rooms || []) {
    for (const img of r.gallery || []) add(img);
  }
  return list;
}

export default function AboutSectionEditorPage() {
  const initialCached = peekAdminBundle();
  const initialAbout = initialCached?.sections?.find(
    (s: { section_type: string }) => s.section_type === 'about'
  );
  const [hotelId, setHotelId] = useState(initialCached?.hotel?.id || '');
  const [hotelName, setHotelName] = useState(initialCached?.hotel?.name || '');
  const [content, setContent] = useState<AboutContent>({
    ...emptyContent,
    ...(initialAbout?.content || {}),
  });
  const [photoPool, setPhotoPool] = useState<string[]>(
    initialCached ? extractPhotoPool(initialCached) : []
  );
  const [isLoading, setIsLoading] = useState(!initialCached?.complete);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const hydrateFromBundle = (data: any) => {
      const about = data?.sections?.find(
        (section: { section_type: string }) => section.section_type === 'about'
      );
      const hName = data?.hotel?.name || '';
      setHotelId(data?.hotel?.id || '');
      setHotelName(hName);
      setContent({
        ...emptyContent,
        title: about?.content?.title || `Welcome to ${hName}`,
        subtitle: about?.content?.subtitle || hName,
        badge: about?.content?.badge || 'Official Hotel Website',
        description:
          about?.content?.description ||
          `Welcome to ${hName}. Experience warm hospitality, thoughtfully designed accommodations, and effortless comfort. Book directly on our official website for exclusive direct rates and privileges.`,
        story2_title:
          about?.content?.story2_title || `Plan Your Stay at ${hName}`,
        story2_description:
          about?.content?.story2_description ||
          `Experience personalized comfort, peaceful surroundings, and attentive service throughout your stay at ${hName}.`,
        primary_image_url: about?.content?.primary_image_url || '',
        secondary_image_url: about?.content?.secondary_image_url || '',
        features: Array.isArray(about?.content?.features)
          ? about.content.features
          : [],
      });
      setPhotoPool(extractPhotoPool(data));
    };

    const load = async () => {
      try {
        const cached = peekAdminBundle();
        if (cached?.complete) {
          hydrateFromBundle(cached);
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        const data = await loadAdminBundle();
        if (!data) throw new Error('Unable to load the About & Story section.');
        hydrateFromBundle(data);
      } catch (error) {
        setNotification({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to load this section.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    window.addEventListener('active-hotel-changed', load);
    return () => window.removeEventListener('active-hotel-changed', load);
  }, []);

  const defaultPreviewPrimary = useMemo(
    () => content.primary_image_url || photoPool[1] || photoPool[0] || '',
    [content.primary_image_url, photoPool]
  );

  const defaultPreviewSecondary = useMemo(
    () => content.secondary_image_url || photoPool[2] || photoPool[0] || '',
    [content.secondary_image_url, photoPool]
  );

  const update = <K extends keyof AboutContent>(
    field: K,
    value: AboutContent[K]
  ) => {
    setContent((current) => ({ ...current, [field]: value }));
  };

  const handleUploadImage = async (
    file: File | undefined,
    onUrlReady: (url: string) => void,
    targetKey: string
  ) => {
    if (!file || !hotelId) return;
    setUploadingTarget(targetKey);
    try {
      const compressed = await compressImageToWebP(file);
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('hotelId', hotelId);
      formData.append('category', 'About Story');
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json?.media?.image_url) {
        throw new Error(json?.error || 'Upload failed');
      }
      const newUrl = json.media.image_url as string;
      onUrlReady(newUrl);
      setPhotoPool((prev) => [newUrl, ...prev.filter((u) => u !== newUrl)]);
      invalidateAdminCache(hotelId);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง',
      });
    } finally {
      setUploadingTarget(null);
    }
  };

  const addFeatureCard = () => {
    const current = content.features || [];
    if (current.length >= 4) return;
    update('features', [
      ...current,
      {
        title: '',
        desc: '',
        image_url: photoPool[(current.length + 3) % Math.max(photoPool.length, 1)] || '',
      },
    ]);
  };

  const updateFeatureCard = (
    idx: number,
    patch: Partial<FeatureItem>
  ) => {
    const next = [...(content.features || [])];
    next[idx] = { ...next[idx], ...patch };
    update('features', next);
  };

  const removeFeatureCard = (idx: number) => {
    update(
      'features',
      (content.features || []).filter((_, i) => i !== idx)
    );
  };

  const save = async () => {
    if (!hotelId || !content.title.trim() || !content.description.trim()) {
      setNotification({
        type: 'error',
        message: 'กรุณากรอกหัวข้อหลัก (Headline) และรายละเอียดเนื้อหา (Description) ก่อนกด Save',
      });
      return;
    }
    setIsSaving(true);
    setNotification(null);
    const cleanedFeatures = (content.features || []).filter(
      (f) => f.title.trim() || f.desc.trim()
    );
    const result = await saveAboutSectionAction(hotelId, {
      ...content,
      features: cleanedFeatures,
    });
    if (result.success) {
      invalidateAdminCache(hotelId);
      setNotification({
        type: 'success',
        message: 'บันทึกเนื้อหาและรูปภาพหน้าแรกเรียบร้อยแล้ว แสดงผลบนเว็บไซต์จริงทันทีครับ',
      });
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'ไม่สามารถบันทึกข้อมูลได้',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading About &amp; Story Editor...
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-7 text-left pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide uppercase text-slate-900">
            About &amp; Homepage Story Text
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            แก้ไขข้อความแนะนำโรงแรม ย่อหน้าเรื่องราว และเลือกรูปจริงของโรงแรม ({hotelName || 'Active Hotel'}) ได้ทั้งหมดในหน้านี้
          </p>
        </div>
        <button
          onClick={save}
          disabled={isSaving}
          className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save Story & Photos'}
          <Save className="w-4 h-4" />
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{notification.message}</p>
        </div>
      )}

      {/* SECTION 1: MAIN STORY TEXT */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            1. ข้อความแนะนำโรงแรมส่วนหลัก (Main Hotel Story)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            แสดงในกรอบเรื่องราวแรกและแบนเนอร์หน้าแรก สามารถขึ้นบรรทัดใหม่ (Enter) เพื่อแบ่งหลายย่อหน้าได้ตามต้องการ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            Badge (ข้อความกำกับด้านบน)
            <input
              value={content.badge || ''}
              onChange={(e) => update('badge', e.target.value)}
              className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800"
              placeholder="Official Hotel Website"
            />
          </label>
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            Subtitle / Caption รูปหลัก
            <input
              value={content.subtitle || ''}
              onChange={(e) => update('subtitle', e.target.value)}
              className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800"
              placeholder={`Welcome to ${hotelName}`}
            />
          </label>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          หัวข้อหลัก (Main Headline)
          <input
            value={content.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800"
            placeholder={`Welcome to ${hotelName}`}
          />
        </label>

        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          เนื้อหาแนะนำโรงแรม (กด Enter ขึ้นบรรทัดใหม่เพื่อแบ่งย่อหน้าได้)
          <textarea
            value={content.description}
            onChange={(e) => update('description', e.target.value)}
            rows={6}
            className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800 leading-relaxed"
            placeholder="เขียนบรรยายจุดเด่น บรรยากาศ ทำเลที่ตั้งจริงของโรงแรม (เช่น ใกล้สนามกอล์ฟ ภูเขา ตัวเมือง หรือชายหาด)..."
          />
        </label>
      </div>

      {/* SECTION 2: SECONDARY STORY BOX */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            2. กรอบเนื้อหาส่วนที่สอง (Secondary Story Box)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            แสดงในกรอบสีเทาอ่อนถัดลงมา (เช่น แนะนำการเดินทาง จุดเด่นรอบโรงแรม หรือสิ่งอำนวยความสะดวก)
          </p>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          หัวข้อกรอบที่สอง (Secondary Headline)
          <input
            value={content.story2_title || ''}
            onChange={(e) => update('story2_title', e.target.value)}
            className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800"
            placeholder={`Plan Your Stay at ${hotelName}`}
          />
        </label>

        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          เนื้อหากรอบที่สอง (Secondary Description)
          <textarea
            value={content.story2_description || ''}
            onChange={(e) => update('story2_description', e.target.value)}
            rows={4}
            className="w-full mt-1.5 rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case text-slate-800 leading-relaxed"
            placeholder="รายละเอียดจุดเด่นบริเวณใกล้เคียง การเดินทาง หรือบริการพิเศษของโรงแรม..."
          />
        </label>
      </div>

      {/* SECTION 3: TWO AUTHENTIC HOTEL PHOTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(
          [
            {
              field: 'primary_image_url' as const,
              title: 'รูปประกอบกรอบที่ 1 (Main Story Photo)',
              preview: defaultPreviewPrimary,
            },
            {
              field: 'secondary_image_url' as const,
              title: 'รูปประกอบกรอบที่ 2 (Secondary Story Photo)',
              preview: defaultPreviewSecondary,
            },
          ] as const
        ).map(({ field, title, preview }) => (
          <div
            key={field}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-bold text-slate-900">{title}</h2>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                {uploadingTarget === field ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปใหม่'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingTarget === field}
                  onChange={(e) =>
                    handleUploadImage(
                      e.target.files?.[0],
                      (url) => update(field, url),
                      field
                    )
                  }
                />
              </label>
            </div>

            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={title}
                className="w-full aspect-[4/3] object-cover rounded-lg border border-slate-100 bg-slate-100"
              />
            )}

            {photoPool.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  คลิกเลือกรูปจริงจากคลังภาพโรงแรม:
                </span>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                  {photoPool.map((url, i) => {
                    const selected = (content[field] || preview) === url;
                    return (
                      <button
                        key={`${url}-${i}`}
                        type="button"
                        onClick={() => update(field, url)}
                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                          selected
                            ? 'border-accent ring-2 ring-accent/30'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              หรือวางลิงก์รูปภาพ (Image URL)
              <input
                value={content[field] || ''}
                onChange={(e) => update(field, e.target.value)}
                className="w-full mt-1 rounded-lg border border-slate-200 p-2.5 text-xs font-normal normal-case text-slate-800"
                placeholder="เว้นว่างไว้เพื่อใช้รูปโรงแรมอัตโนมัติ หรือวาง https://..."
              />
            </label>
          </div>
        ))}
      </div>

      {/* SECTION 4: OPTIONAL 4 SHOWCASE / HIGHLIGHT CARDS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. การ์ดจุดเด่น / ภาพโชว์ 4 ช่อง (Highlight &amp; Showcase Tiles)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ปรับแต่งหัวข้อ คำอธิบาย และรูปภาพของการ์ดโชว์จุดเด่นสูงสุด 4 ช่องบนหน้าแรก (หากไม่เพิ่ม ระบบจะดึงจุดเด่นอัตโนมัติ)
            </p>
          </div>
          {(content.features?.length || 0) < 4 && (
            <button
              type="button"
              onClick={addFeatureCard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มการ์ดจุดเด่น ({content.features?.length || 0}/4)
            </button>
          )}
        </div>

        {(content.features?.length || 0) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(content.features || []).map((feat, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    ช่องที่ {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeatureCard(idx)}
                    className="text-xs font-bold text-red-500 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ลบช่องนี้
                  </button>
                </div>

                <input
                  value={feat.title}
                  onChange={(e) =>
                    updateFeatureCard(idx, { title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-800"
                  placeholder="หัวข้อ เช่น Golf View Dining / Poolside Lounge"
                />

                <textarea
                  value={feat.desc}
                  onChange={(e) =>
                    updateFeatureCard(idx, { desc: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                  placeholder="คำอธิบายสั้นๆ..."
                />

                <div className="flex items-center gap-2">
                  <input
                    value={feat.image_url || ''}
                    onChange={(e) =>
                      updateFeatureCard(idx, { image_url: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800"
                    placeholder="URL รูปพื้นหลัง (ไม่บังคับ)"
                  />
                  <label className="px-3 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer shrink-0">
                    {uploadingTarget === `feat-${idx}` ? '...' : 'อัปโหลด'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleUploadImage(
                          e.target.files?.[0],
                          (url) => updateFeatureCard(idx, { image_url: url }),
                          `feat-${idx}`
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={isSaving}
          className="bg-accent hover:opacity-90 text-primary font-bold text-xs tracking-wider uppercase py-3.5 px-8 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save Story & Photos'}
          <Save className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
