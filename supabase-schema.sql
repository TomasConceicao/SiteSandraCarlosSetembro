-- ==============================================================================
-- SCHEMA & POLÍTICAS RLS SUPABASE - SANDRA CARLOS CONSULTORIA IMOBILIÁRIA
-- ==============================================================================
-- Instruções de implementação no Supabase Dashboard (SQL Editor):
-- 1. Aceda a Authentication -> Users no Supabase Dashboard e crie o utilizador
--    administrador (email + password). Desative "Allow new users to sign up"
--    em Authentication -> Providers -> Email / Sign In Settings.
-- 2. Execute este script completo no SQL Editor ("New query" -> Run).
-- 3. Registe o utilizador administrador na tabela public.admin_users executando:
--
--    INSERT INTO public.admin_users (user_id, email)
--    SELECT id, email FROM auth.users WHERE email = 'EMAIL_DO_ADMIN@DOMINIO.PT'
--    ON CONFLICT (user_id) DO NOTHING;
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELA DE ADMINISTRADORES AUTORIZADOS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Apenas o próprio utilizador autenticado pode verificar se o seu UID é admin
DROP POLICY IF EXISTS "Admin lê o próprio registo" ON public.admin_users;
CREATE POLICY "Admin lê o próprio registo"
ON public.admin_users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 2. FUNÇÃO AUXILIAR DE SEGURANÇA: UTILIZADOR ADMIN COM SESSÃO AAL2 (2FA TOTP)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_aal2()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.role() = 'authenticated'
    AND COALESCE(auth.jwt() ->> 'aal', '') = 'aal2'
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin_aal2() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_aal2() TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 3. TABELA DE IMÓVEIS (properties)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    status TEXT DEFAULT 'disponivel', -- 'disponivel', 'reservado', 'vendido', 'novidade', 'none'
    status_label TEXT,
    location TEXT NOT NULL,
    address TEXT,
    location_precision TEXT DEFAULT 'exata', -- 'exata' ou 'certa'
    typology TEXT NOT NULL,
    area TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    half_baths INTEGER,
    description TEXT NOT NULL,
    extended_description JSONB,
    image TEXT NOT NULL,
    secondary_images JSONB DEFAULT '[]'::jsonb,
    architectural_highlights JSONB DEFAULT '[]'::jsonb,
    year TEXT,
    energy_certificate TEXT,
    price TEXT,
    video_url TEXT,
    video_thumbnail TEXT,
    map_coordinates JSONB,
    interior_features JSONB,
    exterior_features JSONB,
    details_features JSONB,
    financial_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir coluna energy_certificate caso a tabela já existisse
ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS energy_certificate TEXT;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Leitura pública para visitantes (site público só lê dados)
DROP POLICY IF EXISTS "Leitura pública de imóveis" ON public.properties;
CREATE POLICY "Leitura pública de imóveis"
ON public.properties FOR SELECT
TO anon, authenticated
USING (true);

-- Escrita (INSERT, UPDATE, DELETE) apenas para admin com sessão AAL2
DROP POLICY IF EXISTS "Inserção de imóveis apenas admin aal2" ON public.properties;
CREATE POLICY "Inserção de imóveis apenas admin aal2"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_aal2());

DROP POLICY IF EXISTS "Atualização de imóveis apenas admin aal2" ON public.properties;
CREATE POLICY "Atualização de imóveis apenas admin aal2"
ON public.properties FOR UPDATE
TO authenticated
USING (public.is_admin_aal2())
WITH CHECK (public.is_admin_aal2());

DROP POLICY IF EXISTS "Eliminação de imóveis apenas admin aal2" ON public.properties;
CREATE POLICY "Eliminação de imóveis apenas admin aal2"
ON public.properties FOR DELETE
TO authenticated
USING (public.is_admin_aal2());

-- ------------------------------------------------------------------------------
-- 4. TABELA DE TESTEMUNHOS (reviews)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    text TEXT NOT NULL,
    image TEXT,
    fallback_image TEXT,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Leitura pública
DROP POLICY IF EXISTS "Leitura pública de testemunhos" ON public.reviews;
CREATE POLICY "Leitura pública de testemunhos"
ON public.reviews FOR SELECT
TO anon, authenticated
USING (true);

