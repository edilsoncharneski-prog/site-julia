import puppeteer from 'puppeteer-core';
import { writeFile } from 'node:fs/promises';

const email = 'julianoeletrosom@hotmail.com';
const password = 'ju170205';

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

// Login seguro
await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 2000));

const buttons = await page.$$('button');
for (const b of buttons) {
  const t = await b.evaluate((el) => el.innerText.trim());
  if (t === 'Veja nosso preço') {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 3000));
await page.waitForSelector('input[name="email"]', { timeout: 30000 });
await page.type('input[name="email"]', email, { delay: 10 });
await page.type('input[name="password"]', password, { delay: 10 });
await page.evaluate(() => document.querySelector('button[type="submit"]').click());
await new Promise((r) => setTimeout(r, 6000));

console.log('Login concluído!');

// Testar raspagem de dados em 3 cards
await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 3000));

// Rolar para carregar
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

const cardCount = await page.evaluate(() => document.querySelectorAll('[data-testid="product-card"]').length);
console.log(`Total de cards no CD Cuiabá: ${cardCount}`);

const results = [];

for (let i = 0; i < Math.min(cardCount, 3); i++) {
  console.log(`Abrindo produto ${i + 1}...`);
  // Clica no card de índice i
  await page.evaluate((idx) => {
    const cards = document.querySelectorAll('[data-testid="product-card"]');
    if (cards[idx]) cards[idx].click();
  }, i);

  await new Promise((r) => setTimeout(r, 4000));

  // Clica na aba Informações Técnicas
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
    const infoTec = tabs.find((t) => t.innerText.includes('Informações técnicas'));
    if (infoTec) infoTec.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const productData = await page.evaluate(() => {
    const title = document.querySelector('h1, [data-testid="product-name"]')?.innerText || document.title;
    const body = document.body.innerText;
    
    // Links do Google Drive
    const driveAnchors = Array.from(document.querySelectorAll('a[href*="drive.google.com"]'));
    const driveLinks = driveAnchors.map((a) => a.href);

    // Linhas de informações técnicas
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    const techIdx = lines.findIndex((l) => l.includes('Especificações Técnicas') || l.includes('Informações técnicas'));
    
    const specs = {};
    if (techIdx !== -1) {
      for (let j = techIdx + 1; j < Math.min(lines.length, techIdx + 30); j++) {
        const line = lines[j];
        if (line.includes(':')) {
          const [k, ...v] = line.split(':');
          specs[k.trim()] = v.join(':').trim();
        } else if (line.includes('Produtos compatíveis') || line.includes('Acompanhe nas redes')) {
          break;
        }
      }
    }

    return {
      url: window.location.href,
      title,
      driveLinks,
      specs,
    };
  });

  console.log(`Produto ${i + 1}:`, productData.title);
  console.log(`Specs ${i + 1}:`, productData.specs);
  console.log(`Drive Links ${i + 1}:`, productData.driveLinks);
  results.push(productData);

  // Volta para a página de ebike
  await page.goBack({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
}

await writeFile('scripts/soollar-sample-results.json', JSON.stringify(results, null, 2));
console.log('Salvo em scripts/soollar-sample-results.json');
await browser.close();
