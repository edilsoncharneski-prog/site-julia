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
  const id = getDriveFileId(value);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export function getDriveStreamUrl(value?: string | null): string | null {
  const id = getDriveFileId(value);
  return id ? `/api/video/${id}` : null;
}

export function getDriveViewUrl(value?: string | null): string | null {
  const id = getDriveFileId(value);
  return id ? `https://drive.google.com/file/d/${id}/view` : null;
}
