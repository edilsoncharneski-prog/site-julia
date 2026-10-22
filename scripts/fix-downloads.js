const fs = require('fs');
const path = require('path');
const https = require('https');

const catalogPath = path.join(__dirname, '..', 'public', 'motos', 'motos_soollar.json');
const rawData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'motos');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function fixDownloads() {
  console.log('Baixando imagens originais em alta resolução direto do CloudFront...');

  const finalCatalog = [];

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];

    // Extrair url do CloudFront do parâmetro url
    const urlObj = new URL(item.originalUrl);
    let directCloudfrontUrl = urlObj.searchParams.get('url');

    if (!directCloudfrontUrl) {
      directCloudfrontUrl = item.originalUrl;
    }

    const safeName = item.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 40) + `_${i + 1}.png`;

    const destPath = path.join(OUTPUT_DIR, safeName);
    console.log(`Baixando (${i + 1}/${rawData.length}): ${item.titulo} -> ${safeName}`);

    await download(directCloudfrontUrl, destPath);
    const size = fs.statSync(destPath).size;
    console.log(`  -> Tamanho: ${(size / 1024).toFixed(1)} KB`);

    // Categorizar e criar produto
    const slug = item.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Extrair potência e bateria do título
    const potenciaMatch = item.titulo.match(/\b(\d+W)\b/i);
    const bateriaMatch = item.titulo.match(/BATERIA DE [^0-9]*(\d+V\s*\d+AH)/i) || item.titulo.match(/(L[IÍ]TIO|GRAFENO)[^0-9]*(\d+V(?:\s*\d+AH)?)/i);

    finalCatalog.push({
      id: (i + 1).toString(),
      titulo: item.titulo,
      slug: slug,
      descricao: `Veículo elétrico 100% ecológico, alta autonomia e zero custo com combustível. ${item.titulo}. Dispensado de CNH conforme Resolução CONTRAN 996/23.`,
      preco: item.rawText && item.rawText.includes('R$') ? parseFloat(item.rawText.match(/R\$\s*([\d\.,]+)/)[1].replace('.', '').replace(',', '.')) : 4990.0,
      exibir_preco: false,
      destaque: i < 8, // Primeiros 8 em destaque
      dispensa_cnh: true,
      potencia_motor: potenciaMatch ? potenciaMatch[1].toUpperCase() : '1000W',
      tipo_bateria: bateriaMatch ? bateriaMatch[0].trim() : 'Lítio 60V 20Ah',
      autonomia: 'Até 50 km',
      velocidade_maxima: '32 km/h',
      imagem_capa: `/motos/${safeName}`,
    });
  }

  // Salvar catálogo formatado pronto para a vitrine
  const finalJsonPath = path.join(__dirname, '..', 'src', 'data', 'produtos-loja.json');
  fs.mkdirSync(path.dirname(finalJsonPath), { recursive: true });
  fs.writeFileSync(finalJsonPath, JSON.stringify(finalCatalog, null, 2), 'utf-8');

  console.log(`\n🎉 SUCESSO! ${finalCatalog.length} veículos e fotos em PNG de alta resolução salvos em src/data/produtos-loja.json!`);
}

fixDownloads().catch(console.error);
