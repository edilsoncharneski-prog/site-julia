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
await page.goto(url, { waitUntil: 'networkidle2' });
await page.waitForSelector('button', { timeout: 15000 });
await new Promise((r) => setTimeout(r, 1500));

// Clica no botão Informações técnicas
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button, div, p, span'));
  const btn = all.find((b) => b.innerText && b.innerText.trim() === 'Informações técnicas');
  if (btn) btn.click();
});
await new Promise((r) => setTimeout(r, 2000));

console.log('PAGE TITLE:', await page.title());
const bodySample = await page.evaluate(() => document.body.innerText.slice(0, 600));
console.log('BODY SAMPLE:', bodySample);

const result = await page.evaluate(() => {
  const body = document.body.innerText;
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  
  // Procura onde começam as especificações
  let startIdx = lines.findIndex((l) => l.toLowerCase().includes('especificações técnicas'));
  if (startIdx !== -1) startIdx += 1;
  else startIdx = lines.findIndex((l) => l.toLowerCase().startsWith('marca:'));

  const specs = {};
  if (startIdx !== -1) {
    for (let i = startIdx; i < Math.min(lines.length, startIdx + 30); i++) {
      const line = lines[i];
      if (line.includes(':')) {
        const colon = line.indexOf(':');
        specs[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
      } else if (line.length > 2 && line.length < 25 && !line.includes('R$') && !line.includes('Informações')) {
        specs[line] = 'Sim';
      }
    }
  }

  return { startIdx, specs };
});

console.log('JSL RESULT:', JSON.stringify(result, null, 2));
await browser.close();
