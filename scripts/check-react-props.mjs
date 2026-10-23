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
await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', { waitUntil: 'networkidle2' });
const buttons = await page.$$('button');
for (const b of buttons) {
  const t = await b.evaluate((el) => el.innerText.trim());
  if (t === 'Veja nosso preço') {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 2000));
await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', email);
await page.type('input[name="password"]', password);
await page.evaluate(() => document.querySelector('button[type="submit"]').click());
await new Promise((r) => setTimeout(r, 6000));

await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 3000));

const reactProps = await page.evaluate(() => {
  const card = document.querySelector('[data-testid="product-card"]');
  if (!card) return null;
  const propKey = Object.keys(card).find((k) => k.startsWith('__reactProps'));
  const fiberKey = Object.keys(card).find((k) => k.startsWith('__reactFiber'));
  const props = propKey ? card[propKey] : null;
  const fiber = fiberKey ? card[fiberKey] : null;

  // Busca em props
  let product = null;
  function search(obj, depth = 0) {
    if (!obj || depth > 4 || product) return;
    if (obj.product || obj.item) {
      product = obj.product || obj.item;
      return;
    }
    if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'object') search(obj[k], depth + 1);
      }
    }
  }
  search(props);
  return {
    propKeys: Object.keys(card).filter((k) => k.startsWith('__react')),
    foundProduct: product,
  };
});

console.log('React props result:', JSON.stringify(reactProps, null, 2));
await browser.close();
