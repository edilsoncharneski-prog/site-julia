const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_URL = 'https://www.soollar.com.br/cd/cdcuiabamt/secao/ebike';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'motos');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('====================================================');
  console.log('🚀 ABRINDO MICROSOFT EDGE PARA O SITE SOOLLAR...');
  console.log('====================================================');
  console.log('1. A janela do navegador vai se abrir na sua tela.');
  console.log('2. Se aparecer a tela do Cloudflare ("Verificando seu navegador"), clique para resolver.');
  console.log('3. Se pedir login, use: julianoeletrosom@hotmail.com / ju170205');
  console.log('4. Assim que a lista de motos/ebikes aparecer na tela, este script começará a baixar todas as fotos automaticamente!');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});

  console.log('Aguardando você resolver o Cloudflare ou navegar até a vitrine de ebikes...');

  // Esperar até detectar produtos ou sair do desafio Cloudflare
  let foundProducts = false;
  let attempts = 0;

  while (!foundProducts && attempts < 100) {
    attempts++;
    await new Promise((r) => setTimeout(r, 3000));

    try {
      const isCloudflare = await page.evaluate(() => {
        return document.title.includes('Just a moment') || document.body.innerText.includes('Enable JavaScript and cookies');
      });

      if (!isCloudflare) {
        const productCount = await page.evaluate(() => {
          const imgs = document.querySelectorAll('img');
          return imgs.length;
        });

        if (productCount > 10) {
          console.log('🎉 Página carregada com sucesso! Extraindo dados e fotos das motos...');
          foundProducts = true;
          break;
        }
      }
    } catch {
      // Ignora erro transitório enquanto navega
    }
  }

  if (!foundProducts) {
    console.log('Tempo limite atingido. Por favor, reinicie o script quando estiver pronto.');
    return;
  }

  // Rolar a página para carregar lazy images
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });

  // Extrair itens
  const items = await page.evaluate(() => {
    const results = [];
    // Busca ampla por cards de produtos
    const productElements = document.querySelectorAll('.produto, .item, .product-item, .card, [class*="produto"], [class*="product"]');

    productElements.forEach((el) => {
      const img = el.querySelector('img');
      const titleEl = el.querySelector('h2, h3, h4, .nome, .title, [class*="title"], [class*="nome"]');
      const linkEl = el.querySelector('a');

      if (img && img.src && (img.src.includes('.jpg') || img.src.includes('.png') || img.src.includes('.webp'))) {
        results.push({
          title: titleEl ? titleEl.innerText.trim() : (img.alt || 'Veículo Elétrico'),
          image: img.src,
          link: linkEl ? linkEl.href : '',
        });
      }
    });

    // Se a busca seletiva pegou poucos, busca todas as imagens relevantes
    if (results.length < 5) {
      document.querySelectorAll('img').forEach((img, i) => {
        if (img.src && !img.src.includes('logo') && !img.src.includes('icon') && img.width > 80) {
          results.push({
            title: img.alt || `Moto_${i + 1}`,
            image: img.src,
            link: '',
          });
        }
      });
    }

    return results;
  });

  console.log(`Total de imagens/veículos identificados: ${items.length}`);

  const downloadedCatalog = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const safeName = (item.title || `moto_${i + 1}`)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 50);

    const ext = path.extname(new URL(item.image).pathname) || '.jpg';
    const filename = `${safeName}_${i + 1}${ext}`;
    const destPath = path.join(OUTPUT_DIR, filename);

    try {
      console.log(`Baixando (${i + 1}/${items.length}): ${item.title} -> /motos/${filename}`);
      await downloadImage(item.image, destPath);
      downloadedCatalog.push({
        title: item.title,
        localPath: `/motos/${filename}`,
        originalUrl: item.image,
      });
    } catch (err) {
      console.warn(`Não foi possível baixar ${item.image}:`, err.message);
    }
  }

  // Salvar catálogo JSON
  const catalogPath = path.join(__dirname, '..', 'public', 'motos', 'catalogo.json');
  fs.writeFileSync(catalogPath, JSON.stringify(downloadedCatalog, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log(`✅ CONCLUÍDO! ${downloadedCatalog.length} fotos salvas em 'public/motos/'`);
  console.log(`Arquivo de catálogo gerado em: ${catalogPath}`);
  console.log('====================================================\n');
}

main().catch(console.error);
