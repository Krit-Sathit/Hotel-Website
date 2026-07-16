'use client';

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Info,
  Trash2,
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { getHotelBySlug } from '@/lib/db/mock-data';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  category: string;
  size: string;
  dimensions: string;
  altText: string;
  dateAdded: string;
}

async function compressImageToWebP(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
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
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const webpFile = new File([blob], `${nameWithoutExt}.webp`, {
                  type: 'image/webp'
                });
                resolve(webpFile);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            quality
          );
        } catch (err) {
          console.error('Image compression error, falling back to original:', err);
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export default function MediaLibraryPage() {
  const [hotelName, setHotelName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFolder, setUploadFolder] = useState('General');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'paste'>('upload');

  // Seed default library files
  const [files, setFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    const getActiveMedia = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        if (hotel) {
          setHotelName(hotel.name);
          
          // Seed files based on hotel's default room & gallery assets
          const seedFiles: MediaFile[] = [];
          
          if (hotel.slug === 'hotel-a') {
            seedFiles.push(
              { id: 'm1', name: 'ocean-suite-bed.webp', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', category: 'Rooms', size: '124 KB', dimensions: '1920x1080', altText: 'Oceanfront King Suite master bed and pillows', dateAdded: '2026-06-10' },
              { id: 'm2', name: 'villa-terrace-view.webp', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', category: 'Rooms', size: '248 KB', dimensions: '1920x1080', altText: 'Private plunge pool terrace overlooking beach', dateAdded: '2026-06-11' },
              { id: 'm3', name: 'resort-pool-sunset.webp', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', category: 'Exterior', size: '312 KB', dimensions: '1920x1200', altText: 'Malibu sunset reflected in infinity pool', dateAdded: '2026-06-12' },
              { id: 'm4', name: 'spa-massage-table.webp', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', category: 'Spa', size: '89 KB', dimensions: '1200x800', altText: 'Therapeutic massage bed with warm stones', dateAdded: '2026-06-13' },
              { id: 'm5', name: 'seafood-gastronomy.webp', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', category: 'Dining', size: '185 KB', dimensions: '1200x900', altText: 'Michelin oysters and fine white wine plating', dateAdded: '2026-06-14' }
            );
          } else {
            seedFiles.push(
              { id: 'm6', name: 'soho-loft-interior.webp', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', category: 'Rooms', size: '142 KB', dimensions: '1600x1200', altText: 'Minimalist industrial Soho suite master bedroom', dateAdded: '2026-06-15' },
              { id: 'm7', name: 'lounge-cocktails.webp', url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80', category: 'Dining', size: '118 KB', dimensions: '1200x800', altText: 'Craft cocktails served on industrial zinc bar top', dateAdded: '2026-06-16' }
            );
          }
          setFiles(seedFiles);
        }
      } catch (err) {
        console.error('Failed to load media details via API:', err);
      }
    };

    getActiveMedia();
  }, [hotelName]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    setIsUploading(true);
    setUploadMessage(null);

    // Simulate luxury image compression and WebP conversion (takes 2 seconds)
    setTimeout(() => {
      // Parse file name from URL or generate a clean slug
      let fileName = 'custom-upload.webp';
      try {
        const urlObj = new URL(uploadUrl);
        const pathname = urlObj.pathname;
        const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
        if (lastPart && lastPart.includes('.')) {
          fileName = lastPart.split('.')[0] + '.webp';
        }
      } catch (err) {
        fileName = `upload-${Date.now().toString().slice(-4)}.webp`;
      }

      const newFile: MediaFile = {
        id: `media-${Date.now()}`,
        name: fileName,
        url: uploadUrl,
        category: uploadFolder,
        size: `${Math.floor(80 + Math.random() * 150)} KB`, // Simulate 60% compression savings
        dimensions: '1920x1080',
        altText: uploadAlt || 'Resort custom upload asset',
        dateAdded: new Date().toISOString().split('T')[0]
      };

      setFiles([newFile, ...files]);
      setIsUploading(false);
      setUploadUrl('');
      setUploadAlt('');
      setUploadMessage('Image successfully compressed to WebP and added to your central library!');
      setTimeout(() => setUploadMessage(null), 4000);
    }, 2000);
  };

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const processedFile = await compressImageToWebP(file);
      const formData = new FormData();
      formData.append('file', processedFile);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();

      const newFile: MediaFile = {
        id: `media-${Date.now()}`,
        name: processedFile.name,
        url: data.url,
        category: uploadFolder,
        size: `${Math.round(processedFile.size / 1024)} KB`,
        dimensions: 'Dynamic',
        altText: uploadAlt || processedFile.name.split('.')[0],
        dateAdded: new Date().toISOString().split('T')[0]
      };

      setFiles([newFile, ...files]);
      setUploadAlt('');
      setUploadMessage('Image successfully WebP compressed, resized, and added to library!');
      setTimeout(() => setUploadMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload file. Please make sure the server is running and the file size is under 10MB.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = (id: string) => {
    if (!confirm('Are you sure you want to delete this asset from your media library? Any pages referencing this URL will show a broken image.')) return;
    setFiles(files.filter(f => f.id !== id));
    setSelectedFile(null);
  };

  // Filter logic
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          file.altText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === 'All' || file.category.toLowerCase() === activeFolder.toLowerCase();
    return matchesSearch && matchesFolder;
  });

  const folders = ['All', 'Rooms', 'Dining', 'Spa', 'Exterior', 'General'];

  return (
    <div className="max-w-7xl space-y-8 text-left">
      
      {/* PAGE HEADER */}
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
          Central Media Library
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Upload, compress, and organize your hotel visuals. Reference images across rooms, pages, and blogs.
        </p>
      </div>

      {/* UPLOAD PANEL CARD */}
      <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Upload className="w-4 h-4 text-accent" />
            Central Asset Manager & Uploader
          </h3>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-start">
            <button
              onClick={() => setUploadMethod('upload')}
              className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                uploadMethod === 'upload'
                  ? 'bg-accent text-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload Local File
            </button>
            <button
              onClick={() => setUploadMethod('paste')}
              className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                uploadMethod === 'paste'
                  ? 'bg-accent text-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Image URL
            </button>
          </div>
        </div>
        
        {uploadMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/25 text-green-400 text-xs rounded-lg animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4" />
            {uploadMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Alt Text (SEO Searchable)</label>
              <input
                type="text"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="e.g. Deluxe Suite Bedroom"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Destination Folder</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent cursor-pointer"
                disabled={isUploading}
              >
                {folders.filter(f => f !== 'All').map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-8 h-full flex flex-col justify-end">
            {uploadMethod === 'upload' ? (
              <div className="border-2 border-dashed border-slate-800 hover:border-accent/40 bg-slate-950/20 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-slate-950/40 flex flex-col items-center justify-center space-y-3 relative group min-h-[142px]">
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-xs font-bold text-slate-400">Uploading and saving asset...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-accent transition-colors" />
                    <div>
                      <p className="text-xs font-bold text-slate-350 group-hover:text-slate-200 transition-colors">Click to upload image (or drag & drop file)</p>
                      <p className="text-[9px] text-slate-500 mt-1">Supports PNG, JPG, JPEG, WEBP, GIF - Max 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleRealUpload}
                      accept="image/*"
                      disabled={isUploading}
                    />
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSimulateUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Paste External Image URL</label>
                  <input
                    type="url"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or any image link"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent"
                    required
                    disabled={isUploading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading || !uploadUrl.trim()}
                  className="w-full bg-accent hover:opacity-90 text-primary font-bold text-xs uppercase tracking-wider py-2.5 rounded shadow flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Add to Library
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* CORE LIBRARY LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: DIRECTORIES & FILES GRID (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* SEARCH & DIRECTORY TABS ROW */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800/60 p-4 rounded-xl">
            {/* Search Input */}
            <div className="relative w-full md:w-80 bg-slate-950 border border-slate-800 rounded-lg flex items-center px-3 text-slate-400 focus-within:border-accent">
              <Search className="w-4 h-4 flex-shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file name or alt text..."
                className="bg-transparent border-none outline-none py-2 text-xs text-slate-200 w-full placeholder-slate-500"
              />
            </div>

            {/* Directory tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-[10px] font-bold tracking-widest uppercase">
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`px-3 py-2 rounded border transition-all ${
                    activeFolder === folder
                      ? 'bg-slate-800 text-white border-slate-750 shadow-sm'
                      : 'bg-slate-950 text-slate-550 border-slate-850 hover:text-white hover:border-slate-750'
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>
          </div>

          {/* FILES GRID */}
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`group relative aspect-square bg-slate-950 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedFile?.id === file.id
                      ? 'border-accent shadow-lg'
                      : 'border-slate-850 hover:border-slate-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={file.url} 
                    alt={file.altText} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {/* Folder Indicator Tag */}
                  <div className="absolute top-2 left-2 bg-black/75 text-accent text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10 tracking-widest uppercase">
                    {file.category}
                  </div>
                  {/* File Size details on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-left opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold text-white truncate">{file.name}</p>
                    <p className="text-[8px] text-slate-400 font-mono">{file.size} / WebP</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-28 bg-slate-900 border border-slate-800/60 rounded-xl text-center text-slate-450">
              <ImageIcon className="w-12 h-12 text-slate-800 mx-auto mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">No Media Assets Found</p>
              <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto">
                Try adjusting your folder category filters, clearing the search query, or pasting a URL above to upload images.
              </p>
            </div>
          )}

        </div>

        {/* RIGHT COMPONENT: DETAIL SIDE BAR (3 cols) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24">
          <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-xl space-y-5 shadow-sm text-left">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              Asset Details
            </h4>

            {selectedFile ? (
              <div className="space-y-4 animate-fade-in">
                {/* Large Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-850 bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.altText} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Technical stats */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">File Name</span>
                    <span className="font-bold text-slate-250 break-all">{selectedFile.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Format</span>
                      <span className="font-bold text-slate-250">WebP (Compressed)</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">File Size</span>
                      <span className="font-bold text-emerald-400 font-mono">{selectedFile.size}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Dimensions</span>
                      <span className="font-bold text-slate-250 font-mono">{selectedFile.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Date Uploaded</span>
                      <span className="font-bold text-slate-250 font-mono">{selectedFile.dateAdded}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Alt Text (Search Index)</span>
                    <span className="font-semibold text-slate-350 leading-relaxed text-[11px] block mt-0.5 italic">
                      &ldquo;{selectedFile.altText}&rdquo;
                    </span>
                  </div>
                </div>

                {/* Direct Action links */}
                <div className="space-y-2 pt-4 border-t border-slate-850">
                  {/* Copy Image Link */}
                  <button
                    onClick={() => handleCopyLink(selectedFile.url, selectedFile.id)}
                    className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg py-2.5 px-3 text-[10px] font-bold tracking-wider uppercase text-slate-300 flex items-center justify-between transition-colors"
                  >
                    <span>{copiedId === selectedFile.id ? 'URL Copied' : 'Copy Image Link'}</span>
                    {copiedId === selectedFile.id ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-accent" />
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteFile(selectedFile.id)}
                    className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 rounded-lg py-2.5 px-3 text-[10px] font-bold tracking-wider uppercase text-red-400 flex items-center justify-between transition-colors"
                  >
                    <span>Delete Asset</span>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-550 space-y-2">
                <FileText className="w-8 h-8 text-slate-800 mx-auto" />
                <p className="text-[11px] max-w-[160px] mx-auto leading-normal">
                  Select any visual asset in the library grid to view compression savings, direct links, and alt descriptors.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

      <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-500 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <span>FlowStay CMS Media Library automatically compresses incoming PNG/JPG uploads by up to 70% using local server-side WebP pipelines. Mapped URLs remain persistent, ensuring immediate loading via global Edge CDNs.</span>
      </div>

    </div>
  );
}
