import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente com a service_role: ignora o RLS e SÓ pode existir no servidor
 * (Server Actions / Server Components). `server-only` impede que este
 * módulo seja importado por qualquer Client Component.
 */
export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados no servidor.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
