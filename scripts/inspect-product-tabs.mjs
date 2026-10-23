import puppeteer from 'puppeteer-core';
import { writeFile } from 'node:fs/promises';

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

// Usar cookies ou logar
await page.goto('https://www.soollar.com.br/auth/login', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('input[name="email"]', { timeout: 30000 });
await page.type('input[name="email"]', 'julianoeletrosom@hotmail.com', { delay: 10 });
await page.type('input[name="password"]', 'ju170205', { delay: 10 });
await page.evaluate(() => {
  const submit = document.querySelector('button[type="submit"], input[type="submit"]');
  if (submit) submit.click();
});
await new Promise((r) => setTimeout(r, 6000));

await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/produto/022a27cd-fc3a-4d96-a882-253920ba9a50', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 3000));

// Identificar botões de drive
const driveElements = await page.evaluate(() => {
  const anchors = Array.from(document.querySelectorAll('a[href*="drive.google.com"]'));
  return anchors.map((a) => ({
    href: a.href,
    text: a.innerText,
    parentText: a.parentElement?.innerText,
    grandParentText: a.parentElement?.parentElement?.innerText,
    html: a.outerHTML,
  }));
});
console.log('DRIVE ELEMENTS:', JSON.stringify(driveElements, null, 2));

// Clicar em "Informações técnicas"
const clickedTab = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button, [role="tab"]'));
  const infoTec = buttons.find((b) => b.innerText.includes('Informações técnicas'));
  if (infoTec) {
    infoTec.click();
    return true;
  }
  return false;
});
console.log('Clicou em Informações técnicas:', clickedTab);
await new Promise((r) => setTimeout(r, 2000));

const infoTecContent = await page.evaluate(() => {
  return document.body.innerText;
});
const idx = infoTecContent.indexOf('Informações técnicas');
console.log('Conteúdo após clicar em Informações técnicas:');
console.log(infoTecContent.slice(idx, idx + 2000));

await browser.close();
