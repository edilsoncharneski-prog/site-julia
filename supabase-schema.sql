-- ====================================================================
-- SCHEMA DE BANCO DE DADOS & STORAGE - JULIA ELETROSOM (SUPABASE)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ====================================================================

-- 1. Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    descricao TEXT,
    icone_url VARCHAR(500),
    imagem_url VARCHAR(500),
    ordem INT DEFAULT 0,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Produtos (Veículos Elétricos e Acessórios)
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    slug VARCHAR(180) UNIQUE NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2),
    preco_promocional NUMERIC(10, 2),
    exibir_preco BOOLEAN DEFAULT false,          -- Se false, exibe 'Consulte no WhatsApp'
    destaque BOOLEAN DEFAULT false,              -- Aparece nas seções de destaque da Home
    status VARCHAR(20) DEFAULT 'publicado' CHECK (status IN ('publicado', 'rascunho', 'oculto')),
    
    -- Especificações Técnicas
    potencia_motor VARCHAR(50),                  -- Ex: "1000W", "2000W"
    tipo_bateria VARCHAR(100),                   -- Ex: "Lítio 60V 20Ah"
    autonomia VARCHAR(50),                       -- Ex: "Até 50 km"
    velocidade_maxima VARCHAR(50),               -- Ex: "32 km/h"
    capacidade_carga VARCHAR(50),                -- Ex: "150 kg"
    tempo_recarga VARCHAR(50),                   -- Ex: "6 a 8 horas"
    dispensa_cnh BOOLEAN DEFAULT true,           -- Destaque regulatório CONTRAN 996/23
    
    video_url VARCHAR(255),                      -- YouTube / vídeo demonstrativo
    ordem INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Galeria de Fotos do Produto
CREATE TABLE IF NOT EXISTS public.produto_imagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(150),
    ordem INT DEFAULT 0,
    is_capa BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Banners Promocionais da Home
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(150),
    subtitulo VARCHAR(255),
    imagem_desktop_url VARCHAR(500) NOT NULL,
    imagem_mobile_url VARCHAR(500),
    link_destino VARCHAR(255),
    posicao VARCHAR(50) DEFAULT 'topo_home',
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_expiracao TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN DEFAULT true,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Configurações Gerais da Loja
CREATE TABLE IF NOT EXISTS public.configuracoes_loja (
    id INT PRIMARY KEY DEFAULT 1,
    nome_loja VARCHAR(100) DEFAULT 'Julia Eletrosom',
    whatsapp_principal VARCHAR(25) DEFAULT '5566984202988',
    mensagem_padrao_whatsapp TEXT DEFAULT 'Olá! Vim pelo site e gostaria de saber mais sobre as motos e veículos elétricos.',
    telefone_fixo VARCHAR(25),
    email_contato VARCHAR(120),
    instagram_url VARCHAR(255),
    endereco_completo TEXT DEFAULT 'Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT',
    cidade VARCHAR(100) DEFAULT 'Cotriguaçu',
    uf VARCHAR(2) DEFAULT 'MT',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir registro inicial de configurações se não existir
INSERT INTO public.configuracoes_loja (id, nome_loja, whatsapp_principal, endereco_completo)
VALUES (1, 'Julia Eletrosom', '5566984202988', 'Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT')
ON CONFLICT (id) DO NOTHING;

-- Inserir Categorias Padrão
INSERT INTO public.categorias (nome, slug, ordem) VALUES
('Autopropelidos', 'autopropelidos', 1),
('Bikes Elétricas', 'bikes-eletricas', 2),
('Triciclos', 'triciclos', 3),
('Patinetes', 'patinetes', 4),
('Acessórios', 'acessorios', 5)
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================
-- PERMISSÕES DE LEITURA PÚBLICA (ROW LEVEL SECURITY)
-- ====================================================================
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_loja ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura livre para visitantes do site
CREATE POLICY "Leitura pública de categorias ativas" ON public.categorias
    FOR SELECT USING (ativa = true);

CREATE POLICY "Leitura pública de produtos publicados" ON public.produtos
    FOR SELECT USING (status = 'publicado');

CREATE POLICY "Leitura pública de imagens de produtos" ON public.produto_imagens
    FOR SELECT USING (true);

CREATE POLICY "Leitura pública de banners ativos" ON public.banners
    FOR SELECT USING (ativo = true);

CREATE POLICY "Leitura pública de configurações" ON public.configuracoes_loja
    FOR SELECT USING (true);

-- Permissões totais para escrita via Service Role (Admin)
CREATE POLICY "Acesso total admin categorias" ON public.categorias
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Acesso total admin produtos" ON public.produtos
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Acesso total admin produto_imagens" ON public.produto_imagens
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Acesso total admin banners" ON public.banners
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Acesso total admin configuracoes" ON public.configuracoes_loja
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- ====================================================================
-- CRIAÇÃO DOS BUCKETS NO SUPABASE STORAGE
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('categorias', 'categorias', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao Storage (público para ver, autenticado/service para enviar)
CREATE POLICY "Visualização pública de fotos de produtos"
ON storage.objects FOR SELECT
USING (bucket_id IN ('produtos', 'banners', 'categorias'));

CREATE POLICY "Envio de fotos de produtos pelo admin"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('produtos', 'banners', 'categorias'));

CREATE POLICY "Atualização e exclusão de fotos pelo admin"
ON storage.objects FOR ALL
USING (bucket_id IN ('produtos', 'banners', 'categorias'));
