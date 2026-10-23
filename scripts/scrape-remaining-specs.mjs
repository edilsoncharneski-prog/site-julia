import puppeteer from 'puppeteer-core';
import { readFile, writeFile } from 'node:fs/promises';

const cookies = JSON.parse(await readFile('scripts/soollar-cookies.json', 'utf8'));
const specsData = JSON.parse(await readFile('scripts/soollar-models-specs.json', 'utf8'));

const targets = Object.entries(specsData).filter(
  ([k, v]) => Object.keys(v.specs || {}).length === 0 && v.productUrl && v.productUrl.includes('/produto/')
);

console.log(`Remaining targets to parse specs: ${targets.length}`);

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
);
await page.setCookie(...cookies);

for (const [key, item] of targets) {
  try {
    console.log(`Fetching specs for ${key}: ${item.productUrl}...`);
    await page.goto(item.productUrl, { waitUntil: 'networkidle2', timeout: 35000 });
    await page.waitForSelector('button', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Click "Informações técnicas"
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button, div, p, span')).find(
        (el) => el.innerText && el.innerText.trim() === 'Informações técnicas'
      );
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    const fullText = await page.evaluate(() => document.body.innerText);

    const idx = fullText.indexOf('Informações técnicas');
    const relevantText = idx !== -1 ? fullText.slice(idx) : fullText;

    // Cut off before "Quem viu este produto" or "Acompanhe nas redes"
    const endIdx = Math.min(
      ...['Quem viu este produto', 'Acompanhe nas redes', 'Produtos relacionados']
        .map((marker) => {
          const pos = relevantText.indexOf(marker);
          return pos === -1 ? Infinity : pos;
        })
    );
    const specBlock = endIdx !== Infinity ? relevantText.slice(0, endIdx) : relevantText.slice(0, 3000);

    const parsedSpecs = {};
    const lines = specBlock.split('\n').map((l) => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(':')) {
        const colonIdx = line.indexOf(':');
        const k = line.slice(0, colonIdx).trim();
        const v = line.slice(colonIdx + 1).trim();
        if (
          k &&
          v &&
          !['R$', 'http', 'https', 'Quem viu', 'Informações', 'Especificações'].includes(k) &&
          k.length < 40
        ) {
          parsedSpecs[k] = v;
        }
      }
    }

    console.log(`-> ${key}: found ${Object.keys(parsedSpecs).length} fields`);
    if (Object.keys(parsedSpecs).length > 0) {
      specsData[key].specs = parsedSpecs;
      await writeFile('scripts/soollar-models-specs.json', JSON.stringify(specsData, null, 2), 'utf8');
    }
  } catch (err) {
    console.error(`Error on ${key}:`, err.message);
  }
}

await browser.close();
console.log('Finished updating soollar-models-specs.json');
