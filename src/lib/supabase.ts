import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wkauvpkkdpkraeawkwzd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente público (chave anon): somente leitura, conforme as políticas de RLS.
// Para escrever (painel /admin) use `getAdminSupabase()` em `lib/supabase-admin.ts`,
// que só roda no servidor.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
