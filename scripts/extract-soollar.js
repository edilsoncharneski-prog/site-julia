const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'motos');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function runExtraction() {
  console.log('Iniciando navegador com Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // 1. Acessar página de login ou clicar no ícone de login
  console.log('Acessando página inicial da Soollar...');
  await page.goto('https://www.soollar.com.br/login', { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});

  // Verificar se estamos na tela de login
  let emailInput = await page.$('input[type="email"], input[name="email"], input[name="login"]');
  if (!emailInput) {
    // Tentar clicar no botão "Veja nosso preço" na página da ebike para abrir login
    console.log('Indo para seção ebike para acionar login...');
    await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', { waitUntil: 'networkidle2', timeout: 45000 });
    const lockBtn = await page.$('button, a');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const loginBtn = btns.find(b => b.innerText.includes('Veja nosso preço') || b.href?.includes('login'));
      if (loginBtn) loginBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
  }

  // Verificar se o modal/página de login apareceu
  emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="e-mail" i]');
  const passwordInput = await page.$('input[type="password"]');

  if (emailInput && passwordInput) {
    console.log('Formulário de login detectado! Preenchendo credenciais...');
    await emailInput.type('julianoeletrosom@hotmail.com', { delay: 30 });
    await passwordInput.type('ju170205', { delay: 30 });

    // Submeter formulário
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"], input[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Entrar') || b.innerText.includes('Acessar'));
      if (submitBtn) submitBtn.click();
    });

    console.log('Aguardando autenticação...');
    await new Promise(r => setTimeout(r, 4000));
  } else {
    console.log('Não foi necessário formulário de login direto ou já autenticado.');
  }

  // 2. Navegar para a seção ebike
  console.log('Carregando catálogo completo de e-bikes...');
  await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike', { waitUntil: 'networkidle2', timeout: 45000 });

  // Rolar suavemente até o final para disparar todos os lazy-loads de imagens
  console.log('Rolando página para carregar todas as imagens...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let distance = 250;
      let timer = setInterval(() => {
        window.scrollBy(0, distance);
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });

  await new Promise(r => setTimeout(r, 3000));

  // Tirar screenshot de confirmação pós-rolagem
  const afterScrollScreenshot = path.join(__dirname, 'soollar-after-scroll.png');
  await page.screenshot({ path: afterScrollScreenshot, fullPage: true });

  // 3. Extrair cada card de moto
  const produtos = await page.evaluate(() => {
    const items = [];
    // Busca os blocos de produtos
    const cards = document.querySelectorAll('div, a');

    // Mapear imagens com seus textos próximos
    document.querySelectorAll('img').forEach(img => {
      if (img.src && !img.src.includes('logo') && !img.src.includes('banner') && !img.src.includes('icon') && !img.src.includes('whatsapp') && !img.src.includes('svg')) {
        // Encontrar container
        const parent = img.closest('div') ? img.closest('div').parentElement : null;
        const text = parent ? parent.innerText.trim() : img.alt;

        if (text && (text.includes('SCOOTER') || text.includes('EBIKE') || text.includes('BICICLETA') || text.includes('1000W') || text.includes('800W'))) {
          // Extrair primeira linha relevante
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          const title = lines.find(l => l.includes('SCOOTER') || l.includes('EBIKE') || l.includes('BICICLETA')) || lines[0];

          items.push({
            title: title,
            image: img.src,
            allText: text
          });
        }
      }
    });

    return items;
  });

  console.log(`Veículos encontrados na página: ${produtos.length}`);

  // Baixar as fotos e criar o catálogo
  const catalog = [];
  const seenUrls = new Set();

  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    if (seenUrls.has(p.image)) continue;
    seenUrls.add(p.image);

    // Limpar título
    const cleanTitle = p.title
      .replace(/PREVIS[AÃ]O\s*\d+\/\d+\s*-\s*/gi, '')
      .replace(/MARCA NEW E-BIKE/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const safeFilename = cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 40) + `_${i + 1}.jpg`;

    const destPath = path.join(OUTPUT_DIR, safeFilename);

    console.log(`Baixando foto: ${cleanTitle} -> /motos/${safeFilename}`);
    try {
      await downloadFile(p.image, destPath);
      catalog.push({
        id: (i + 1).toString(),
        titulo: cleanTitle,
        imagem: `/motos/${safeFilename}`,
        originalUrl: p.image,
        rawText: p.allText
      });
    } catch (err) {
      console.warn(`Erro ao baixar ${p.image}:`, err.message);
    }
  }

  // Salvar catalogo
  const catalogJsonPath = path.join(__dirname, '..', 'public', 'motos', 'motos_soollar.json');
  fs.writeFileSync(catalogJsonPath, JSON.stringify(catalog, null, 2), 'utf-8');

  console.log(`\n✅ Sucesso! ${catalog.length} fotos salvas em public/motos/ e catálogo gerado em ${catalogJsonPath}`);
  await browser.close();
}

runExtraction().catch(console.error);
