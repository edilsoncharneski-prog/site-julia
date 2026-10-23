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

const url = 'https://www.soollar.com.br/cd/cdcuiabamt/produto/b4b1024c-ec74-4ece-8233-74668c866ccc';
console.log('Navegando para JSL:', url);
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));

const textBefore = await page.evaluate(() => document.body.innerText);
console.log('TEXTO JSL (antes do clique na aba):');
console.log(textBefore.slice(textBefore.indexOf('Vendido e entregue'), textBefore.indexOf('Acompanhe nas redes')));

// Clica em Informações técnicas
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button, div, p, span, a'));
  const target = all.find((el) => el.innerText && el.innerText.trim() === 'Informações técnicas');
  if (target) target.click();
});
await new Promise((r) => setTimeout(r, 2000));

const textAfter = await page.evaluate(() => document.body.innerText);
console.log('\nTEXTO JSL (depois do clique na aba):');
console.log(textAfter.slice(textAfter.indexOf('Vendido e entregue'), textAfter.indexOf('Acompanhe nas redes')));

await browser.close();
