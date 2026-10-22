const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testLogin() {
  console.log('Iniciando navegador em modo background...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Acessando URL de e-bikes...');
  await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});

  const currentUrl = page.url();
  console.log('URL atual:', currentUrl);

  const pageTitle = await page.title();
  console.log('Título da página:', pageTitle);

  // Tirar um print da tela para vermos exatamente o que a página está mostrando
  const screenshotPath = path.join(__dirname, 'soollar-view.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot salva em:', screenshotPath);

  // Procurar links de login ou formulário
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, name: i.name, id: i.id, placeholder: i.placeholder }));
  });
  console.log('Inputs encontrados na página:', inputs);

  // Procurar por produtos / motos na página
  const productText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h2, h3, h4, .card, [class*="produto"], [class*="product"]')).map(el => el.innerText.trim()).filter(Boolean).slice(0, 30);
  });
  console.log('Textos/Títulos encontrados:', productText);

  await browser.close();
}

testLogin().catch(console.error);
