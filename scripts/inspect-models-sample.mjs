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

for (const url of [
  'https://www.soollar.com.br/cd/cdaeroportogo/produto/0b39a368-b873-4ef3-bd9e-05ff9bc66c1d',
  'https://www.soollar.com.br/cd/cdaeroportogo/produto/5938ce39-6790-4089-b69b-8795d46ec37a',
]) {
  console.log('\n--- Testando URL:', url);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('button');
  await new Promise((r) => setTimeout(r, 1500));

  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, div, p, span'));
    const btn = all.find((el) => el.innerText && el.innerText.trim() === 'Informações técnicas');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 2000));

  const text = await page.evaluate(() => document.body.innerText);
  const idx = text.indexOf('Informações técnicas');
  console.log(text.slice(idx, idx + 1000));
}

await browser.close();
