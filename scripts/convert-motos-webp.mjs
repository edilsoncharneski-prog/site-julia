/**
 * Converte todas as imagens PNG de public/motos para WebP (qualidade 85),
 * preservando o canal alfa (fundo transparente).
 *
 * Uso:
 *   npm run convert:motos
 *   npm run convert:motos -- --delete-originals
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const MOTOS_DIR = join(process.cwd(), 'public', 'motos');
const QUALITY = 85;
const MAX_WIDTH = 1600;
const deleteOriginals = process.argv.includes('--delete-originals');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const entries = await readdir(MOTOS_DIR, { withFileTypes: true });
const pngFiles = entries
  .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === '.png')
  .map((entry) => entry.name)
  .sort();

if (pngFiles.length === 0) {
  console.log('Nenhum PNG encontrado em public/motos.');
  process.exit(0);
}

console.log(`Convertendo ${pngFiles.length} imagem(ns) em public/motos para WebP...\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const fileName of pngFiles) {
  const inputPath = join(MOTOS_DIR, fileName);
  const outputPath = join(MOTOS_DIR, `${basename(fileName, extname(fileName))}.webp`);

  const before = (await stat(inputPath)).size;
  const metadata = await sharp(inputPath).metadata();

  let pipeline = sharp(inputPath).rotate();

  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const info = await pipeline
    .webp({
      quality: QUALITY,
      alphaQuality: 100,
      effort: 5,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const after = (await stat(outputPath)).size;
  totalBefore += before;
  totalAfter += after;

  const reduction = before > 0 ? ((1 - after / before) * 100).toFixed(1) : '0';
  console.log(
    `✓ ${basename(outputPath)}  ${formatBytes(before)} → ${formatBytes(after)} (-${reduction}%)  ${info.width}x${info.height}`
  );

  if (deleteOriginals) {
    await unlink(inputPath);
  }
}

const totalReduction = totalBefore > 0 ? ((1 - totalAfter / totalBefore) * 100).toFixed(1) : '0';
console.log(
  `\nConcluído: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} (-${totalReduction}% no total).`
);
if (deleteOriginals) {
  console.log('PNGs originais removidos.');
}
