-- ==============================================================================
-- SCHEMA DA BASE DE DADOS SUPABASE - SANDRA CARLOS CONSULTORIA IMOBILIÁRIA
-- ==============================================================================
-- Instruções:
-- 1. Aceda ao seu painel no Supabase (https://supabase.com/dashboard)
-- 2. Selecione o seu projeto e abra a secção "SQL Editor" no menu lateral
-- 3. Crie uma nova consulta ("New query"), cole todo o conteúdo deste ficheiro e clique em "Run".
-- ==============================================================================

-- 1. Criar Tabela de Imóveis (properties)
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    status TEXT DEFAULT 'disponivel', -- 'disponivel', 'reservado', 'vendido', 'novidade'
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
    extended_description JSONB, -- Array de parágrafos de texto
    image TEXT NOT NULL,
    secondary_images JSONB, -- Array de URLs de fotografias
    architectural_highlights JSONB, -- Array de destaques
    year TEXT,
    price TEXT,
    video_url TEXT,
    video_thumbnail TEXT,
    map_coordinates JSONB, -- { lat, lng, zoom, precision, circleRadius }
    interior_features JSONB, -- Array de { label, value }
    exterior_features JSONB, -- Array de { label, value }
    details_features JSONB, -- Array de { label, value }
    financial_details JSONB, -- Array de { label, value }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar Tabela de Testemunhos / Avaliações (reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    text TEXT,
    image TEXT,
    fallback_image TEXT,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Configurar Row Level Security (RLS) para Segurança Máxima
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para 'properties':
-- Leitura pública para todos os visitantes do site
DROP POLICY IF EXISTS "Permitir leitura pública de imóveis" ON public.properties;
CREATE POLICY "Permitir leitura pública de imóveis"
ON public.properties FOR SELECT
TO anon, authenticated
USING (true);

-- Escrita, alteração e eliminação apenas para administradores autenticados
DROP POLICY IF EXISTS "Permitir escrita de imóveis para administradores autenticados" ON public.properties;
CREATE POLICY "Permitir escrita de imóveis para administradores autenticados"
ON public.properties FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para 'reviews':
-- Leitura pública de testemunhos
DROP POLICY IF EXISTS "Permitir leitura pública de reviews" ON public.reviews;
CREATE POLICY "Permitir leitura pública de reviews"
ON public.reviews FOR SELECT
TO anon, authenticated
USING (true);

-- Escrita apenas para utilizadores autenticados
DROP POLICY IF EXISTS "Permitir gestão de reviews para administradores autenticados" ON public.reviews;
CREATE POLICY "Permitir gestão de reviews para administradores autenticados"
ON public.reviews FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Índices de performance para ordenação rápida
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);
