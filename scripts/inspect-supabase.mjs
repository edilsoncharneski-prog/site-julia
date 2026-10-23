// Diagnóstico somente leitura do Supabase (não altera dados).
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const envText = await readFile('.env.local', 'utf8').catch(() => '');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
console.log('URL:', url);
const service = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

const p = await service.from('produtos').select('*').limit(1);
console.log('produtos (service):', p.error?.message || `ok, colunas: ${Object.keys(p.data[0] || {}).join(', ')}`);
const c = await service.from('produtos').select('id', { count: 'exact', head: true });
console.log('total produtos:', c.count, c.error?.message || '');
const v = await service.from('produto_variacoes').select('id', { count: 'exact', head: true });
console.log('total variacoes:', v.count, v.error?.message || '');

// Teste de RLS: o anon NÃO deve conseguir escrever.
const probe = await anon.from('produtos').update({ destaque: false }).eq('slug', '__inexistente__').select();
console.log('anon update (esperado: 0 linhas ou erro RLS):', probe.error?.message || `${probe.data.length} linhas`);
const rd = await anon.from('produtos').select('id', { count: 'exact', head: true });
console.log('anon leitura produtos:', rd.count, rd.error?.message || '');
