-- ====================================================================
-- MIGRAÇÃO: COLUNA DE ESPECIFICAÇÕES TÉCNICAS ESTENDIDAS (JSONB)
-- Eletrosom Ebikes — execute no SQL Editor do Supabase se desejar
-- persistir os campos complementares diretamente na tabela produtos
-- ====================================================================

ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS especificacoes_tecnicas JSONB DEFAULT '{}'::jsonb;
