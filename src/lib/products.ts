import fallbackProducts from '@/data/produtos-loja.json';

/**
 * Tipos e helpers PUROS do catálogo (seguros para Client Components).
 * A leitura dinâmica dos dados fica em `lib/catalog.ts`.
 */

export type Disponibilidade = 'pronta_entrega' | 'sob_pedido' | 'esgotado';

export interface ProductColor {
  /** UUID da linha em `produto_variacoes` (ausente no catálogo de contingência). */
  id?: string;
  nome: string;
  hex: string;
  hex_secundario?: string;
  imagem: string;
  disponibilidade: Disponibilidade;
  /** Slug antigo da variação, mantido para não quebrar links já compartilhados. */
  slug_legado?: string;
}

export interface Product {
  id: string;
  nome: string;
  emoji?: string;
  titulo: string;
  slug: string;
  categoria: string;
  categoria_slug: string;
  tagline?: string;
  descricao?: string;
  preco?: number | null;
  preco_promocional?: number | null;
  exibir_preco?: boolean;
  destaque?: boolean;
  dispensa_cnh?: boolean;
  potencia_motor?: string;
  tipo_bateria?: string;
  autonomia?: string;
  velocidade_maxima?: string;
  capacidade_carga?: string;
  tempo_recarga?: string;
  imagem_capa?: string;
  /** Link do vídeo de apresentação (Google Drive, já no formato /preview). */
  video_url?: string | null;
  cores: ProductColor[];
  itens_serie?: string[];
  especificacoes_tecnicas?: Record<string, string>;
}

/** Catálogo estático de contingência (útil para Client Components e fallback). */
export const products: Product[] = fallbackProducts as Product[];

export const disponibilidadeLabels: Record<Disponibilidade, string> = {
  pronta_entrega: 'Pronta Entrega',
  sob_pedido: 'Sob Pedido',
  esgotado: 'Esgotado',
};

export const disponibilidadeDescricao: Record<Disponibilidade, string> = {
  pronta_entrega: 'Disponível para retirada imediata na loja',
  sob_pedido: 'Encomenda sob consulta com a fábrica',
  esgotado: 'Sem estoque no momento — consulte previsão de reposição',
};

/**
 * Retorna as variações de cor de um modelo. Produtos sem o campo
 * `cores` continuam funcionando com uma única cor derivada da imagem de capa.
 */
export function getProductColors(product: Product): ProductColor[] {
  if (product.cores?.length) {
    return product.cores.map((color) => ({
      ...color,
      disponibilidade: color.disponibilidade || 'sob_pedido',
    }));
  }

  return [
    {
      nome: 'Padrão',
      hex: '#1f2937',
      imagem: product.imagem_capa || '/logo.png',
      disponibilidade: 'sob_pedido',
    },
  ];
}

/**
 * A vitrine abre já na primeira cor disponível para pronta entrega,
 * destacando o que o lojista tem em estoque.
 */
export function getInitialColorIndex(colors: ProductColor[]): number {
  const index = colors.findIndex((color) => color.disponibilidade === 'pronta_entrega');
  return index >= 0 ? index : 0;
}

export function countProntaEntrega(product: Product): number {
  return getProductColors(product).filter(
    (color) => color.disponibilidade === 'pronta_entrega'
  ).length;
}

/**
 * Converte o nome de uma cor em um slug limpo para uso na query string `?cor=`.
 * Ex: "Azul/Camaleão" -> "azul-camaleao", "Amarelo" -> "amarelo"
 */
