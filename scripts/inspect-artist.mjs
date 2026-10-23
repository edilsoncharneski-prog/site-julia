import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';

const cookies = JSON.parse(await readFile('scripts/soollar-cookies.json', 'utf8'));

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

const url = 'https://www.soollar.com.br/cd/cdsaobernardo/produto/696cbf50-1f3f-48c1-bd54-0b50289ffaf6';
await page.goto(url, { waitUntil: 'networkidle2' });
await page.waitForSelector('button');
await new Promise((r) => setTimeout(r, 1500));

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button, div, p, span')).find(
    (el) => el.innerText && el.innerText.trim() === 'Informações técnicas'
  );
  if (b) b.click();
});
await new Promise((r) => setTimeout(r, 2000));

const text = await page.evaluate(() => document.body.innerText);
const idx = text.indexOf('Informações técnicas');
console.log('TEXTO ARTIST:');
console.log(text.slice(idx, idx + 1200));

await browser.close();
