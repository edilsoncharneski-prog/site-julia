import { ProductCard } from '@/components/ProductCard';
import { products } from '@/lib/products';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function Home() {
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
              <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
                <strong>Não!</strong> Nossos modelos de autopropelidos se enquadram
                rigorosamente na <strong>Resolução 996/23 do CONTRAN</strong>, dispensando
                habilitação (CNH) e autorização prévia.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                Precisa de emplacamento, licenciamento ou pagar IPVA?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
                <strong>Não há cobrança de IPVA nem necessidade de placa.</strong> Por serem
                veículos autopropelidos elétricos, não geram despesas com despachante,
                vistoria anual ou taxas do Detran.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                Quanto custa carregar a bateria na tomada de casa?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Uma carga 100% completa custa em média entre <strong>R$ 0,80 e R$ 1,50</strong>{' '}
                na conta de luz, gerando uma autonomia de até 50 km. Isso representa uma
                economia enorme comparado à gasolina.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                Onde fica a loja física da Eletrosom Ebikes?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Nossa loja fica localizada na{' '}
                <strong>Avenida Tamburello, ao lado do Sicoob, em Cotriguaçu/MT</strong>.
                Venha nos visitar para fazer um test-drive e conferir os veículos de perto!
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
