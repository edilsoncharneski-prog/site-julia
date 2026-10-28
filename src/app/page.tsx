import { HeroCarousel } from '@/components/HeroCarousel';
import { ProductCard } from '@/components/ProductCard';
import { getActiveCarouselSlides, getCatalog } from '@/lib/catalog';
import { CONTRAN_RESOLUTION_URL } from '@/lib/site';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const revalidate = 60;

export default async function Home() {
  const [products, carouselSlides] = await Promise.all([
    getCatalog(),
    getActiveCarouselSlides(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Carrossel principal logo abaixo do cabeçalho Eletrosom Ebikes */}
      <HeroCarousel slides={carouselSlides} products={products} />

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
          <p className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium leading-relaxed text-zinc-100 shadow-sm sm:text-right sm:text-base">
            Escolha o seu modelo, veja as cores e{' '}
            <span className="font-bold text-emerald-400">
              chame no WhatsApp para garantir a sua
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3 lg:gap-x-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </section>

      {/* FAQ completo baseado nas maiores dúvidas sobre motos e scooters elétricas */}
      <section className="border-t border-gray-200 bg-[#fafaf8] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <HelpCircle className="mx-auto mb-2 h-7 w-7 text-amber-500" strokeWidth={1.5} />
            <h2 className="text-2xl font-light tracking-tight text-gray-950 sm:text-3xl">
              As Maiores Dúvidas Sobre Moto e Scooter Elétrica
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tudo o que você precisa saber antes de escolher e comprar seu veículo elétrico.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                1. Moto e scooter elétrica precisam ou não de CNH?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Os modelos <strong>autopropelidos</strong> comercializados pela Eletrosom Ebikes (com
                potência de até 1000W e velocidade máxima limitada a 32 km/h, conforme a{' '}
                <a
                  href={CONTRAN_RESOLUTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer font-semibold text-gray-900 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-yellow-500 hover:underline"
                >
                  Resolução CONTRAN nº 996/2023
                </a>
                ) são <strong>dispensados de CNH, emplacamento e IPVA</strong>. Já veículos
                classificados como ciclomotores (potência acima de 1000W até 4000W) passam a exigir
                habilitação na categoria A ou ACC e registro no DETRAN.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                2. É obrigatório usar capacete?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                <strong>Sim!</strong> O uso de capacete com viseira ou óculos de proteção (certificado
                pelo INMETRO, ou capacete ciclístico conforme a categoria do veículo) é fundamental
                para a sua segurança e obrigatório pelas normas de trânsito, evitando multas e
                protegendo você e o garupa em qualquer trajeto.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                3. Pode circular junto com os carros? Onde posso andar?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Sim, nas vias urbanas locais! Conforme o Art. 57 do CTB e a Resolução CONTRAN 996/23,
                a condução deve ser feita pela direita da pista de rolamento (preferencialmente no
                bordo direito quando não houver ciclovia, ciclofaixa ou acostamento). É proibida a
                circulação em rodovias/vias de trânsito rápido e sobre as calçadas.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                4. Como carregar a bateria e quanto gasta de energia?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Carregar é muito simples: basta desligar o veículo e conectar o carregador bivolt
                (110V/220V) em uma tomada comum — em vários modelos a bateria também é removível. O
                tempo médio de carga varia de 4 a 7 horas e o consumo elétrico por recarga completa
                custa centavos (cerca de R$ 0,30 a R$ 1,50). <strong>Dica:</strong> recarregue
                preferencialmente quando a bateria estiver abaixo de 50% e evite deixá-la descarregar
                totalmente para prolongar sua vida útil.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                5. Pode andar na chuva com uma scooter elétrica?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Sim, você pode circular sob chuva moderada, pois os veículos contam com vedação para
                uso urbano. Porém, tome cuidados importantes: nunca atravesse ruas alagadas ou poças
                profundas que atinjam o cubo da roda (onde fica o motor) ou o compartimento da
                bateria, e não utilize jatos de alta pressão ao lavar a moto.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                6. Quantos quilos suporta uma moto elétrica?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Depende do modelo escolhido: em nossa linha, a capacidade máxima de carga varia de{' '}
                <strong>120 kg a 200 kg</strong> (considerando condutor, acompanhante ou bagagem),
                contando com chassis reforçados. Você pode consultar a capacidade exata na ficha
                técnica dentro da página de cada modelo.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                7. Qual a autonomia: quantos km rodo com uma recarga?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                A autonomia varia conforme o modelo, peso transportado, relevo e velocidade, indo de{' '}
                <strong>45 km a 80 km por carga</strong> em nossos veículos. Recomendamos sempre
                escolher um modelo com uma margem de autonomia confortável acima da distância que você
                percorre diariamente.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                8. Qual o custo de manutenção e a vida útil da bateria?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                O custo por quilômetro rodado é cerca de <strong>80% menor</strong> que o de motos a
                combustão, pois você economiza com gasolina, óleo, filtros e velas, precisando apenas
                de revisões preventivas nos freios, pneus e parte elétrica. As baterias modernas de
                Lítio e Grafeno possuem vida útil média de <strong>3 a 8 anos</strong> (até 1.000
                ciclos de recarga), dependendo dos cuidados de uso.
              </p>
            </details>

            <details className="group border border-gray-200 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
                9. Quais as formas de pagamento, financiamento e garantia?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Facilitamos sua compra com parcelamento em <strong>até 12x no cartão de crédito</strong>,
                opções de financiamento e condições especiais à vista no Pix. Todos os veículos contam
                com <strong>garantia oficial de fábrica</strong> e suporte direto em nossa loja em
                Cotriguaçu/MT para encomenda de peças de reposição.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
