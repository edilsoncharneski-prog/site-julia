-- ====================================================================
-- MIGRAÇÃO: TABELA DE SLIDES DO CARROSSEL (carousel_slides)
-- Eletrosom Ebikes
-- ====================================================================

-- Criar tabela de banners/slides do carrossel
CREATE TABLE IF NOT EXISTS carousel_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    subtitle VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Leitura pública de slides ativos" ON carousel_slides;
CREATE POLICY "Leitura pública de slides ativos" 
ON carousel_slides FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Gestão total para administradores autenticados" ON carousel_slides;
CREATE POLICY "Gestão total para administradores autenticados" 
ON carousel_slides FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
