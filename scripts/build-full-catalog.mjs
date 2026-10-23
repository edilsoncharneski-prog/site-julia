/**
 * Constrói o catálogo completo a partir do inventário raspado da Soollar.
 * Uso: node scripts/build-full-catalog.mjs [caminho-do-soollar-full.json]
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const inputPath =
  process.argv[2] ||
  join(process.env.TEMP || '.', 'soollar-full.json');
const full = JSON.parse(await readFile(inputPath, 'utf8'));
const basePath = process.argv[3] || 'src/data/produtos-loja.json';
const current = JSON.parse(await readFile(basePath, 'utf8'));

const MODEL_DISPLAY = {
  T1: 'T1',
  B3: 'B3',
  H9: 'H9',
  MZ: 'MZ',
  K007: 'K007',
  G105: 'G105',
  'MG-16': 'MG-16',
  CITYCOCO: 'CityCoco',
  ARTIST: 'Artist',
  'JAZZ E700': 'Jazz E700',
  'QJE-05': 'QJE-05',
  'TJSR-B-035': 'TJSR-B-035',
  'BLACK FISH': 'Black Fish',
  C6: 'C6',
  'RIDE PRO': 'Ride Pro',
  'RIDER PRO': 'Rider Pro',
  ADVANTAGE: 'Advantage',
  AVANT: 'Avant',
  CONNECTION: 'Connection',
  'EXPLORER II': 'Explorer II',
  'FAST TRAIL': 'Fast Trail',
  VOYAGER: 'Voyager',
  WINNER: 'Winner',
  CAPPUCCINO: 'Cappuccino',
  SHARK: 'Shark',
  HARLEY: 'Harley',
  TANK: 'Tank',
  JSL: 'JSL',
};

const CORE_ORDER = [
  'scooter-eletrica-cappuccino-1000w',
  'scooter-eletrica-shark-1000w',
  'scooter-eletrica-h9-1000w',
  'scooter-eletrica-b3-1000w',
  'scooter-eletrica-t1-1000w',
  'bicicleta-eletrica-jsl-1000w',
  'scooter-eletrica-harley-1000w',
];

const OFFICIAL_PRonta_ENTREGA = new Set([
  'scooter-eletrica-cappuccino-1000w|bege',
  'scooter-eletrica-cappuccino-1000w|rosa/bege',
  'scooter-eletrica-cappuccino-1000w|verde/bege',
  'scooter-eletrica-cappuccino-1000w|vermelho/bege',
  'scooter-eletrica-cappuccino-1000w|cinza',
  'scooter-eletrica-shark-1000w|amarelo',
  'scooter-eletrica-shark-1000w|vermelho',
  'scooter-eletrica-h9-1000w|preto/prata',
  'scooter-eletrica-b3-1000w|preto',
  'scooter-eletrica-t1-1000w|azul camaleao',
  'scooter-eletrica-t1-1000w|verde camaleao',
  'scooter-eletrica-t1-1000w|vermelho/prata',
  'bicicleta-eletrica-jsl-1000w|preto/marrom',
  'scooter-eletrica-harley-1000w|azul',
  'scooter-eletrica-harley-1000w|branco',
  'scooter-eletrica-harley-1000w|preto',
  'scooter-eletrica-harley-1000w|vermelho',
]);

const COLOR_HEX = {
  preto: '#151719',
  prata: '#c3c6c9',
  branco: '#f2f2ef',
  cinza: '#7d8288',
  vermelho: '#a52323',
  amarelo: '#f2c200',
  azul: '#1f5a74',
  verde: '#486b4a',
  bege: '#e3d5c3',
  marrom: '#6b4b34',
  laranja: '#e8761a',
  roxo: '#5b2a86',
  gold: '#c9a227',
  dark: '#1a1a1a',
  vinho: '#6e1a2b',
  militar: '#4b5320',
  camaleao: '#2f5d3a',
  'bandeira inglesa': '#1e3a8a',
};

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function colorDisplay(raw) {
  let value = raw.trim().replace(/\s+/g, ' ');
  if (/^AZUL UK$/i.test(value)) value = 'AZUL';
  if (/^BRANCA$/i.test(value)) value = 'BRANCO';
  if (/^PRETA$/i.test(value)) value = 'PRETO';
  value = value.replace(/\bMARRON\b/gi, 'MARROM');

  const accents = {
    CAMALEAO: 'Camaleão',
    MARROM: 'Marrom',
    BEGE: 'Bege',
    VERMELHO: 'Vermelho',
    PRATA: 'Prata',
    PRETO: 'Preto',
    BRANCO: 'Branco',
    CINZA: 'Cinza',
    AZUL: 'Azul',
    VERDE: 'Verde',
    AMARELO: 'Amarelo',
    LARANJA: 'Laranja',
    ROXO: 'Roxo',
    GOLD: 'Gold',
    DARK: 'Dark',
    VINHO: 'Vinho',
    MILITAR: 'Militar',
    INGLESA: 'Inglesa',
    BANDEIRA: 'Bandeira',
  };

  return value
    .split('/')
    .map((part) =>
      part
        .trim()
        .split(' ')
        .map((word) => accents[word.toUpperCase()] || word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ')
    )
    .join('/');
}

function colorStyle(name) {
  const parts = normalize(name).split('/');
  const primaryKey = parts[0].trim();
  const secondaryKey = parts[1]?.trim();
  const primary = COLOR_HEX[primaryKey] || '#3f3f46';
  const secondary = secondaryKey ? COLOR_HEX[secondaryKey] || '#a1a1aa' : undefined;
  return { hex: primary, hex_secundario: secondary };
}

function titleCaseModel(model) {
  const key = model.toUpperCase().replace(/\s+/g, ' ').trim();
  return MODEL_DISPLAY[key] || model.replace(/\w\S*/g, (w) => w.charAt(0) + w.slice(1).toLowerCase());
}

