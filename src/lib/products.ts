import productsData from '@/data/produtos-loja.json';

export type Disponibilidade = 'pronta_entrega' | 'sob_pedido';

export interface ProductColor {
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
  cores: ProductColor[];
  itens_serie?: string[];
}

export const products = productsData as Product[];

export const disponibilidadeLabels: Record<Disponibilidade, string> = {
  pronta_entrega: 'Pronta Entrega',
  sob_pedido: 'Sob Pedido',
};

export const disponibilidadeDescricao: Record<Disponibilidade, string> = {
  pronta_entrega: 'Disponível para retirada imediata na loja',
  sob_pedido: 'Encomenda sob consulta com a fábrica',
};

/**
 * Retorna as variações de cor de um modelo. Produtos antigos sem o campo
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
 * Busca um modelo pelo slug canônico ou pelo slug antigo de uma variação.
 * Também devolve o índice da cor correspondente ao link acessado.
 */
export function findProductBySlug(slug: string): {
  product: Product;
  colorIndex: number;
} | null {
  const direct = products.find((product) => product.slug === slug);
  if (direct) {
    return { product: direct, colorIndex: getInitialColorIndex(getProductColors(direct)) };
  }

  for (const product of products) {
    const colorIndex = getProductColors(product).findIndex(
      (color) => color.slug_legado === slug
    );

    if (colorIndex >= 0) return { product, colorIndex };
  }

  return null;
}

export function getProductsByCategory(categoriaSlug: string): Product[] {
  return products.filter((product) => product.categoria_slug === categoriaSlug);
}

export const categoryLabels: Record<string, string> = {
  autopropelidos: 'Autopropelidos',
  'bikes-eletricas': 'Bikes Elétricas',
  triciclos: 'Triciclos',
  patinetes: 'Patinetes',
  acessorios: 'Acessórios & Peças',
};
