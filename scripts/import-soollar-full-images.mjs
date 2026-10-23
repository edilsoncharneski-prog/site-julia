/**
 * Importa as imagens do catálogo completo da Soollar para public/motos.
 * Lê o manifesto gerado por scripts/build-full-catalog.mjs.
 *
 * Uso: node scripts/import-soollar-full-images.mjs
 */
import { mkdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const manifest = JSON.parse(
  await readFile('scripts/soollar-images-full.json', 'utf8')
);
const OUTPUT_DIR = join(process.cwd(), 'public', 'motos');
const MAX_WIDTH = 1600;
const QUALITY = 85;

await mkdir(OUTPUT_DIR, { recursive: true });

let imported = 0;
let failed = 0;

for (const [index, item] of manifest.entries()) {
  try {
    const response = await fetch(item.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const input = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(input).metadata();
    let pipeline = sharp(input).rotate();

    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    const outputPath = join(OUTPUT_DIR, item.file);
    const info = await pipeline
      .webp({
        quality: QUALITY,
        alphaQuality: 100,
        effort: 5,
        smartSubsample: true,
      })
      .toFile(outputPath);

    const size = (await stat(outputPath)).size;
    imported += 1;
    console.log(
      `[${index + 1}/${manifest.length}] ✓ ${item.file} ${info.width}x${info.height} ${(size / 1024).toFixed(0)} KB`
    );
  } catch (error) {
    failed += 1;
    console.error(`[${index + 1}/${manifest.length}] ✗ ${item.file}: ${error.message}`);
  }
}

console.log(`\nImportadas ${imported} imagens; ${failed} falhas.`);
if (failed > 0) process.exitCode = 1;