-- Escrita apenas para admin com sessão AAL2
DROP POLICY IF EXISTS "Inserção de testemunhos apenas admin aal2" ON public.reviews;
CREATE POLICY "Inserção de testemunhos apenas admin aal2"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_aal2());

DROP POLICY IF EXISTS "Atualização de testemunhos apenas admin aal2" ON public.reviews;
CREATE POLICY "Atualização de testemunhos apenas admin aal2"
ON public.reviews FOR UPDATE
TO authenticated
USING (public.is_admin_aal2())
WITH CHECK (public.is_admin_aal2());

DROP POLICY IF EXISTS "Eliminação de testemunhos apenas admin aal2" ON public.reviews;
CREATE POLICY "Eliminação de testemunhos apenas admin aal2"
ON public.reviews FOR DELETE
TO authenticated
USING (public.is_admin_aal2());

-- ------------------------------------------------------------------------------
-- 5. TABELA DE TEXTOS E CONFIGURAÇÕES DO SITE (site_settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    texts JSONB NOT NULL DEFAULT '{}'::jsonb,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    photos JSONB NOT NULL DEFAULT '{}'::jsonb,
    featured_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Leitura pública para renderizar textos, fotos e configurações do site
DROP POLICY IF EXISTS "Leitura pública de configurações do site" ON public.site_settings;
CREATE POLICY "Leitura pública de configurações do site"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Escrita apenas para admin com sessão AAL2
DROP POLICY IF EXISTS "Inserção de configurações apenas admin aal2" ON public.site_settings;
CREATE POLICY "Inserção de configurações apenas admin aal2"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_aal2());

DROP POLICY IF EXISTS "Atualização de configurações apenas admin aal2" ON public.site_settings;
CREATE POLICY "Atualização de configurações apenas admin aal2"
ON public.site_settings FOR UPDATE
TO authenticated
USING (public.is_admin_aal2())
WITH CHECK (public.is_admin_aal2());

DROP POLICY IF EXISTS "Eliminação de configurações apenas admin aal2" ON public.site_settings;
CREATE POLICY "Eliminação de configurações apenas admin aal2"
ON public.site_settings FOR DELETE
TO authenticated
USING (public.is_admin_aal2());

-- ------------------------------------------------------------------------------
-- 6. SUPABASE STORAGE: BUCKET PÚBLICO PARA IMAGENS ('site-images') + RLS
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site-images',
    'site-images',
    true,
    10485760, -- 10 MB por imagem
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Leitura pública das imagens no bucket 'site-images'
DROP POLICY IF EXISTS "Leitura pública de imagens (site-images)" ON storage.objects;
CREATE POLICY "Leitura pública de imagens (site-images)"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');

-- Carregamento (Upload) apenas para admin com sessão AAL2
DROP POLICY IF EXISTS "Upload de imagens apenas admin aal2" ON storage.objects;
CREATE POLICY "Upload de imagens apenas admin aal2"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images' AND public.is_admin_aal2());

-- Substituição / Atualização apenas para admin com sessão AAL2
DROP POLICY IF EXISTS "Atualização de imagens apenas admin aal2" ON storage.objects;
CREATE POLICY "Atualização de imagens apenas admin aal2"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-images' AND public.is_admin_aal2())
WITH CHECK (bucket_id = 'site-images' AND public.is_admin_aal2());

-- Eliminação de imagens apenas para admin com sessão AAL2
DROP POLICY IF EXISTS "Eliminação de imagens apenas admin aal2" ON storage.objects;
CREATE POLICY "Eliminação de imagens apenas admin aal2"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-images' AND public.is_admin_aal2());

-- ------------------------------------------------------------------------------
-- 7. ÍNDICES DE PERFORMANCE E PERMISSÕES DE SCHEMA
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.properties TO anon, authenticated;
GRANT SELECT ON TABLE public.reviews TO anon, authenticated;
GRANT SELECT ON TABLE public.site_settings TO anon, authenticated;
GRANT SELECT ON TABLE public.admin_users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.properties TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.site_settings TO authenticated;
