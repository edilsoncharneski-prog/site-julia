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
await page.setViewport({ width: 1440, height: 1000 });
await page.setCookie(...cookies);

const url = 'https://www.soollar.com.br/cd/cdcuiabamt/produto/42522a17-33a2-4331-8dd6-99cdbb805686';
console.log('Navegando para:', url);
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));

const buttonsBefore = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim());
});
console.log('Botões na tela:', buttonsBefore);

// Clica no botão que tem Informações técnicas
const clicked = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button, div, p, span, a'));
  const target = all.find((el) => el.innerText && el.innerText.trim() === 'Informações técnicas');
  if (target) {
    target.click();
    return { tag: target.tagName, text: target.innerText };
  }
  return null;
});
console.log('Elemento clicado:', clicked);

await new Promise((r) => setTimeout(r, 2500));

const bodySnippet = await page.evaluate(() => {
  const lines = document.body.innerText.split('\n').map((l) => l.trim()).filter(Boolean);
  const idx = lines.findIndex((l) => l.includes('Informações técnicas'));
  return lines.slice(idx, idx + 40);
});

console.log('Linhas após o clique:', bodySnippet);
await browser.close();
