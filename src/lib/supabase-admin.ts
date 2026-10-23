import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getNormalizedSupabaseUrl } from '@/lib/supabase';

/**
 * Cliente administrativo (service_role): ignora o RLS e SÓ pode existir no servidor
 * (Server Actions / Server Components). `server-only` impede que este
 * módulo seja importado por qualquer Client Component.
 */
export function getAdminSupabase() {
  const url = getNormalizedSupabaseUrl();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !serviceKey) {
    throw new Error(
      'Configuração de servidor incompleta (SUPABASE_SERVICE_ROLE_KEY ausente).'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
