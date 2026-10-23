import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const email = process.env.SOOLLAR_EMAIL;
const password = process.env.SOOLLAR_PASSWORD;

const cds = [
  'cdcuiabamt',
  'cdgoiania',
  'cdaeroportogo',
  'cdmaceioal',
  'cdfeiradesantanaba',
  'cdsaoluisma',
  'cduberlandiamg',
  'cdcampograndems',
  'cdbelempa',
  'cdjoaopessoapb',
  'cdrecifepe',
  'cdteresinapi',
  'cdcampolargopr',
  'cdriodejaneirorj',
  'cdportoalegrers',
  'cdnavegantes',
  'cdaracajuse',
  'cdcampinassp',
  'cdsaobernardo',
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

async function login() {
  await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 2000));
  const buttons = await page.$$('button');
  for (const button of buttons) {
    if ((await button.evaluate((el) => el.innerText.trim())) === 'Veja nosso preço') {
      await button.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 4000));
  await page.waitForSelector('input[name="email"]', { timeout: 30000 });
  await page.type('input[name="email"]', email, { delay: 10 });
  await page.type('input[name="password"]', password, { delay: 10 });
  await page.evaluate(() => {
    const submit = document.querySelector('button[type="submit"], input[type="submit"]');
    if (submit) submit.click();
  });
  await new Promise((r) => setTimeout(r, 8000));
  console.log('LOGIN', page.url());
}

async function extract(slug) {
  await page.goto(`https://www.soollar.com.br/cd/${slug}/secao/ebike`, {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 3000));
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 500);
        y += 500;
        if (y >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  await new Promise((r) => setTimeout(r, 2500));

  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid="product-card"]')).map((card) => {
      const lines = card.innerText.split('\n').map((l) => l.trim()).filter(Boolean);
      const img = card.querySelector('img');
      let original = img?.currentSrc || img?.src || '';
      try {
        const u = new URL(original);
        const inner = u.searchParams.get('url');
        if (inner) original = inner;
      } catch {}
      return {
        title: lines[0] || '',
        code: lines.find((l) => /^\d{6}$/.test(l)) || '',
        price: (card.innerText.match(/R\$\s*[\d.,]+/) || [])[0] || '',
        stock: (card.innerText.match(/Estoque disponível:\s*(\d+)/) || [])[1] || '',
        image: original,
      };
    });
  });
}

await login();

const all = [];
for (const slug of cds) {
  try {
    const cards = await extract(slug);
    console.log(`${slug}: ${cards.length}`);
    for (const card of cards) all.push({ ...card, cd: slug });
  } catch (error) {
    console.warn(`${slug}: ${error.message}`);
  }
}

const unique = new Map();
for (const item of all) {
  const key = item.code || `${item.title}|${item.image}`;
  if (!unique.has(key)) unique.set(key, []);
  unique.get(key).push(item);
}

const catalog = [...unique.entries()].map(([code, items]) => {
  const best = items.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))[0];
  return {
    code,
    title: best.title,
    price: best.price,
    image: best.image,
    cds: items.map((i) => i.cd),
    stocks: Object.fromEntries(items.map((i) => [i.cd, i.stock])),
  };
});

const out = join(process.env.TEMP || '.', 'soollar-full.json');
await writeFile(out, JSON.stringify({ totalCards: all.length, unique: catalog.length, catalog }, null, 2));
console.log(`TOTAL CARDS ${all.length} | UNIQUE ${catalog.length}`);
for (const item of catalog.sort((a, b) => a.title.localeCompare(b.title))) {
  console.log(`${item.code} | ${item.title} | ${item.price}`);
}
console.log('JSON', out);
await browser.close();
