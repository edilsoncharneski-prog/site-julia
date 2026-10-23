/**
 * Gera os assets da marca Eletrosom Ebikes (logo, ícone e imagem Open Graph)
 * a partir de SVGs vetoriais, usando sharp.
 *
 * Uso: npm run brand:assets
 */
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = join(process.cwd(), 'public');
const MOTOS_DIR = join(PUBLIC_DIR, 'motos');
const FONT = "'Segoe UI', Arial, Helvetica, sans-serif";

const boltPath =
  'M286 34 118 282h102l-38 196 190-266H256l30-178Z';

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#111111"/>
  <path d="${boltPath}" fill="#FACC15" transform="translate(22 22) scale(0.86)"/>
</svg>`;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320">
  <rect x="10" y="30" width="260" height="260" rx="60" fill="#111111"/>
  <path d="${boltPath}" fill="#FACC15" transform="translate(34 52) scale(0.72)"/>
  <text x="318" y="168" font-family="${FONT}" font-size="128" font-weight="900" letter-spacing="-4" fill="#111111">ELETROSOM</text>
  <text x="322" y="250" font-family="${FONT}" font-size="68" font-weight="600" letter-spacing="18" fill="#EAB308">EBIKES</text>
</svg>`;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F7F7F5"/>
  <rect x="0" y="0" width="14" height="630" fill="#FACC15"/>
  <rect x="72" y="82" width="112" height="112" rx="26" fill="#111111"/>
  <path d="${boltPath}" fill="#FACC15" transform="translate(84 92) scale(0.3)"/>
  <text x="206" y="146" font-family="${FONT}" font-size="48" font-weight="900" letter-spacing="-1.5" fill="#111111">ELETROSOM</text>
  <text x="208" y="190" font-family="${FONT}" font-size="27" font-weight="600" letter-spacing="8" fill="#EAB308">EBIKES</text>
  <text x="74" y="360" font-family="${FONT}" font-size="64" font-weight="700" letter-spacing="-1.5" fill="#111111">Mobilidade elétrica</text>
  <text x="74" y="432" font-family="${FONT}" font-size="64" font-weight="700" letter-spacing="-1.5" fill="#111111">em Cotriguaçu-MT</text>
  <text x="76" y="502" font-family="${FONT}" font-size="27" font-weight="500" fill="#6B7280">Sem CNH • Até 21x no cartão • Garantia de fábrica</text>
  <rect x="74" y="548" width="244" height="2" fill="#D1D5DB"/>
  <text x="74" y="590" font-family="${FONT}" font-size="22" font-weight="600" letter-spacing="2" fill="#9CA3AF">ELETROSOM EBIKES</text>
</svg>`;

await mkdir(PUBLIC_DIR, { recursive: true });

await sharp(Buffer.from(iconSvg)).png().toFile(join(PUBLIC_DIR, 'icon.png'));
await sharp(Buffer.from(iconSvg)).resize(180, 180).png().toFile(join(PUBLIC_DIR, 'apple-icon.png'));
await sharp(Buffer.from(iconSvg)).resize(64, 64).png().toFile(join(PUBLIC_DIR, 'favicon.png'));
await sharp(Buffer.from(logoSvg)).png().toFile(join(PUBLIC_DIR, 'logo.png'));

const ogBase = await sharp(Buffer.from(ogSvg)).png().toBuffer();
const product = await sharp(join(MOTOS_DIR, 'scooter_eletrica_t1_1000w_vermelho_prata_3.webp'))
  .resize({ width: 500, height: 500, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(ogBase)
  .composite([{ input: product, left: 650, top: 105 }])
  .png()
  .toFile(join(PUBLIC_DIR, 'og-eletrosom-ebikes.png'));

console.log('Assets gerados: logo.png, icon.png, apple-icon.png, favicon.png, og-eletrosom-ebikes.png');
