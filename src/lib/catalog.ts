import fallbackProducts from '@/data/produtos-loja.json';
import { supabase } from '@/lib/supabase';
import {
  categoriaCurta,
  getInitialColorIndex,
  getProductColors,
  type Disponibilidade,
  type Product,
  type ProductColor,
} from '@/lib/products';

const FALLBACK_LIST: Product[] = fallbackProducts as Product[];

interface SupabaseVariationRow {
  id: string;
  produto_id: string;
  nome: string;
  hex: string;
  hex_secundario?: string | null;
  imagem: string;
  disponibilidade: string;
  slug_legado?: string | null;
  ordem?: number | null;
}

interface SupabaseProductRow {
  id: string;
  categoria_id?: string | null;
  titulo: string;
  nome?: string | null;
  slug: string;
  descricao?: string | null;
  tagline?: string | null;
  emoji?: string | null;
  preco?: number | string | null;
  preco_promocional?: number | string | null;
  exibir_preco?: boolean | null;
  destaque?: boolean | null;
  status?: string | null;
  dispensa_cnh?: boolean | null;
  potencia_motor?: string | null;
  tipo_bateria?: string | null;
  autonomia?: string | null;
  velocidade_maxima?: string | null;
  capacidade_carga?: string | null;
  tempo_recarga?: string | null;
  imagem_capa?: string | null;
  video_url?: string | null;
  especificacoes_tecnicas?: Record<string, string> | null;
  ordem?: number | null;
  categoria?: { nome: string; slug: string } | null;
  produto_variacoes?: SupabaseVariationRow[] | null;
}

function mapRowToProduct(row: SupabaseProductRow): Product {
  const fallbackItem = FALLBACK_LIST.find((p) => p.slug === row.slug);
  const catSlug = row.categoria?.slug || fallbackItem?.categoria_slug || 'autopropelidos';
  const catLabel =
    categoriaCurta[catSlug] || row.categoria?.nome || 'Veículo Elétrico';

  const rawVars = (row.produto_variacoes || []).slice();
  rawVars.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const cores: ProductColor[] = rawVars.map((v) => ({
    id: v.id,
    nome: v.nome,
    hex: v.hex || '#111111',
    hex_secundario: v.hex_secundario || undefined,
    imagem: v.imagem,
    disponibilidade: (v.disponibilidade as Disponibilidade) || 'sob_pedido',
    slug_legado: v.slug_legado || undefined,
  }));

  const preco =
    row.preco !== null && row.preco !== undefined ? Number(row.preco) : null;
  const precoPromocional =
    row.preco_promocional !== null && row.preco_promocional !== undefined
      ? Number(row.preco_promocional)
      : null;

  return {
    id: row.id,
    nome: row.nome || row.titulo,
    emoji: row.emoji || undefined,
    titulo: row.titulo,
    slug: row.slug,
    categoria: catLabel,
    categoria_slug: catSlug,
    tagline: row.tagline || undefined,
    descricao: row.descricao || undefined,
    preco,
    preco_promocional: precoPromocional,
    exibir_preco: Boolean(row.exibir_preco),
    destaque: Boolean(row.destaque),
    dispensa_cnh: row.dispensa_cnh ?? true,
    potencia_motor: row.potencia_motor || undefined,
    tipo_bateria: row.tipo_bateria || undefined,
    autonomia: row.autonomia || undefined,
    velocidade_maxima: row.velocidade_maxima || undefined,
    capacidade_carga: row.capacidade_carga || undefined,
    tempo_recarga: row.tempo_recarga || undefined,
    imagem_capa: row.imagem_capa || undefined,
    video_url: row.video_url || fallbackItem?.video_url || undefined,
    especificacoes_tecnicas:
      row.especificacoes_tecnicas || fallbackItem?.especificacoes_tecnicas || undefined,
    cores,
  };
}

/**
 * Obtém todos os produtos diretamente do Supabase.
 * Se houver falha de rede ou dados vazios, faz fallback transparente
 * para o catálogo local (produtos-loja.json).
 */
export async function getCatalog(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(nome, slug), produto_variacoes(*)')
      .order('ordem', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.error('Erro ao buscar catálogo do Supabase:', error);
      return FALLBACK_LIST;
    }

    return (data as unknown as SupabaseProductRow[]).map(mapRowToProduct);
  } catch (err) {
    console.error('Falha de conexão com o Supabase, usando catálogo local:', err);
    return FALLBACK_LIST;
  }
}

/**
 * Localiza um produto pelo slug canônico ou pelo slug antigo de uma variação.
 * Retorna também o índice da cor selecionada.
 */
export async function findProductBySlug(
  slug: string
): Promise<{ product: Product; colorIndex: number } | null> {
  const catalog = await getCatalog();

  const direct = catalog.find((product) => product.slug === slug);
  if (direct) {
    return {
      product: direct,
      colorIndex: getInitialColorIndex(getProductColors(direct)),
    };
  }

  for (const product of catalog) {
    const colorIndex = getProductColors(product).findIndex(
      (color) => color.slug_legado === slug
    );
    if (colorIndex >= 0) {
      return { product, colorIndex };
    }
  }

  return null;
}

/**
 * Filtra produtos por categoria.
 */
export async function getProductsByCategory(
  categoriaSlug: string
): Promise<Product[]> {
  const catalog = await getCatalog();
  return catalog.filter((product) => product.categoria_slug === categoriaSlug);
}
