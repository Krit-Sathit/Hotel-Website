import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, uploadSupabaseFile } from '@/lib/db/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Supabase Cloud Storage (if configured)
    if (isSupabaseConfigured) {
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      try {
        const publicUrl = await uploadSupabaseFile('hotel-media', filename, buffer, file.type);
        return NextResponse.json({ success: true, url: publicUrl });
      } catch (storageError: any) {
        console.error('Supabase Storage upload error:', storageError);
      }
    }

    // 2. Local Filesystem (for Local Development)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } catch (fsError) {
      // 3. Vercel Serverless Fallback (Read-Only Filesystem) -> Convert to Base64 Data URL
      console.warn('Filesystem write failed (Vercel Serverless detected), converting upload to Base64 Data URL');
      const mimeType = file.type || 'image/webp';
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({ success: true, url: dataUrl });
    }
  } catch (error: any) {
    console.error('Upload API error:', error);
    
    // Final safety fallback: convert payload to data URL if possible
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