function parseTitle(title) {
  const cleaned = title
    .replace(/^PREVIS[ÃA]O\s*\d{2}\/\d{2}\s*-\s*/i, '')
    .replace(/\s+MARCA\s+.*$/i, '')
    .trim();

  const categoryMatch = cleaned.match(
    /^(SCOOTER|BICICLETA|TRICICLO)\s+(?:EL[EÉ]TRIC[OA]\s+)?(.*)$/i
  );
  if (!categoryMatch) return null;

  const category = categoryMatch[1].toUpperCase();
  const rest = categoryMatch[2];
  const match = rest.match(/^(.*?)\s+(\d+W)\s+(.*?)\s+BATERIA\s+(.*)$/i);
  if (!match) return null;

  const model = match[1].trim();
  const power = match[2].toUpperCase();
  const rawColor = match[3].trim();
  const batteryRaw = match[4].trim();

  return {
    category,
    model,
    power,
    color: colorDisplay(rawColor),
    colorKey: normalize(colorDisplay(rawColor)),
    batteryRaw,
  };
}

function formatBattery(raw) {
  let value = raw
    .replace(/\s+/g, ' ')
    .replace(/^DE\s+/i, '')
    .replace(/\s+(?:ARCA\s+)?NEW\s+E-BIKE.*$/i, '')
    .replace(/\s+MARCA.*$/i, '')
    .trim();

  const match = value.match(/^(.+?\d+V(?:\s*\d+[,.]?\d*\s*AH)?)/i);
  if (match) value = match[1].trim();

  return value
    .replace(/LITIO/gi, 'Lítio')
    .replace(/GRAFENO/gi, 'Grafeno')
    .replace(/CHUMBO/gi, 'Chumbo')
    .replace(/(\d+)AH/gi, '$1Ah')
    .trim();
}

function parsePrice(value) {
  const digits = value.replace(/[^\d,]/g, '').replace(',', '.');
  return Number.parseFloat(digits) || 0;
}

const grouped = new Map();

for (const item of full.catalog) {
  const parsed = parseTitle(item.title);
  if (!parsed) {
    console.warn('IGNORADO', item.code, item.title);
    continue;
  }

  const isScooter = parsed.category === 'SCOOTER';
  const isTricycle = parsed.category === 'TRICICLO';
  const modelDisplay = `${titleCaseModel(parsed.model)} ${parsed.power}`;
  const slugPrefix = isScooter ? 'scooter' : isTricycle ? 'triciclo' : 'bicicleta';
  const slug = `${slugPrefix}-eletrica-${slugify(parsed.model)}-${parsed.power.toLowerCase()}`;
  const categoryLabel = isScooter ? 'Scooter' : isTricycle ? 'Triciclo' : 'Bike';
  const titleLabel = isScooter
    ? 'Scooter Elétrica'
    : isTricycle
      ? 'Triciclo Elétrico'
      : 'Bicicleta Elétrica';

  if (!grouped.has(slug)) {
    grouped.set(slug, {
      slug,
      modelDisplay,
      categoryLabel,
      titleLabel,
      power: parsed.power,
      battery: formatBattery(parsed.batteryRaw),
      prices: [],
      colors: new Map(),
    });
  }

  const model = grouped.get(slug);
  model.prices.push(parsePrice(item.price));

  const color = colorStyle(parsed.color);
  const existing = model.colors.get(parsed.colorKey);
  const candidate = {
    nome: parsed.color,
    hex: color.hex,
    hex_secundario: color.hex_secundario,
    imagemRemota: item.image,
    preco: parsePrice(item.price),
    code: item.code,
    stock: Number(item.stock || 0),
  };

  if (!existing || candidate.preco < existing.preco) {
    model.colors.set(parsed.colorKey, candidate);
  }
}

const currentBySlug = new Map(current.map((product) => [product.slug, product]));
const imageManifest = [];
const result = [];

