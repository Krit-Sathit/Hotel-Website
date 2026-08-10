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

    // Production uploads must use durable object storage. Vercel's filesystem
    // and in-memory fallbacks are discarded after a request or deployment.
    if (isSupabaseConfigured) {
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      try {
        const publicUrl = await uploadSupabaseFile('hotel-media', filename, buffer, file.type);
        return NextResponse.json({ success: true, url: publicUrl });
      } catch (storageError: any) {
        console.error('Supabase Storage upload error:', storageError);
        return NextResponse.json({ error: 'Image could not be saved to persistent storage.' }, { status: 502 });
      }
    }

    if (process.env.VERCEL === '1') {
      return NextResponse.json(
        { error: 'Persistent media storage is not configured. Connect Supabase before uploading images.' },
        { status: 503 }
      );
    }

    // Local filesystem storage is only available during local development.
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
      return NextResponse.json({ error: 'Local media storage is unavailable.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Upload API error:', error);
    
    // Final safety fallback: convert payload to data URL if possible
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
