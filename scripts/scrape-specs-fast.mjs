import puppeteer from 'puppeteer-core';
import { readFile, writeFile } from 'node:fs/promises';

const cookies = JSON.parse(await readFile('scripts/soollar-cookies.json', 'utf8'));
const modelsData = JSON.parse(await readFile('scripts/soollar-models-specs.json', 'utf8'));

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
);
await page.setViewport({ width: 1440, height: 1000 });
await page.setCookie(...cookies);

const entries = Object.entries(modelsData);
console.log(`Iniciando extração precisa de especificações para ${entries.length} modelos...`);

for (let i = 0; i < entries.length; i++) {
  const [key, data] = entries[i];
  if (!data.productUrl) continue;

  console.log(`\n[${i + 1}/${entries.length}] Acessando ${key}: ${data.productUrl}`);
  try {
    await page.goto(data.productUrl, { waitUntil: 'networkidle2', timeout: 35000 });
    await page.waitForSelector('button', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Clica no botão "Informações técnicas"
    await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, div, p, span'));
      const btn = all.find((b) => b.innerText && b.innerText.trim() === 'Informações técnicas');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1800));

    const specs = await page.evaluate(() => {
      const body = document.body.innerText;
      const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);

      let startIdx = lines.findIndex((l) => l.toLowerCase().includes('especificações técnicas'));
      if (startIdx !== -1) startIdx += 1;
      else startIdx = lines.findIndex((l) => l.toLowerCase().startsWith('marca:'));

      const res = {};
      if (startIdx !== -1) {
        for (let j = startIdx; j < Math.min(lines.length, startIdx + 35); j++) {
          const line = lines[j];
          if (
            line.toLowerCase().includes('produtos compatíveis') ||
            line.toLowerCase().includes('acompanhe nas redes') ||
            line.toLowerCase().includes('informações complementares') ||
            line.toLowerCase().includes('veja nosso preço') ||
            line.toLowerCase().includes('endereço') ||
            line.toLowerCase().includes('contato')
          ) {
            break;
          }
          if (line.includes(':')) {
            const colon = line.indexOf(':');
            const k = line.slice(0, colon).trim();
            const v = line.slice(colon + 1).trim();
            if (k && v) res[k] = v;
          } else if (line.length > 2 && line.length < 25 && !line.includes('R$')) {
            res[line] = 'Sim';
          }
        }
      }
      return res;
    });

    console.log(`-> ${key}: ${Object.keys(specs).length} campos extraídos:`, Object.keys(specs));
    data.specs = specs;
  } catch (err) {
    console.warn(`Erro em ${key}:`, err.message);
  }
}

await writeFile('scripts/soollar-models-specs.json', JSON.stringify(modelsData, null, 2));
console.log('\n=== Concluído! Todas as especificações técnicas salvas em scripts/soollar-models-specs.json ===');
await browser.close();
