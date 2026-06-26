-- Multi-Tenant Hotel CMS Platform Schema (Supabase/PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLES
-- -----------------------------------------------------------------------------

-- Hotels (Tenants)
CREATE TABLE public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    custom_domain TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'draft')),
    logo_url TEXT,
    favicon_url TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    google_map_url TEXT,
    social_links JSONB NOT NULL DEFAULT '{"facebook": "", "instagram": "", "whatsapp": "", "twitter": ""}'::jsonb,
    theme JSONB NOT NULL DEFAULT '{
        "primary_color": "#1a1a1a",
        "secondary_color": "#4a4a4a",
        "accent_color": "#d4af37",
        "background_color": "#ffffff",
        "text_color": "#111111",
        "button_style": "rounded",
        "border_radius": "6px",
        "font_family": "Inter",
        "dark_mode": false,
        "header_layout": "centered",
        "footer_layout": "simple",
        "animation_style": "fade"
    }'::jsonb,
    homepage_layout JSONB NOT NULL DEFAULT '["hero", "about", "rooms", "facilities", "promotions", "gallery", "testimonials", "contact"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (User Roles & Hotel Association)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY, -- References auth.users(id)
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'owner', 'staff')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Hero Slides
CREATE TABLE public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    video_url TEXT,
    headline TEXT,
    subheadline TEXT,
    button_text TEXT DEFAULT 'Book Now',
    button_link TEXT DEFAULT '#booking',
    overlay_color TEXT DEFAULT '#000000',
    overlay_opacity NUMERIC NOT NULL DEFAULT 0.4 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 1),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Homepage Sections (Custom blocks content)
CREATE TABLE public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL, -- 'about', 'facilities', 'testimonials', 'restaurant', 'spa', 'awards', 'attractions'
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (hotel_id, section_type)
);

-- Rooms
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    gallery TEXT[] NOT NULL DEFAULT '{}'::text[],
    amenities TEXT[] NOT NULL DEFAULT '{}'::text[],
    max_guests INTEGER NOT NULL DEFAULT 2 CHECK (max_guests > 0),
    room_size INTEGER NOT NULL DEFAULT 25 CHECK (room_size > 0), -- In square meters
    bed_type TEXT NOT NULL DEFAULT 'King Bed',
    price NUMERIC CHECK (price >= 0),
    book_now_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Promotions
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    promo_code TEXT,
    cta_text TEXT NOT NULL DEFAULT 'Book Now',
    cta_link TEXT DEFAULT '#booking',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gallery Photos
CREATE TABLE public.gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General', -- 'rooms', 'dining', 'spa', 'exterior', 'general'
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Posts
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    meta_title TEXT,
    meta_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (hotel_id, slug)
);

-- Contact Messages
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Media Library
CREATE TABLE public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    alt_text TEXT,
    folder TEXT NOT NULL DEFAULT 'root',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Analytics Events (Anonymous)
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'booking_click', 'widget_use')),
    page_path TEXT NOT NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 2. INDEXES FOR PERFORMANCE & TENANT ISOLATION
