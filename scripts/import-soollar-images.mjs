/**
 * Importa as imagens oficiais da Soollar que faltavam no catálogo,
 * convertendo para WebP (qualidade 85, transparência preservada).
 *
 * Uso: node scripts/import-soollar-images.mjs
 */
import { mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = join(process.cwd(), 'public', 'motos');
const CDN = 'https://d242jwkdtnhx89.cloudfront.net/soollar_prd/products';
const MAX_WIDTH = 1600;
const QUALITY = 85;

const images = [
  {
    file: 'scooter_eletrica_shark_1000w_amarelo.webp',
    id: 'f4a3325d-e9f0-4bad-b36b-29cbcd940ef9',
  },
  {
    file: 'scooter_eletrica_shark_1000w_vermelho.webp',
    id: '0a011ddb-31f6-46b6-ad8b-59a0e50246c7',
  },
  {
    file: 'scooter_eletrica_cappuccino_1000w_bege.webp',
    id: 'e827115d-9ea4-46db-914b-699192a47eea',
  },
  {
    file: 'scooter_eletrica_cappuccino_1000w_verde_bege.webp',
    id: '9c516195-f9e5-4e11-b1ac-d25c09fe8303',
  },
  {
    file: 'scooter_eletrica_cappuccino_1000w_vermelho_bege.webp',
    id: 'cd95f97e-7be0-4570-a06a-89142cb6f5c7',
  },
  {
    file: 'scooter_eletrica_harley_1000w_azul.webp',
    id: 'e1aa6de7-9748-442a-859b-abdf3a2a3994',
  },
  {
    file: 'scooter_eletrica_harley_1000w_preto.webp',
    id: '4154a0ab-0d6d-44c8-8e5b-be0bffc524ed',
  },
  {
    file: 'scooter_eletrica_harley_1000w_amarelo.webp',
    id: '9b3260a8-a668-4898-a3e9-49fe9cc15761',
  },
  {
    file: 'scooter_eletrica_t1_1000w_preto_prata.webp',
    id: '5f4d3d39-40cd-4555-84c6-dd23b25140cd',
  },
];

await mkdir(OUTPUT_DIR, { recursive: true });

for (const image of images) {
  const response = await fetch(`${CDN}/${image.id}.png`);
  if (!response.ok) {
    throw new Error(`${image.file}: HTTP ${response.status}`);
  }

  const input = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(input).metadata();
  let pipeline = sharp(input).rotate();

  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const outputPath = join(OUTPUT_DIR, image.file);
  const info = await pipeline
    .webp({
      quality: QUALITY,
      alphaQuality: 100,
      effort: 5,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const size = (await stat(outputPath)).size;
  console.log(
    `✓ ${image.file} ${info.width}x${info.height} ${(size / 1024).toFixed(0)} KB`
  );
}

console.log('\nImagens oficiais importadas para public/motos/');
