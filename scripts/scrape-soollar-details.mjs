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

console.log('1. Abrindo login direto...');
await page.goto('https://www.soollar.com.br/auth/login', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});

await page.waitForSelector('input[name="email"]', { timeout: 30000 });
console.log('2. Preenchendo email e senha...');
await page.type('input[name="email"]', email, { delay: 10 });
await page.type('input[name="password"]', password, { delay: 10 });

await page.evaluate(() => {
  const submit = document.querySelector('button[type="submit"], input[type="submit"]');
  if (submit) submit.click();
});

console.log('3. Aguardando autenticação...');
await new Promise((r) => setTimeout(r, 6000));
console.log('URL após login:', page.url());

console.log('4. Indo para a seção ebike de Cuiabá...');
await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 4000));

// Rolar a página para carregar todos os cards
console.log('5. Rolando para carregar todos os produtos...');
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 600);
      y += 600;
      if (y >= document.body.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, 120);
  });
});
await new Promise((r) => setTimeout(r, 3000));

// Analisa os cards
const cardInfo = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('[data-testid="product-card"]'));
  return {
    totalCards: cards.length,
    firstCardHtml: cards[0]?.outerHTML || '',
    cards: cards.map((c) => {
      const a = c.querySelector('a') || (c.tagName === 'A' ? c : null);
      const img = c.querySelector('img');
      const lines = c.innerText.split('\n').map((l) => l.trim()).filter(Boolean);
      return {
        href: a?.href || '',
        title: lines[0] || '',
        code: lines.find((l) => /^\d{6}$/.test(l)) || '',
        price: (c.innerText.match(/R\$\s*[\d.,]+/) || [])[0] || '',
        img: img?.currentSrc || img?.src || '',
      };
    }),
  };
});

console.log(`Total de cards encontrados: ${cardInfo.totalCards}`);
await writeFile('scripts/soollar-cards-cuiaba.json', JSON.stringify(cardInfo, null, 2));

if (cardInfo.cards[0]?.href) {
  console.log('Navegando para o primeiro produto:', cardInfo.cards[0].href);
  await page.goto(cardInfo.cards[0].href, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 3000));

  const detail = await page.evaluate(() => {
    const allLinks = Array.from(document.querySelectorAll('a')).map((a) => ({
      href: a.href,
      text: a.innerText.trim(),
    }));
    const driveLink = allLinks.find((l) => l.href.includes('drive.google.com') || l.text.toLowerCase().includes('apresenta'));
    
    // Procura por abas ou seções de informações técnicas
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button')).map((t) => t.innerText.trim());
    return {
      title: document.title,
      driveLink,
      tabs: tabs.filter(Boolean),
      bodySnippet: document.body.innerText.slice(0, 4000),
    };
  });
  console.log('Detalhes do produto 1:', JSON.stringify(detail, null, 2));
}

await browser.close();
console.log('Concluído.');
