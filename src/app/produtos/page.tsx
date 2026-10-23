import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { categoryLabels } from '@/lib/products';
import { getCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Catálogo de Veículos Elétricos',
  description:
    'Conheça scooters, motos, bikes e triciclos elétricos da Eletrosom Ebikes. Filtre por categoria, compare cores e consulte condições em até 21x.',
};

type ProductsPageProps = {
  searchParams: Promise<{ busca?: string; categoria?: string }>;
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const busca = (params.busca || '').trim();
  const categoria = params.categoria || '';

  const allProducts = await getCatalog();
  let filtered = allProducts;

  if (categoria && categoryLabels[categoria]) {
    filtered = filtered.filter((product) => product.categoria_slug === categoria);
  }

  if (busca) {
    const term = normalize(busca);
    filtered = filtered.filter((product) =>
      normalize(
        `${product.nome} ${product.titulo} ${product.descricao || ''} ${product.categoria}`
      ).includes(term)
    );
  }

  const heading =
    categoria && categoryLabels[categoria]
      ? categoryLabels[categoria]
      : busca
        ? 'Resultados da busca'
        : 'Todos os veículos';

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-colors hover:text-gray-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Início
        </Link>
      </div>
      {/* Cabeçalho simples e elegante */}
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
            Catálogo Eletrosom
          </span>
          <h1 className="mt-1 text-2xl font-light tracking-tight text-gray-950 sm:text-3xl">
            {heading}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'modelo encontrado' : 'modelos encontrados'}
          </p>
        </div>

        {/* Busca por texto */}
        <form
          action="/produtos"
          method="GET"
          className="relative flex w-full max-w-sm items-center"
        >
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar modelo ou cor..."
            className="w-full rounded-none border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-950"
          />
        </form>
      </div>

      {/* Abas de categoria discretas */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
        <Link
          href="/produtos"
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            !categoria
              ? 'bg-gray-950 text-white'
              : 'border border-gray-200 text-gray-600 hover:border-gray-950 hover:text-gray-950'
          }`}
        >
          Todos
        </Link>
        {Object.entries(categoryLabels).map(([slug, label]) => {
          const isActive = categoria === slug;
          return (
            <Link
              key={slug}
              href={`/produtos?categoria=${slug}`}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-gray-950 text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-950 hover:text-gray-950'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Grid de produtos */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">Nenhum veículo encontrado para esta consulta.</p>
          <Link
            href="/produtos"
            className="mt-3 inline-block text-xs font-semibold text-gray-900 underline underline-offset-4"
          >
            Limpar filtros e ver todos os modelos
          </Link>
        </div>
      )}
    </div>
  );
}
