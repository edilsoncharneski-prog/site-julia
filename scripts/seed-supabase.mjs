/**
 * Sincroniza o catálogo local (src/data/produtos-loja.json) com o Supabase.
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
 *
 * Uso: npm run db:seed
 */
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import products from '../src/data/produtos-loja.json' with { type: 'json' };

const envText = await readFile('.env.local', 'utf8').catch(() => '');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: pingError } = await supabase
  .from('produtos')
  .select('id', { head: true, count: 'exact' });

if (pingError) {
  console.error(`Não foi possível ligar ao Supabase (${url}): ${pingError.message}`);
  process.exit(1);
}

const { error: variantsTableError } = await supabase
  .from('produto_variacoes')
  .select('id')
  .limit(1);

if (variantsTableError) {
  console.error(
    'A tabela produto_variacoes ainda não existe. Aplique a migração ' +
      'supabase/migrations/20261022_produto_variacoes.sql antes do seed.'
  );
  console.error(variantsTableError.message);
  process.exit(1);
}

const { data: categories, error: categoriesError } = await supabase
  .from('categorias')
  .select('id, slug');

if (categoriesError) {
  console.error(`Erro ao ler categorias: ${categoriesError.message}`);
  process.exit(1);
}

const categoryBySlug = new Map((categories || []).map((c) => [c.slug, c.id]));
let failures = 0;

for (const [index, product] of products.entries()) {
  const payload = {
    categoria_id: categoryBySlug.get(product.categoria_slug) || null,
    nome: product.nome,
    emoji: product.emoji || null,
    tagline: product.tagline || null,
    titulo: product.titulo,
    slug: product.slug,
    descricao: product.descricao || null,
    imagem_capa: product.imagem_capa || null,
    preco: product.preco ?? null,
    exibir_preco: product.exibir_preco ?? false,
    destaque: product.destaque ?? false,
    status: 'publicado',
    potencia_motor: product.potencia_motor || null,
    tipo_bateria: product.tipo_bateria || null,
    autonomia: product.autonomia || null,
    velocidade_maxima: product.velocidade_maxima || null,
    capacidade_carga: product.capacidade_carga || null,
    tempo_recarga: product.tempo_recarga || null,
    dispensa_cnh: product.dispensa_cnh ?? true,
    ordem: index,
  };

  const { data: savedProduct, error: productError } = await supabase
    .from('produtos')
    .upsert(payload, { onConflict: 'slug' })
    .select('id, slug')
    .single();

  if (productError || !savedProduct) {
    console.error(`Erro ao gravar ${product.slug}: ${productError?.message}`);
    failures += 1;
    continue;
  }

  const { error: deleteError } = await supabase
    .from('produto_variacoes')
    .delete()
    .eq('produto_id', savedProduct.id);

  if (deleteError) {
    console.error(`Erro ao limpar variações de ${product.slug}: ${deleteError.message}`);
    failures += 1;
    continue;
  }

  const variants = product.cores.map((color, ordem) => ({
    produto_id: savedProduct.id,
    nome: color.nome,
    hex: color.hex,
    hex_secundario: color.hex_secundario || null,
    imagem: color.imagem,
    disponibilidade: color.disponibilidade,
    slug_legado: color.slug_legado || null,
    ordem,
  }));

  const { error: variantsError } = await supabase
    .from('produto_variacoes')
    .insert(variants);

  if (variantsError) {
    console.error(`Erro ao gravar variações de ${product.slug}: ${variantsError.message}`);
    failures += 1;
    continue;
  }

  console.log(`✓ ${product.nome}: ${variants.length} variações`);
}

if (failures > 0) {
  console.error(`\nSincronização interrompida com ${failures} erro(s).`);
  process.exit(1);
}

console.log('\nSincronização concluída.');