export function getColorSlug(colorName: string): string {
  return (colorName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Resolve o parâmetro `?cor=` da URL (que pode ser o nome/slug da cor ou um índice numérico legado)
 * para o índice correspondente na lista de cores do produto.
 */
export function resolveColorParamIndex(
  colors: ProductColor[],
  param?: string | string[] | null,
  fallbackIndex = 0
): number {
  const raw = (Array.isArray(param) ? param[0] : param || '').trim();
  if (!raw) return fallbackIndex;

  const targetSlug = getColorSlug(raw);
  if (targetSlug) {
    const byName = colors.findIndex(
      (color) =>
        getColorSlug(color.nome) === targetSlug ||
        color.nome.toLowerCase() === raw.toLowerCase()
    );
    if (byName >= 0) return byName;
  }

  const parsedIndex = Number.parseInt(raw, 10);
  if (
    /^\d+$/.test(raw) &&
    Number.isInteger(parsedIndex) &&
    parsedIndex >= 0 &&
    parsedIndex < colors.length
  ) {
    return parsedIndex;
  }

  return fallbackIndex;
}

export const categoryLabels: Record<string, string> = {
  autopropelidos: 'Autopropelidos',
  'bikes-eletricas': 'Bikes Elétricas',
  triciclos: 'Triciclos',
  patinetes: 'Patinetes',
  acessorios: 'Acessórios & Peças',
};

/** Rótulo curto usado em `Product.categoria`, derivado do slug da categoria. */
export const categoriaCurta: Record<string, string> = {
  autopropelidos: 'Scooter',
  'bikes-eletricas': 'Bike',
  triciclos: 'Triciclo',
  patinetes: 'Patinete',
  acessorios: 'Acessório',
};

/**
 * Normaliza um link do Google Drive para o formato embutível
 * `https://drive.google.com/file/d/{ID}/preview`.
 *
 * Aceita: link de compartilhamento (`/file/d/ID/view`), `open?id=ID`,
 * `uc?id=ID`, o próprio `/preview` ou apenas o ID do arquivo.
 * Retorna `null` para qualquer outro domínio/formato — o iframe só é
 * montado com URLs do próprio Drive.
 */
const DRIVE_ID = /^[A-Za-z0-9_-]{25,}$/;

/**
 * Mapa dos vídeos otimizados localmente (720p/480p H.264 +faststart)
 * servidos direto pela CDN da Vercel em `/videos/[slug].mp4`, evitando
 * lentidão e travamentos do Google Drive no mobile.
 */
const OPTIMIZED_LOCAL_VIDEOS: Record<string, string> = {
  '1_cgTjV7lDGbxZZozYV6CvIvAvqBm9Ib3': '/videos/scooter-eletrica-cappuccino-1000w.mp4',
  '1r_K6beWVq01shhq18Uqr5_PDhwa-ANe3': '/videos/scooter-eletrica-shark-1000w.mp4',
  '1vCMhzhbWKME-HmG_qEFV9VpqKPPBRgDX': '/videos/scooter-eletrica-h9-1000w.mp4',
  '1L1qUNOAU3ePLN2E3UqOrZujXyqL4lc6Z': '/videos/scooter-eletrica-b3-1000w.mp4',
  '1auxm0uI0MlR9tekJ63DTMJIgmjUtZlb3': '/videos/scooter-eletrica-t1-1000w.mp4',
  '1Ri86TGnCzsA7kRd2wJlKsS_zDcaXYzey': '/videos/bicicleta-eletrica-jsl-1000w.mp4',
  '1rU_ChCrHi3AAdaFtvYJ-8faCBxPUYQJN': '/videos/scooter-eletrica-harley-1000w.mp4',
  '1h3qm5R7Zl1E5kNcJAxzcS4uOH5hltuqs': '/videos/scooter-eletrica-artist-1000w.mp4',
  '1uzfZfoQ-tDIHzy5vjqWh18LodR72TMV0': '/videos/scooter-eletrica-citycoco-1000w.mp4',
  '1ipiX1gXQr9rYZe_bsNAGHOdQjaPmm_hI': '/videos/scooter-eletrica-g105-1000w.mp4',
  '1bG7OELlIs2zidE3BNdxOQZs2jqrP1nEE': '/videos/scooter-eletrica-k007-1000w.mp4',
  '1VChOCXeaXgdHz4xDYBpM2ibl75QbS7q1': '/videos/scooter-eletrica-mz-1000w.mp4',
  '1I0uAkTWHCVVSeQtsj6vaLsY3ObDum4hI': '/videos/scooter-eletrica-tank-800w.mp4',
  '1MJm1oni1jzK5Bmfy8HuIhxBTgaGTIQvy': '/videos/bicicleta-eletrica-jazz-e700-1000w.mp4',
  '1fCCToC3K6ynpTxEcgX8FNOQUV5qgZBL6': '/videos/bicicleta-eletrica-qje-05-1000w.mp4',
  '1Nb07bXUte9BxTkjPLxTuy35HQjKkiS03': '/videos/bicicleta-eletrica-ride-pro-750w.mp4',
  '1EALX7VB7w8NgXhdtfQ66awSmkR_auOlc': '/videos/bicicleta-eletrica-rider-pro-1000w.mp4',
  '15Ktp-yzqUBa0XABnThi3oKnbOmFTFVYw': '/videos/bicicleta-eletrica-tjsr-b-035-1000w.mp4',
};

export function getDriveFileId(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (DRIVE_ID.test(raw)) {
    return raw;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (
    url.protocol !== 'https:' ||
    (url.hostname !== 'drive.google.com' &&
      url.hostname !== 'drive.usercontent.google.com')
  ) {
    return null;
  }

  const id =
    url.pathname.match(/\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.searchParams.get('id') ||
    '';

  return DRIVE_ID.test(id) ? id : null;
}

export function getDriveEmbedUrl(value?: string | null): string | null {
  const raw = value?.trim();
  if (raw?.startsWith('/videos/') && raw.endsWith('.mp4')) {
    return raw;
  }
  const id = getDriveFileId(value);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export function getDriveStreamUrl(
  value?: string | null,
  productSlug?: string
): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (raw.startsWith('/videos/') && raw.endsWith('.mp4')) {
    return raw;
  }

  const id = getDriveFileId(raw);
  if (id && OPTIMIZED_LOCAL_VIDEOS[id]) {
    return OPTIMIZED_LOCAL_VIDEOS[id];
  }

  if (productSlug && Object.values(OPTIMIZED_LOCAL_VIDEOS).includes(`/videos/${productSlug}.mp4`)) {
    return `/videos/${productSlug}.mp4`;
  }

  return id ? `/api/video/${id}` : null;
}

export function getDriveViewUrl(value?: string | null): string | null {
  const id = getDriveFileId(value);
  return id ? `https://drive.google.com/file/d/${id}/view` : null;
}
