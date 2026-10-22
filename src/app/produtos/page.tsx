import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { categoryLabels, products } from '@/lib/products';

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

  let filtered = products;

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
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="border-b border-gray-200 pb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-500">
          Catálogo Eletrosom
        </span>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-light tracking-tight text-gray-950 sm:text-3xl">
            {heading}
          </h1>
          <span className="text-xs text-gray-400">
            {filtered.length} {filtered.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}
          </span>
        </div>
        {busca && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <Search className="h-3.5 w-3.5" />
            Resultados para <strong className="font-semibold text-gray-800">“{busca}”</strong>
          </p>
        )}
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/produtos"
          className={`shrink-0 border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
            !categoria
              ? 'border-gray-950 bg-gray-950 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-950'
          }`}
        >
          Todos
        </Link>
        {Object.entries(categoryLabels).map(([slug, label]) => (
          <Link
            key={slug}
            href={`/produtos?categoria=${slug}`}
            className={`shrink-0 border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              categoria === slug
                ? 'border-gray-950 bg-gray-950 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-950'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="mt-12 border border-gray-200 bg-[#fafaf8] px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-gray-950">
            Nenhum modelo encontrado por aqui
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            Estamos sempre recebendo novos veículos. Fale com a nossa equipe no WhatsApp
            para consultar opções de pronta entrega e encomenda.
          </p>
          <a
            href="https://wa.me/5566984202988?text=Ol%C3%A1!+Gostaria+de+consultar+os+modelos+dispon%C3%ADveis+na+Eletrosom+Ebikes."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center bg-[#25D366] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#20ba59]"
          >
            Consultar no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
