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

console.log('1. Login na Soollar...');
await page.goto('https://www.soollar.com.br/auth/login', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});

await page.waitForSelector('input[name="email"]', { timeout: 30000 });
await page.type('input[name="email"]', email, { delay: 10 });
await page.type('input[name="password"]', password, { delay: 10 });
await page.evaluate(() => {
  const submit = document.querySelector('button[type="submit"], input[type="submit"]');
  if (submit) submit.click();
});
await new Promise((r) => setTimeout(r, 6000));

console.log('2. Acessando secao ebike...');
await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 4000));

console.log('3. Clicando no primeiro card de produto...');
const clicked = await page.evaluate(() => {
  const card = document.querySelector('[data-testid="product-card"]');
  if (card) {
    card.click();
    return true;
  }
  return false;
});
console.log('Card clicado:', clicked);

await new Promise((r) => setTimeout(r, 5000));
console.log('URL atual após clique:', page.url());

const productPageData = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a')).map((a) => ({
    href: a.href,
    text: a.innerText.trim(),
  }));
  const buttons = Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim());
  return {
    url: window.location.href,
    title: document.title,
    links: links.filter((l) => l.href.includes('drive.google.com') || l.text.toLowerCase().includes('apresenta')),
    allLinks: links,
    buttons,
    body: document.body.innerText,
  };
});

await writeFile('scripts/soollar-product-detail-sample.json', JSON.stringify(productPageData, null, 2));
console.log('Salvo em scripts/soollar-product-detail-sample.json');
console.log('URL:', productPageData.url);
console.log('Drive links encontrados:', productPageData.links);
console.log('Primeiras 1000 letras do body:', productPageData.body.slice(0, 1000));

await browser.close();