for (const model of grouped.values()) {
  const currentProduct = currentBySlug.get(model.slug);
  const colors = [...model.colors.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  const mergedColors = [];
  const usedExisting = new Set();

  for (const color of colors) {
    const existingColor = currentProduct?.cores?.find(
      (item) => normalize(item.nome) === normalize(color.nome)
    );

    let merged;
    if (existingColor) {
      usedExisting.add(normalize(existingColor.nome));
      merged = { ...existingColor };
    } else {
      const colorSlug = slugify(color.nome);
      const fileName = `${model.slug.replace(/-/g, '_')}_${colorSlug.replace(/-/g, '_')}.webp`;
      const localPath = `/motos/${fileName}`;
      merged = {
        nome: color.nome,
        hex: color.hex,
        imagem: localPath,
      };
      if (color.hex_secundario) merged.hex_secundario = color.hex_secundario;
      imageManifest.push({
        file: fileName,
        url: color.imagemRemota,
        code: color.code,
        model: model.slug,
        color: color.nome,
      });
    }

    const key = `${model.slug}|${normalize(color.nome)}`;
    merged.disponibilidade = OFFICIAL_PRonta_ENTREGA.has(key)
      ? 'pronta_entrega'
      : 'sob_pedido';
    mergedColors.push(merged);
  }

  for (const existingColor of currentProduct?.cores || []) {
    if (usedExisting.has(normalize(existingColor.nome))) continue;
    const key = `${model.slug}|${normalize(existingColor.nome)}`;
    mergedColors.push({
      ...existingColor,
      disponibilidade: OFFICIAL_PRonta_ENTREGA.has(key) ? 'pronta_entrega' : 'sob_pedido',
    });
  }

  mergedColors.sort((a, b) => {
    const aOfficial = a.disponibilidade === 'pronta_entrega' ? 0 : 1;
    const bOfficial = b.disponibilidade === 'pronta_entrega' ? 0 : 1;
    if (aOfficial !== bOfficial) return aOfficial - bOfficial;
    return a.nome.localeCompare(b.nome);
  });

  const base = currentProduct || {
    id: model.slug,
    nome: `${model.categoryLabel} ${model.modelDisplay}`,
    emoji:
      model.categoryLabel === 'Scooter'
        ? '🛵'
        : model.categoryLabel === 'Triciclo'
          ? '🛺'
          : '🚲',
    titulo: `${model.titleLabel} ${model.modelDisplay}`,
    slug: model.slug,
    categoria: model.categoryLabel,
    categoria_slug:
      model.categoryLabel === 'Scooter'
        ? 'autopropelidos'
        : model.categoryLabel === 'Triciclo'
          ? 'triciclos'
          : 'bikes-eletricas',
    descricao: `${model.titleLabel} ${model.modelDisplay} com motor ${model.power} e bateria ${model.battery}. Consulte cores, disponibilidade e condições de encomenda com a nossa equipe.`,
    preco: Math.min(...model.prices),
    exibir_preco: false,
    destaque: false,
    dispensa_cnh: true,
    potencia_motor: model.power,
    tipo_bateria: model.battery,
    autonomia: 'Consulte no WhatsApp',
    velocidade_maxima: 'Consulte no WhatsApp',
    capacidade_carga: 'Consulte no WhatsApp',
    tempo_recarga: 'Consulte no WhatsApp',
    cores: mergedColors,
  };

  base.cores = mergedColors;
  base.imagem_capa = mergedColors[0]?.imagem;
  result.push(base);
}

result.sort((a, b) => {
  const ai = CORE_ORDER.indexOf(a.slug);
  const bi = CORE_ORDER.indexOf(b.slug);
  if (ai !== -1 || bi !== -1) {
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }
  if (a.categoria !== b.categoria) {
    const order = { Scooter: 0, Triciclo: 1, Bike: 2 };
    return order[a.categoria] - order[b.categoria];
  }
  return a.nome.localeCompare(b.nome);
});

let previousManifest = [];
try {
  previousManifest = JSON.parse(
    await readFile('scripts/soollar-images-full.json', 'utf8')
  );
} catch {
  // Primeira execução: ainda não há manifesto.
}

const manifestByFile = new Map(
  previousManifest.map((item) => [item.file, item])
);
for (const item of imageManifest) manifestByFile.set(item.file, item);
const mergedManifest = [...manifestByFile.values()].sort((a, b) =>
  a.file.localeCompare(b.file)
);

await writeFile('src/data/produtos-loja.json', `${JSON.stringify(result, null, 2)}\n`);
await writeFile(
  'scripts/soollar-images-full.json',
  `${JSON.stringify(mergedManifest, null, 2)}\n`
);

console.log(`Modelos: ${result.length}`);
console.log(
  `Variações: ${result.reduce((total, model) => total + model.cores.length, 0)}`
);
console.log(
  `Pronta entrega: ${result.reduce(
    (total, model) =>
      total + model.cores.filter((color) => color.disponibilidade === 'pronta_entrega').length,
    0
  )}`
);
console.log(`Imagens novas: ${imageManifest.length}`);
for (const model of result) {
  console.log(
    `${model.nome} (${model.cores.length}): ${model.cores
      .map((color) => `${color.nome}${color.disponibilidade === 'pronta_entrega' ? '*' : ''}`)
      .join(', ')}`
  );
}
