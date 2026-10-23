import { ProductCard } from '@/components/ProductCard';
import { getCatalog } from '@/lib/catalog';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const products = await getCatalog();

  return (
    <div className="flex flex-col">
      {/* Vitrine principal, no estilo clean da Mova */}
      <section id="produtos" className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 flex flex-col gap-3 border-b border-gray-200 pb-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-500">
              Queridinhas Eletrosom
            </span>
            <h1 className="mt-2 text-2xl font-light tracking-tight text-gray-950 sm:text-[34px]">
              Motos, scooters e bikes elétricas
            </h1>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-gray-500 sm:text-right">
            Escolha o modelo, confira as cores disponíveis e fale com a gente para
            garantir o seu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </section>

      {/* FAQ enxuto */}
      <section className="border-t border-gray-200 bg-[#fafaf8] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <HelpCircle className="mx-auto mb-2 h-7 w-7 text-amber-500" strokeWidth={1.5} />
            <h2 className="text-2xl font-light tracking-tight text-gray-950 sm:text-3xl">
              Perguntas Frequentes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tudo o que você precisa saber antes de comprar seu veículo elétrico.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                Precisa de CNH para pilotar os veículos elétricos?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Não! Os modelos autopropelidos comercializados pela Eletrosom Ebikes cumprem a
                Resolução CONTRAN 996/23, dispensando CNH, emplacamento e pagamento de IPVA.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                Como funciona a garantia de fábrica?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Oferecemos garantia oficial de fábrica com atendimento direto em nossa loja física em
                Cotriguaçu/MT e suporte para encomenda de peças de reposição.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                Quais as formas de pagamento disponíveis?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Aceitamos parcelamento em até 21x no cartão de crédito, financiamento e desconto
                especial para pagamento à vista no Pix.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                Como recarregar e qual o custo por carga?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Basta conectar o carregador bivolt incluso em qualquer tomada comum de 110V ou 220V.
                O custo médio de uma recarga completa fica em torno de R$ 1,00 a R$ 2,00.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
