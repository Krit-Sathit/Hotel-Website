-- Persist the Media Library drag-and-drop order for existing deployments.
ALTER TABLE public.media_library
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Existing CMS sessions can use legacy hotel IDs rather than UUIDs. Keep the
-- media library compatible with those tenant IDs until the full hotel dataset
-- has been migrated to Supabase.
DROP POLICY IF EXISTS "Allow hotel staff to manage media library" ON public.media_library;

ALTER TABLE public.media_library
  DROP CONSTRAINT IF EXISTS media_library_hotel_id_fkey;

ALTER TABLE public.media_library
  ALTER COLUMN hotel_id TYPE TEXT USING hotel_id::TEXT;

CREATE POLICY "Allow hotel staff to manage media library" ON public.media_library
  FOR ALL USING (public.has_hotel_access(hotel_id::UUID));

CREATE INDEX IF NOT EXISTS idx_media_library_hotel_sort_order
  ON public.media_library (hotel_id, sort_order);

-- Create the public bucket used by the CMS. Uploads are performed by the
-- server with SUPABASE_SERVICE_ROLE_KEY, so no browser write policy is needed.
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-media', 'hotel-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;
