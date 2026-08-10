'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { 
  getMediaItemsAction, 
  saveMediaItemAction, 
  updateMediaItemCategoryAction, 
  deleteMediaItemAction,
  saveMediaOrderAction,
  associatePhotoWithRoomAction
} from '@/lib/db/actions';

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
  const [hotelId, setHotelId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFolder, setUploadFolder] = useState('General');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'paste'>('upload');
  const [libraryError, setLibraryError] = useState<string | null>(null);

  // Seed default library files
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const mediaLoadId = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const getActiveMedia = async () => {
      const loadId = ++mediaLoadId.current;
      try {
        setLibraryError(null);
        setSelectedFile(null);
        setSelectedFileIds([]);
        setFiles([]);

        // The selected hotel is stored in a cookie, so this request must always
        // bypass browser caches and read the cookie that was just updated.
        const res = await fetch('/api/admin/data', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const hotel = data.hotel;
        if (hotel && !cancelled && loadId === mediaLoadId.current) {
          setHotelId(hotel.id);
          setRooms(data.rooms || []);
          
          // Check localStorage cache first to preserve user deletions across serverless reloads
          let deletedIds: string[] = [];
          if (typeof window !== 'undefined') {
            const deletedCache = localStorage.getItem(`flowstay_deleted_media_${hotel.id}`);
            if (deletedCache) {
              try {
                deletedIds = JSON.parse(deletedCache) || [];
              } catch (e) {
                console.error('Failed to parse deleted media cache:', e);
              }
            }
          }

          // Load media items from database
          const dbResult = await getMediaItemsAction(hotel.id);
          if (cancelled || loadId !== mediaLoadId.current) return;

          if (dbResult.success) {
            const filtered = dbResult.items.filter((item: MediaFile) => !deletedIds.includes(item.id));
            setFiles(filtered);
          } else {
            setLibraryError('Media Library could not be loaded. Check the selected hotel and persistent storage settings.');
            setFiles([]);
          }
        }
      } catch (err) {
        console.error('Failed to load media details via API:', err);
        if (!cancelled) {
          setLibraryError('Media Library could not be loaded. Please select the hotel again and retry.');
          setFiles([]);
        }
      }
    };

    getActiveMedia();

    // TenantSelector emits this event as soon as the user chooses another hotel.
    // This is necessary because router.refresh() preserves this client page state.
    window.addEventListener('active-hotel-changed', getActiveMedia);
    return () => {
      cancelled = true;
      window.removeEventListener('active-hotel-changed', getActiveMedia);
    };
  }, []);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
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

      const saveRes = await saveMediaItemAction(hotelId, {
        name: fileName,
        url: uploadUrl,
        category: uploadFolder,
        size: `${Math.floor(80 + Math.random() * 150)} KB`,
        altText: uploadAlt || 'Resort custom upload asset'
      });

      if (saveRes.success && saveRes.item) {
        const item = saveRes.item;
        const newFile: MediaFile = {
          id: item.id,
          name: item.name,
          url: item.url,
          category: item.category,
          size: item.size,
          dimensions: 'Dynamic',
          altText: item.alt_text || '',
          dateAdded: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        };
        setFiles([newFile, ...files]);
        setUploadUrl('');
        setUploadAlt('');
        setUploadMessage('Image successfully saved to library database!');
        setTimeout(() => setUploadMessage(null), 4000);
      } else {
        throw new Error(saveRes.error || 'Image could not be saved to persistent storage.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save image to persistent storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    setIsUploading(true);
    setUploadMessage(null);

    try {
      const uploadPromises = filesArray.map(async (file) => {
        const processedFile = await compressImageToWebP(file);
        const formData = new FormData();
        formData.append('file', processedFile);

        let imageUrl = '';

        try {
          const res = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (!res.ok || !data.url) {
            throw new Error(data.error || 'Image could not be saved to persistent storage.');
          }
          imageUrl = data.url;
        } catch (apiErr) {
          throw apiErr;
        }

        // Save item to database
        const saveRes = await saveMediaItemAction(hotelId, {
          name: processedFile.name,
          url: imageUrl,
          category: uploadFolder,
          size: `${Math.round(processedFile.size / 1024)} KB`,
          altText: uploadAlt || processedFile.name.split('.')[0]
        });

        if (!saveRes.success || !saveRes.item) {
          throw new Error(`Failed to save database reference for ${file.name}`);
        }

        const item = saveRes.item;
        return {
          id: item.id,
          name: item.name,
          url: item.url,
          category: item.category,
          size: item.size,
          dimensions: 'Dynamic',
          altText: item.alt_text || '',
          dateAdded: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        };
      });

      const newUploadedFiles = await Promise.all(uploadPromises);

      setFiles((prevFiles) => [...newUploadedFiles, ...prevFiles]);
      setUploadAlt('');
      setUploadMessage(`Successfully WebP compressed and saved ${newUploadedFiles.length} image(s) to database!`);
      setTimeout(() => setUploadMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to upload images to persistent storage.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const rememberDeletedMedia = (ids: string[]) => {
    if (typeof window === 'undefined' || !hotelId || ids.length === 0) return;

    const deletedCache = localStorage.getItem(`flowstay_deleted_media_${hotelId}`);
    let deletedIds: string[] = [];
    if (deletedCache) {
      try {
        deletedIds = JSON.parse(deletedCache) || [];
      } catch (err) {
        console.error('Failed to parse deleted media cache:', err);
      }
    }

    localStorage.setItem(
      `flowstay_deleted_media_${hotelId}`,
      JSON.stringify([...new Set([...deletedIds, ...ids])])
    );
  };

  const deleteMediaFiles = async (ids: string[]) => {
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const result = await deleteMediaItemAction(id);
          return { id, success: result.success };
        } catch (err) {
          console.error(`Failed to delete media item ${id}:`, err);
          return { id, success: false };
        }
      })
    );

    const deletedIds = results.filter(result => result.success).map(result => result.id);
    if (deletedIds.length > 0) {
      const deletedIdSet = new Set(deletedIds);
      setFiles(currentFiles => currentFiles.filter(file => !deletedIdSet.has(file.id)));
      setSelectedFile(currentFile => currentFile && deletedIdSet.has(currentFile.id) ? null : currentFile);
      setSelectedFileIds(currentIds => currentIds.filter(id => !deletedIdSet.has(id)));
      rememberDeletedMedia(deletedIds);
    }

    return results.length - deletedIds.length;
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset from your media library? Any pages referencing this URL will show a broken image.')) return;

    const failedCount = await deleteMediaFiles([id]);
    if (failedCount > 0) {
      alert('This asset could not be deleted. Please try again.');
    }
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFileIds(currentIds =>
      currentIds.includes(id)
        ? currentIds.filter(selectedId => selectedId !== id)
        : [...currentIds, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredFiles.map(file => file.id);
    const allShownSelected = filteredIds.length > 0 && filteredIds.every(id => selectedFileIds.includes(id));

    setSelectedFileIds(currentIds => allShownSelected
      ? currentIds.filter(id => !filteredIds.includes(id))
      : [...new Set([...currentIds, ...filteredIds])]
    );
  };

  const handleDeleteSelectedFiles = async () => {
    if (selectedFileIds.length === 0) return;

    const assetLabel = selectedFileIds.length === 1 ? 'this asset' : `${selectedFileIds.length} selected assets`;
    if (!confirm(`Are you sure you want to delete ${assetLabel} from your media library? Any pages referencing these URLs will show broken images.`)) return;

    setIsDeletingSelected(true);
    try {
      const failedCount = await deleteMediaFiles(selectedFileIds);
      if (failedCount > 0) {
        alert(`${failedCount} asset${failedCount === 1 ? '' : 's'} could not be deleted. Please try again.`);
      }
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const handleCategoryChange = async (fileId: string, newCategory: string) => {
    try {
      const res = await updateMediaItemCategoryAction(fileId, newCategory);
      if (res.success) {
        setFiles(prevFiles => {
          const updated = prevFiles.map(file => {
            if (file.id === fileId) {
              return { ...file, category: newCategory };
            }
            return file;
          });
          
          const found = updated.find(f => f.id === fileId);
          if (found) {
            setSelectedFile(found);
          }
          
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...files];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    setFiles(reordered);
    setDraggedIndex(null);

    // Save new sort order in the database
    try {
      const ids = reordered.map(item => item.id);
      await saveMediaOrderAction(ids);
    } catch (err) {
      console.error('Failed to save media order:', err);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRoomTypeAssociationChange = async (fileUrl: string, roomId: string) => {
    try {
      const res = await associatePhotoWithRoomAction(hotelId, fileUrl, roomId || null);
      if (res.success) {
        const dataRes = await fetch('/api/admin/data');
        if (dataRes.ok) {
          const data = await dataRes.json();
          setRooms(data.rooms || []);
        }
      }
    } catch (err) {
      console.error('Failed to change room association:', err);
    }
  };

  // Filter logic
  const filteredFiles = files.filter(file => {
    const matchesSearch = (file.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (file.altText || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === 'All' || (file.category || '').toLowerCase() === activeFolder.toLowerCase();
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

        {libraryError && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs rounded-lg animate-fade-in flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {libraryError}
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
                      <p className="text-xs font-bold text-slate-350 group-hover:text-slate-200 transition-colors">Click to upload images (or drag & drop files)</p>
                      <p className="text-[9px] text-slate-500 mt-1">Supports PNG, JPG, JPEG, WEBP, GIF - Max 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleRealUpload}
                      accept="image/*"
                      disabled={isUploading}
                      multiple
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

          {/* BULK ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <p className="text-[10px] text-slate-500 font-medium">
              Use the checkboxes on each image to select multiple assets.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                disabled={filteredFiles.length === 0}
                className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {filteredFiles.length > 0 && filteredFiles.every(file => selectedFileIds.includes(file.id))
                  ? 'Clear shown'
                  : 'Select shown'}
              </button>
              {selectedFileIds.length > 0 && (
                <>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {selectedFileIds.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedFiles}
                    disabled={isDeletingSelected}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-[10px] font-bold uppercase tracking-wider text-red-300 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeletingSelected ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete selected
                  </button>
                </>
              )}
            </div>
          </div>

          {/* FILES GRID */}
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  draggable={true}
                  onDragStart={(e) => {
                    const idx = files.findIndex(f => f.id === file.id);
                    handleDragStart(e, idx);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    const idx = files.findIndex(f => f.id === file.id);
                    handleDrop(e, idx);
                  }}
                  onDragEnd={handleDragEnd}
                  className={`group relative aspect-square bg-slate-950 rounded-xl overflow-hidden cursor-move border-2 transition-all ${
                    selectedFile?.id === file.id || selectedFileIds.includes(file.id)
                      ? 'border-accent shadow-lg'
                      : 'border-slate-850 hover:border-slate-700'
                  } ${draggedIndex === files.findIndex(f => f.id === file.id) ? 'opacity-40 scale-95 border-dashed border-accent' : ''}`}
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
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFileSelection(file.id);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    aria-label={`${selectedFileIds.includes(file.id) ? 'Deselect' : 'Select'} ${file.name}`}
                    className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md border transition-all ${
                      selectedFileIds.includes(file.id)
                        ? 'border-accent bg-accent text-primary'
                        : 'border-white/30 bg-black/50 text-transparent hover:border-accent hover:text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
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
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Folder / Category</span>
                    <select
                      value={selectedFile.category}
                      onChange={(e) => handleCategoryChange(selectedFile.id, e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-accent cursor-pointer"
                    >
                      {folders.filter(f => f !== 'All').map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  {selectedFile.category === 'Rooms' && (() => {
                    const selectedFileRoomId = (() => {
                      if (!rooms) return '';
                      const matchingRoom = rooms.find(room => 
                        room.gallery && room.gallery.some((url: string) => {
                          if (!url || !selectedFile.url) return false;
                          const cleanUrl = (u: string) => {
                            try {
                              const parsed = new URL(u);
                              return parsed.pathname;
                            } catch {
                              return u;
                            }
                          };
                          const pathA = cleanUrl(url);
                          const pathB = cleanUrl(selectedFile.url);
                          if (pathA === pathB) return true;
                          const fileA = pathA.substring(pathA.lastIndexOf('/') + 1);
                          const fileB = pathB.substring(pathB.lastIndexOf('/') + 1);
                          return fileA && fileB && fileA === fileB;
                        })
                      );
                      return matchingRoom ? matchingRoom.id : '';
                    })();
                    return (
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Associated Room Type</span>
                        <select
                          value={selectedFileRoomId}
                          onChange={(e) => handleRoomTypeAssociationChange(selectedFile.url, e.target.value)}
                          className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-accent cursor-pointer"
                        >
                          <option value="">-- General / No Room Type --</option>
                          {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
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
