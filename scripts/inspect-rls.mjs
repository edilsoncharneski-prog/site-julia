// Teste de RLS sem efeito colateral: regrava o MESMO valor de `ordem` numa linha real.
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const envText = await readFile('.env.local', 'utf8');
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

const { data: row } = await anon.from('produtos').select('id, ordem').limit(1).single();
const t1 = await anon.from('produtos').update({ ordem: row.ordem }).eq('id', row.id).select('id');
console.log('anon UPDATE produtos ->', t1.error?.message || `${t1.data.length} linha(s) alteradas`);
const v = await anon.from('produto_variacoes').select('id, ordem').limit(1).single();
const t2 = await anon.from('produto_variacoes').update({ ordem: v.data.ordem }).eq('id', v.data.id).select('id');
console.log('anon UPDATE variacoes ->', t2.error?.message || `${t2.data.length} linha(s) alteradas`);
