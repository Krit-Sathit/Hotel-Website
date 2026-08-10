-- Persist the Media Library drag-and-drop order for existing deployments.
ALTER TABLE public.media_library
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_media_library_hotel_sort_order
  ON public.media_library (hotel_id, sort_order);

-- Create the public bucket used by the CMS. Uploads are performed by the
-- server with SUPABASE_SERVICE_ROLE_KEY, so no browser write policy is needed.
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-media', 'hotel-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;