-- -----------------------------------------------------------------------------
CREATE INDEX idx_hotels_slug ON public.hotels(slug);
CREATE INDEX idx_hotels_custom_domain ON public.hotels(custom_domain);
CREATE INDEX idx_profiles_hotel_id ON public.profiles(hotel_id);
CREATE INDEX idx_hero_slides_hotel_id ON public.hero_slides(hotel_id);
CREATE INDEX idx_homepage_sections_hotel_id ON public.homepage_sections(hotel_id);
CREATE INDEX idx_rooms_hotel_id ON public.rooms(hotel_id);
CREATE INDEX idx_promotions_hotel_id ON public.promotions(hotel_id);
CREATE INDEX idx_gallery_photos_hotel_id ON public.gallery_photos(hotel_id);
CREATE INDEX idx_blog_posts_hotel_id ON public.blog_posts(hotel_id);
CREATE INDEX idx_contact_messages_hotel_id ON public.contact_messages(hotel_id);
CREATE INDEX idx_media_library_hotel_id ON public.media_library(hotel_id);
CREATE INDEX idx_analytics_events_hotel_id ON public.analytics_events(hotel_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- -----------------------------------------------------------------------------
-- 3. TRIGGERS & FUNCTIONS
-- -----------------------------------------------------------------------------

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER set_timestamp_hotels BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER set_timestamp_homepage_sections BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER set_timestamp_rooms BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER set_timestamp_promotions BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER set_timestamp_blog_posts BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

-- Create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function to check user's hotel access
CREATE OR REPLACE FUNCTION public.has_hotel_access(hotel_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.is_super_admin() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND public.profiles.hotel_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- HOTELS RLS POLICIES ---
CREATE POLICY "Allow public read access to active hotels" ON public.hotels
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow super admins full control over hotels" ON public.hotels
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "Allow owners/staff to update their own hotel" ON public.hotels
    FOR UPDATE USING (public.has_hotel_access(id));

-- --- PROFILES RLS POLICIES ---
CREATE POLICY "Allow users to read their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow members of same hotel to view each other" ON public.profiles
    FOR SELECT USING (
        hotel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.profiles AS self
            WHERE self.id = auth.uid() AND self.hotel_id = public.profiles.hotel_id
        )
    );

CREATE POLICY "Allow super admins full control over profiles" ON public.profiles
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "Allow owners to manage staff of their hotel" ON public.profiles
    FOR ALL USING (
        hotel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.profiles AS self
            WHERE self.id = auth.uid() AND self.hotel_id = public.profiles.hotel_id AND self.role = 'owner'
        )
    );

-- --- TENANT CONTENT RLS POLICIES (Read: Public, Write: Authorized Staff/Owner) ---

-- Hero Slides Policies
CREATE POLICY "Allow public read access to hero slides" ON public.hero_slides FOR SELECT USING (TRUE);
CREATE POLICY "Allow hotel staff to manage hero slides" ON public.hero_slides FOR ALL USING (public.has_hotel_access(hotel_id));

-- Homepage Sections Policies
CREATE POLICY "Allow public read access to homepage sections" ON public.homepage_sections FOR SELECT USING (is_enabled = TRUE);
CREATE POLICY "Allow hotel staff to manage homepage sections" ON public.homepage_sections FOR ALL USING (public.has_hotel_access(hotel_id));

-- Rooms Policies
CREATE POLICY "Allow public read access to rooms" ON public.rooms FOR SELECT USING (TRUE);
CREATE POLICY "Allow hotel staff to manage rooms" ON public.rooms FOR ALL USING (public.has_hotel_access(hotel_id));

-- Promotions Policies
CREATE POLICY "Allow public read access to promotions" ON public.promotions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Allow hotel staff to manage promotions" ON public.promotions FOR ALL USING (public.has_hotel_access(hotel_id));

-- Gallery Photos Policies
CREATE POLICY "Allow public read access to gallery" ON public.gallery_photos FOR SELECT USING (TRUE);
CREATE POLICY "Allow hotel staff to manage gallery" ON public.gallery_photos FOR ALL USING (public.has_hotel_access(hotel_id));

-- Blog Posts Policies
CREATE POLICY "Allow public read access to published blog posts" ON public.blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Allow hotel staff to manage blog posts" ON public.blog_posts FOR ALL USING (public.has_hotel_access(hotel_id));

-- Contact Messages Policies (Write: Public, Read/Manage: Staff)
CREATE POLICY "Allow public to submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow hotel staff to view/manage contact messages" ON public.contact_messages FOR ALL USING (public.has_hotel_access(hotel_id));

-- Media Library Policies (Write & Read: Authorized Staff)
CREATE POLICY "Allow hotel staff to manage media library" ON public.media_library FOR ALL USING (public.has_hotel_access(hotel_id));

-- Analytics Events Policies (Write: Public, Read: Staff)
CREATE POLICY "Allow public to submit anonymous analytics events" ON public.analytics_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow hotel staff to view analytics events" ON public.analytics_events FOR SELECT USING (public.has_hotel_access(hotel_id));
