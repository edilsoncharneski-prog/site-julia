import puppeteer from 'puppeteer-core';
import { writeFile } from 'node:fs/promises';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.goto('https://www.soollar.com.br/auth/login', { waitUntil: 'networkidle2' });
await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', 'julianoeletrosom@hotmail.com');
await page.type('input[name="password"]', 'ju170205');
await page.evaluate(() => document.querySelector('button[type="submit"]').click());
await new Promise((r) => setTimeout(r, 6000));

await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 3000));

const nextData = await page.evaluate(() => window.__NEXT_DATA__);
console.log('has nextData:', !!nextData);
if (nextData) {
  console.log('page:', nextData.page);
  console.log('props keys:', Object.keys(nextData.props || {}));
  console.log('pageProps keys:', Object.keys(nextData.props?.pageProps || {}));
  await writeFile('scripts/soollar-next-data.json', JSON.stringify(nextData, null, 2));
}

await browser.close();
