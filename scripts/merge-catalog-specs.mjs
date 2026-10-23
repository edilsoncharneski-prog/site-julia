import { readFile, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const rawProds = JSON.parse(await readFile('src/data/produtos-loja.json', 'utf8'));
const soollarSpecs = JSON.parse(await readFile('scripts/soollar-models-specs.json', 'utf8'));

// Exact 17 physical stock variations
const prontaEntregaMap = {
  'scooter-eletrica-cappuccino-1000w': ['Bege', 'Cinza', 'Rosa/Bege', 'Verde/Bege', 'Vermelho/Bege'],
  'scooter-eletrica-shark-1000w': ['Amarelo', 'Vermelho'],
  'scooter-eletrica-h9-1000w': ['Preto/Prata'],
  'scooter-eletrica-b3-1000w': ['Preto'],
  'scooter-eletrica-t1-1000w': ['Azul Camaleão', 'Verde Camaleão', 'Vermelho/Prata'],
  'bicicleta-eletrica-jsl-1000w': ['Preto/Marrom'],
  'scooter-eletrica-harley-1000w': ['Azul', 'Branco', 'Preto', 'Vermelho'],
};

const findSpec = (prod) => {
  const norm = (prod.slug + ' ' + prod.nome).toUpperCase();
  for (const k of Object.keys(soollarSpecs)) {
    if (norm.includes(k) || norm.replace(/-/g, ' ').includes(k.replace(/-/g, ' '))) {
      return { k, s: soollarSpecs[k] };
    }
  }
  return null;
};

let prontaTotal = 0;
let sobPedidoTotal = 0;

for (const prod of rawProds) {
  const match = findSpec(prod);
  const specObj = match ? match.s : null;

  if (specObj) {
    if (specObj.videoUrl) {
      prod.video_url = specObj.videoUrl;
    }

    // Build comprehensive technical specifications
    const specs = { ...(specObj.specs || {}) };

    // Fill bicycle / triciclo specifications if table was empty
    if (Object.keys(specs).length === 0) {
      if (prod.slug.includes('t5')) {
        specs['Marca'] = 'GTS';
        specs['Linha'] = 'T5 Triciclo';
        specs['Motor Elétrico'] = '500W';
        specs['Bateria'] = 'Chumbo 60V 20Ah';
        specs['Velocidade Máxima'] = '25 km/h';
        specs['Autonomia'] = 'Até 45 km';
        specs['Tempo de Recarga'] = '6 a 8 horas';
        specs['Capacidade máxima de carga'] = '160 kg';
        specs['Painel'] = 'Digital LED';
        specs['Freios'] = 'Tambor dianteiro e traseiro';
        specs['Rodas'] = 'Aro reforçado';
      } else if (prod.categoria_slug === 'bicicletas' || prod.slug.includes('bicicleta')) {
        specs['Marca'] = prod.slug.includes('c6') || prod.slug.includes('black-fish') ? 'GTS' : 'Konnan';
        specs['Modelo'] = prod.nome;
        specs['Motor Elétrico'] = prod.potencia_motor || '750W';
        specs['Bateria'] = prod.tipo_bateria || 'Lítio 48V 18,2Ah';
        specs['Velocidade Máxima'] = prod.velocidade_maxima || '32 km/h';
        specs['Autonomia'] = prod.autonomia || 'Até 45 km';
        specs['Tempo de Recarga'] = prod.tempo_recarga || '4 a 6 horas';
        specs['Capacidade máxima de carga'] = prod.capacidade_carga || '120 kg';
        specs['Sistema'] = 'Pedalada Assistida (PAS) e Acelerador';
        specs['Pneus/Rodas'] = prod.slug.includes('c6') ? 'Aro 14' : 'Aro 20 Fat Tire';
        specs['Freios'] = 'Disco dianteiro e traseiro';
        specs['Suspensão'] = 'Dianteira e central';
      }
    }

    // Ensure core fields are populated
    if (specs['Motor Elétrico']) prod.potencia_motor = specs['Motor Elétrico'];
    if (specs['Bateria']) prod.tipo_bateria = specs['Bateria'];
    if (specs['Autonomia']) prod.autonomia = specs['Autonomia'];
    if (specs['Velocidade Máxima']) prod.velocidade_maxima = specs['Velocidade Máxima'];
    if (specs['Tempo de Recarga']) prod.tempo_recarga = specs['Tempo de Recarga'];
    if (specs['Capacidade máxima de carga']) prod.capacidade_carga = specs['Capacidade máxima de carga'];

    prod.especificacoes_tecnicas = specs;
  }

  // Enforce the 17 physical stock variations
  const allowedPronta = prontaEntregaMap[prod.slug] || [];
  for (const c of prod.cores) {
    if (allowedPronta.includes(c.nome)) {
      c.disponibilidade = 'pronta_entrega';
      prontaTotal++;
    } else {
      c.disponibilidade = 'sob_pedido';
      sobPedidoTotal++;
    }
  }
}

console.log(`Pronta entrega: ${prontaTotal} (esperado 17)`);
console.log(`Sob pedido: ${sobPedidoTotal}`);

await writeFile('src/data/produtos-loja.json', JSON.stringify(rawProds, null, 2), 'utf8');
console.log('src/data/produtos-loja.json updated successfully!');

// Now sync to Supabase
console.log('Syncing to Supabase...');
for (const prod of rawProds) {
  // Update product row
  const { data: dbProd, error: pErr } = await supabase
    .from('produtos')
    .update({
      video_url: prod.video_url || null,
      potencia_motor: prod.potencia_motor || null,
      tipo_bateria: prod.tipo_bateria || null,
      autonomia: prod.autonomia || null,
      velocidade_maxima: prod.velocidade_maxima || null,
      capacidade_carga: prod.capacidade_carga || null,
      tempo_recarga: prod.tempo_recarga || null,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', prod.slug)
    .select('id');

  if (pErr) {
    console.error(`Erro ao atualizar produto ${prod.slug}:`, pErr.message);
    continue;
  }

  const productId = dbProd?.[0]?.id;
  if (!productId) continue;

  // Sync variations
  for (const c of prod.cores) {
    const { error: vErr } = await supabase
      .from('produto_variacoes')
      .update({
        disponibilidade: c.disponibilidade,
        updated_at: new Date().toISOString(),
      })
      .eq('produto_id', productId)
      .eq('nome', c.nome);

    if (vErr) {
      console.error(`Erro ao atualizar variacao ${prod.slug} / ${c.nome}:`, vErr.message);
    }
  }
}

console.log('Supabase sync complete!');
