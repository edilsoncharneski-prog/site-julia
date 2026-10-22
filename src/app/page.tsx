import Link from 'next/link';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductCard, Product } from '@/components/ProductCard';
import { Zap, ShieldCheck, BatteryCharging, CreditCard, HelpCircle, ChevronDown } from 'lucide-react';

// Dados de amostra para demonstração imediata enquanto conectamos o banco e o catálogo
const initialProducts: Product[] = [
  {
    id: '1',
    titulo: '🛵 Scooter Elétrica X11 1000W',
    slug: 'scooter-eletrica-x11-1000w',
    descricao: 'A mais vendida! Bateria de lítio removível, motor 1000W, alarme com cartão NFC e freios hidráulicos.',
    preco: 9890.0,
    preco_promocional: 8990.0,
    exibir_preco: false,
    destaque: true,
    potencia_motor: '1000W',
    tipo_bateria: 'Lítio 60V 20Ah',
    autonomia: 'Até 50 km',
    velocidade_maxima: '32 km/h',
    dispensa_cnh: true,
  },
  {
    id: '2',
    titulo: '🛵 Scooter Elétrica JET 1500W',
    slug: 'scooter-eletrica-jet-1500w',
    descricao: 'Potência e estilo retro com acabamento premium e grande autonomia.',
    preco: 10500.0,
    exibir_preco: false,
    destaque: true,
    potencia_motor: '1500W',
    tipo_bateria: 'Lítio 60V',
    autonomia: 'Até 55 km',
    velocidade_maxima: '32 km/h',
    dispensa_cnh: true,
  },
  {
    id: '3',
    titulo: '🛵 Scooter X12 Super Sport',
    slug: 'scooter-x12-super-sport',
    descricao: 'Design moderno esportivo com painel digital TFT e amortecedores reforçados.',
    preco: 11900.0,
    exibir_preco: false,
    destaque: true,
    potencia_motor: '1200W',
    tipo_bateria: 'Lítio Removível',
    autonomia: 'Até 45 km',
    velocidade_maxima: '32 km/h',
    dispensa_cnh: true,
  },
  {
    id: '4',
    titulo: '🚲 Bicicleta Elétrica Urbana EcoBike',
    slug: 'bicicleta-eletrica-urbana-ecobike',
    descricao: 'Mobilidade leve, dobrável, com pedal assistido e bateria de lítio recarregável na tomada.',
    preco: 4990.0,
    exibir_preco: false,
    destaque: false,
    potencia_motor: '350W',
    tipo_bateria: 'Lítio 36V',
    autonomia: 'Até 40 km',
    velocidade_maxima: '25 km/h',
    dispensa_cnh: true,
  },
  {
    id: '5',
    titulo: '🛺 Triciclo Elétrico Comfort Cargo',
    slug: 'triciclo-eletrico-comfort-cargo',
    descricao: 'Estabilidade máxima com 3 rodas, marcha à ré, cesto de carga e banco duplo acolchoado.',
    preco: 12800.0,
    exibir_preco: false,
    destaque: true,
    potencia_motor: '1000W',
    tipo_bateria: 'Lítio 60V 20Ah',
    autonomia: 'Até 45 km',
    velocidade_maxima: '30 km/h',
    dispensa_cnh: true,
  },
  {
    id: '6',
    titulo: '🛴 Patinete Elétrico P10 Urban',
    slug: 'patinete-eletrico-p10-urban',
    descricao: 'Leve, prático e ágil para o dia a dia. Dobrável em 3 segundos.',
    preco: 3200.0,
    exibir_preco: false,
    destaque: false,
    potencia_motor: '500W',
    tipo_bateria: 'Lítio 36V',
    autonomia: 'Até 30 km',
    velocidade_maxima: '25 km/h',
    dispensa_cnh: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      {/* 1. Carrossel de Categorias Circulares */}
      <CategoryNav />

      {/* 2. Hero Banner Promocional */}
      <section className="bg-radial from-gray-900 to-black text-white py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              Livre de CNH & IPVA • Resolução 996/23
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
              Sua Moto Elétrica com as Melhores Condições
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              Chega de gastar com gasolina cara. Recarregue na tomada de casa por menos de R$ 1,50. Parcelamos em até <strong>21x no cartão</strong> com garantia e oficina local em Cotriguaçu.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="https://wa.me/5566984202988?text=Ol%C3%A1!+Quero+conhecer+as+motos+el%C3%A9tricas+dispon%C3%ADveis+na+Julia+Eletrosom."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Falar com Vendedor no WhatsApp
              </a>
              <a
                href="#produtos"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3.5 rounded-full border border-white/20 transition-all"
              >
                Ver Catálogo
              </a>
            </div>
          </div>

          {/* Destaque Visual Lateral */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto text-left">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <CreditCard className="w-6 h-6 text-yellow-400 mb-2" />
              <div className="font-bold text-sm text-white">Até 21x</div>
              <div className="text-[11px] text-gray-300">No cartão de crédito</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <BatteryCharging className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="font-bold text-sm text-white">R$ 1,00</div>
              <div className="text-[11px] text-gray-300">Custo por carga completa</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <ShieldCheck className="w-6 h-6 text-blue-400 mb-2" />
              <div className="font-bold text-sm text-white">Zero Burocracia</div>
              <div className="text-[11px] text-gray-300">Sem CNH e sem emplacamento</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <Zap className="w-6 h-6 text-purple-400 mb-2" />
              <div className="font-bold text-sm text-white">Peças & Oficina</div>
              <div className="text-[11px] text-gray-300">Assistência técnica própria</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Seção: Queridinhas da Loja / Vitrine Principal */}
      <section id="produtos" className="max-w-7xl mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Mais Procuradas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Motos & Veículos Elétricos em Destaque
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Escolha o modelo ideal para a sua rotina com economia e autonomia garantidas.
          </p>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Seção FAQ (Perguntas Frequentes) */}
      <section className="bg-gray-50 border-t border-gray-200 py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <HelpCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-500 text-sm">
              Tudo o que você precisa saber antes de comprar sua moto ou scooter elétrica.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <details className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs group">
              <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center text-sm sm:text-base">
                Precisa de CNH para pilotar os veículos elétricos?
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                <strong>Não!</strong> Nossos modelos de autopropelidos se enquadram rigorosamente na <strong>Resolução 996/23 do CONTRAN</strong>, dispensando habilitação (CNH) e autorização prévia.
              </p>
            </details>

            <details className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs group">
              <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center text-sm sm:text-base">
                Precisa de emplacamento, licenciamento ou pagar IPVA?
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                <strong>Não há cobrança de IPVA nem necessidade de placa.</strong> Por serem veículos autopropelidos elétricos, não geram despesas com despachante, vistoria anual ou taxas do Detran.
              </p>
            </details>

            <details className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs group">
              <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center text-sm sm:text-base">
                Quanto custa carregar a bateria na tomada de casa?
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                Uma carga 100% completa custa em média entre <strong>R$ 0,80 e R$ 1,50</strong> na conta de luz, gerando uma autonomia de até 50 km. Isso representa uma economia colossal comparado à gasolina.
              </p>
            </details>

            <details className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs group">
              <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center text-sm sm:text-base">
                Onde fica a loja física da Julia Eletrosom?
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                Nossa loja fica localizada na <strong>Avenida Tamburello, ao lado do Sicoob, em Cotriguaçu/MT</strong>. Venha nos visitar para fazer um test-drive e conferir as motos de perto!
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
