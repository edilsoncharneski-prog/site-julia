import puppeteer from 'puppeteer-core';
import { readFile, writeFile } from 'node:fs/promises';

const cookies = JSON.parse(await readFile('scripts/soollar-cookies.json', 'utf8'));

const cds = [
  'cdcuiabamt',
  'cdaeroportogo',
  'cdsaobernardo',
  'cdgoiania',
  'cdcampinassp',
  'cdrecifepe',
  'cduberlandiamg',
];

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

console.log('Iniciando varredura com cookies autenticados...');

const modelSpecs = {};
const allCatalogItems = [];

async function identifyDriveVideo(driveLinks) {
  if (!driveLinks || driveLinks.length === 0) return null;
  for (const rawUrl of driveLinks) {
    try {
      const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) continue;
      const fileId = match[1];
      const res = await fetch(`https://drive.google.com/file/d/${fileId}/view`);
      const html = await res.text();
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].toLowerCase() : '';
      console.log(`Drive link ${fileId} título: ${title}`);
      if (
        title.includes('video') ||
        title.includes('vídeo') ||
        title.includes('apresenta') ||
        title.includes('montagem') ||
        title.includes('.mp4') ||
        title.includes('.mov')
      ) {
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    } catch (e) {
      console.warn(`Erro ao verificar link ${rawUrl}:`, e.message);
    }
  }
  // Se houver link e nenhum for PDF explícito, pega o último (frequentemente o de apresentação)
  const nonPdf = driveLinks.find((l) => !l.toLowerCase().includes('.pdf'));
  return nonPdf || driveLinks[0] || null;
}

for (const cd of cds) {
  console.log(`\n=============================`);
  console.log(`=== Acessando CD: ${cd} ===`);
  console.log(`=============================`);

  try {
    await page.goto(`https://www.soollar.com.br/cd/${cd}/secao/ebike`, {
      waitUntil: 'networkidle2',
      timeout: 45000,
    });
    await new Promise((r) => setTimeout(r, 2500));

    // Rola a página para baixo
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const timer = setInterval(() => {
          window.scrollBy(0, 600);
          y += 600;
          if (y >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await new Promise((r) => setTimeout(r, 2000));

    const cards = await page.evaluate(() => {
      const elCards = Array.from(document.querySelectorAll('[data-testid="product-card"]'));
      return elCards.map((c, idx) => {
        const text = c.innerText;
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        const code = lines.find((l) => /^\d{6}$/.test(l)) || '';
        const title = lines[0] || '';
        const img = c.querySelector('img');
        let src = img?.currentSrc || img?.src || '';
        if (src.includes('url=')) {
          const m = src.match(/url=([^&]+)/);
          if (m) src = decodeURIComponent(m[1]);
        }
        return { idx, code, title, img: src };
      });
    });

    console.log(`Encontrados ${cards.length} cards em ${cd}`);

    for (const card of cards) {
      if (!card.title || !card.code) continue;

      allCatalogItems.push({ ...card, cd });

      // Extrai modelo base
      const cleanTitle = card.title
        .replace(/PREVIS[ÃA]O\s+\d{1,2}\/\d{1,2}\s*-\s*/gi, '')
        .trim();
      const match = cleanTitle.match(
        /(?:SCOOTER\s+(?:EL[EÉ]TRICA\s+)?|BICICLETA\s+(?:EL[EÉ]TRICA\s+)?|EBIKE\s+|TRICICLO\s+(?:EL[EÉ]TRICO\s+)?)([A-Z0-9\-\s]+?)\s+\d+W/i
      );
      const modelKey = match ? match[1].trim().toUpperCase() : cleanTitle.slice(0, 20).toUpperCase();

      if (modelSpecs[modelKey]) {
        // Já capturamos este modelo! Pula para o próximo.
        continue;
      }

      console.log(`\n--> Capturando Ficha Técnica do Modelo: ${modelKey} (Código: ${card.code})...`);

      // Clica no card
      await page.evaluate((index) => {
        const c = document.querySelectorAll('[data-testid="product-card"]')[index];
        if (c) c.click();
      }, card.idx);

      await new Promise((r) => setTimeout(r, 4500));

      // Extrai links do drive da aba inicial (Sobre o produto)
      const pageData = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="drive.google.com"]'));
        const driveLinks = anchors.map((a) => a.href);
        const desc = document.querySelector('.nml__editor__content, [class*="description"]')?.innerText || '';
        return { driveLinks, desc };
      });

      // Clica na aba "Informações técnicas"
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
        const infoTec = tabs.find(
          (t) =>
            t.innerText.toLowerCase().includes('informa') &&
            t.innerText.toLowerCase().includes('téc')
        );
        if (infoTec) infoTec.click();
      });
      await new Promise((r) => setTimeout(r, 2000));

      // Extrai a ficha técnica detalhada
      const specs = await page.evaluate(() => {
        const body = document.body.innerText;
        const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
        const techIdx = lines.findIndex(
          (l) =>
            l.toLowerCase().includes('especificações técnicas') ||
            l.toLowerCase().includes('informações técnicas')
        );
        const obj = {};
        if (techIdx !== -1) {
          for (let j = techIdx + 1; j < Math.min(lines.length, techIdx + 40); j++) {
            const line = lines[j];
            if (line.includes(':')) {
              const colon = line.indexOf(':');
              const k = line.slice(0, colon).trim();
              const v = line.slice(colon + 1).trim();
              if (k && v) obj[k] = v;
            } else if (
              line.includes('Produtos compatíveis') ||
              line.includes('Acompanhe nas redes') ||
              line.includes('Informações complementares')
            ) {
              break;
            }
          }
        }
        return obj;
      });

      const videoUrl = await identifyDriveVideo(pageData.driveLinks);

      modelSpecs[modelKey] = {
        modelKey,
        sampleTitle: card.title,
        sampleCode: card.code,
        cleanTitle,
        driveLinks: pageData.driveLinks,
        videoUrl,
        desc: pageData.desc,
        specs,
        productUrl: page.url(),
      };

      console.log(`[OK] ${modelKey}: ${Object.keys(specs).length} campos técnicos.`);
      if (videoUrl) console.log(`[VÍDEO DRIVE]: ${videoUrl}`);

      // Volta para a lista de ebike do CD atual
      await page.goto(`https://www.soollar.com.br/cd/${cd}/secao/ebike`, {
        waitUntil: 'networkidle2',
        timeout: 45000,
      });
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (err) {
    console.warn(`Erro no CD ${cd}:`, err.message);
  }
}

await writeFile('scripts/soollar-models-specs.json', JSON.stringify(modelSpecs, null, 2));
await writeFile('scripts/soollar-all-raw-products.json', JSON.stringify(allCatalogItems, null, 2));

console.log(`\n=== FIM! ${Object.keys(modelSpecs).length} modelos extraídos com sucesso! ===`);
await browser.close();
