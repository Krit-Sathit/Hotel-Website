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

    if (isSupabaseConfigured) {
      // 1. Upload to Supabase Storage (hotel-media bucket)
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      try {
        const publicUrl = await uploadSupabaseFile('hotel-media', filename, buffer, file.type);
        return NextResponse.json({ success: true, url: publicUrl });
      } catch (storageError: any) {
        console.error('Supabase Storage upload error:', storageError);
        return NextResponse.json({ error: `Supabase Storage upload failed: ${storageError.message}` }, { status: 500 });
      }
    } else {
      // 2. Local Fallback: Save to public/uploads directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
