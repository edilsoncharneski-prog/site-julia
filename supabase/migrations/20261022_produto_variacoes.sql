-- ====================================================================
-- MIGRAÇÃO: VARIAÇÕES DE COR E DISPONIBILIDADE POR VARIAÇÃO
-- Eletrosom Ebikes — execute no SQL Editor do Supabase
-- ====================================================================

-- Campos de apresentação que a vitrine usa por modelo
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS nome VARCHAR(150),
  ADD COLUMN IF NOT EXISTS emoji VARCHAR(10),
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(200),
  ADD COLUMN IF NOT EXISTS imagem_capa VARCHAR(500);

-- Tabela de variações (uma linha por cor)
CREATE TABLE IF NOT EXISTS public.produto_variacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL,
    hex VARCHAR(7) NOT NULL,
    hex_secundario VARCHAR(7),
    imagem VARCHAR(500) NOT NULL,
    disponibilidade VARCHAR(20) NOT NULL DEFAULT 'sob_pedido'
        CHECK (disponibilidade IN ('pronta_entrega', 'sob_pedido')),
    slug_legado VARCHAR(180),
    ordem INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (produto_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_produto_variacoes_produto
  ON public.produto_variacoes (produto_id, ordem);

CREATE INDEX IF NOT EXISTS idx_produto_variacoes_disponibilidade
  ON public.produto_variacoes (disponibilidade);

CREATE INDEX IF NOT EXISTS idx_produto_variacoes_slug_legado
  ON public.produto_variacoes (slug_legado);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_produto_variacoes_updated_at ON public.produto_variacoes;
CREATE TRIGGER trg_produto_variacoes_updated_at
  BEFORE UPDATE ON public.produto_variacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.produto_variacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de variações" ON public.produto_variacoes;
CREATE POLICY "Leitura pública de variações" ON public.produto_variacoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Acesso total admin variações" ON public.produto_variacoes;
CREATE POLICY "Acesso total admin variações" ON public.produto_variacoes
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
