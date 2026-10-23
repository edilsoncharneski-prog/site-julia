import { createClient } from '@supabase/supabase-js';

const CANONICAL_SUPABASE_URL = 'https://wkauvpkkdpkraeawkwzd.supabase.co';
const PUBLIC_ANON_FALLBACK =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYXV2cGtrZHBrcmFlYXdrd3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODg5MTEsImV4cCI6MjEwODI2NDkxMX0.D-jKrAoTciy-uRHicHUcVRyzhS0GbuYnhKQEJzh5tnI';

export function getNormalizedSupabaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  if (!raw || raw.includes('wkauvpk')) {
    return CANONICAL_SUPABASE_URL;
  }
  return raw;
}

const supabaseUrl = getNormalizedSupabaseUrl();
const supabaseAnonKey =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() || PUBLIC_ANON_FALLBACK;

// Cliente público (chave anon): somente leitura, protegido pelas políticas de RLS.
// Usa cache: 'no-store' para garantir atualização em tempo real após alterações no painel.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  },
});
