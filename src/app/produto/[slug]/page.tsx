'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Zap,
  Battery,
  Gauge,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Share2,
  Check,
} from 'lucide-react';
import { formatCurrency, buildWhatsAppLink } from '@/lib/utils';
import { useState } from 'react';
import allProductsData from '@/data/produtos-loja.json';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [copied, setCopied] = useState(false);

  const foundProduct = allProductsData.find((p) => p.slug === slug);

  const product = foundProduct
    ? {
        ...foundProduct,
        categoria: 'Autopropelidos',
        capacidade_carga: '150 kg',
        tempo_recarga: '6 a 8 horas',
        itens_serie: [
          'Original com garantia de fábrica',
          'Bateria de lítio de alta durabilidade',
          'Freios a disco hidráulicos dianteiro e traseiro',
          'Iluminação 100% LED de alta visibilidade',
          'Painel digital completo',
          'Alarme sonoro e trava de motor',
          'Oficina local e peças de reposição em Cotriguaçu/MT',
        ],
      }
    : {
        titulo: slug.replace(/-/g, ' ').toUpperCase(),
        categoria: 'Autopropelidos',
        descricao:
          'Veículo elétrico de alta eficiência, ecológico e econômico. Custo de recarga inferior a R$ 1,50.',
        potencia_motor: '1000W',
        tipo_bateria: 'Lítio 60V',
        autonomia: 'Até 50 km',
        velocidade_maxima: '32 km/h',
        capacidade_carga: '150 kg',
        tempo_recarga: '6 a 8 horas',
        dispensa_cnh: true,
        preco: null,
        exibir_preco: false,
        imagem_capa: undefined,
        itens_serie: [
          'Bateria de lítio de alta durabilidade',
          'Motor 1000W de alta tração',
          'Freios a disco hidráulicos',
          'Iluminação LED',
          'Garantia e assistência técnica local',
        ],
      };

  const whatsappUrl = buildWhatsAppLink(
    product.titulo,
    typeof window !== 'undefined' ? window.location.href : undefined
  );

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-white min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb / Voltar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Catálogo
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Link Copiado!' : 'Compartilhar'}
          </button>
        </div>

        {/* Grid Principal: Galeria + BuyBox */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-12 border-b border-gray-100">
          {/* Galeria de Fotos */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center p-8 shadow-xs">
              {product.imagem_capa ? (
                <Image
                  src={product.imagem_capa}
                  alt={product.titulo}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <Zap className="w-20 h-20 mb-3 stroke-1 text-gray-300" />
                  <span className="text-sm font-medium text-gray-400">
                    {product.titulo}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Foto ilustrativa de fábrica</span>
                </div>
              )}

              {/* Badge CNH */}
              {product.dispensa_cnh && (
                <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  Dispensado CNH (CONTRAN 996/23)
                </div>
              )}
            </div>
          </div>

          {/* BuyBox / Informações e Conversão */}
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              {product.categoria || 'Autopropelidos'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {product.titulo}
            </h1>

            {/* Selo Resolução */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="text-xs text-emerald-900">
                <strong>100% Legalizado:</strong> Não necessita de CNH, emplacamento nem IPVA.
              </div>
            </div>

            {/* Preço ou Consulta */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              {product.exibir_preco && product.preco ? (
                <div>
                  <span className="text-xs text-gray-500 font-medium">Preço à vista:</span>
                  <div className="text-3xl font-extrabold text-gray-900">
                    {formatCurrency(product.preco)}
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold mt-1">
                    Ou em até 21x no cartão de crédito
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Condição Especial de Compra
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5">
                    Consulte Cores & Parcelamento em até 21x
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Atendimento imediato com nossa equipe em Cotriguaçu/MT.
                  </p>
                </div>
              )}

              {/* Botão de Ação Direta WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Pedir no WhatsApp Agora
              </a>
            </div>

            {/* Ficha Técnica Resumida */}
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Motor</span>
                  <strong>{product.potencia_motor}</strong>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <Battery className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Bateria</span>
                  <strong>{product.tipo_bateria}</strong>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <Gauge className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Autonomia</span>
                  <strong>{product.autonomia}</strong>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Capacidade</span>
                  <strong>{product.capacidade_carga}</strong>
                </div>
              </div>
            </div>

            {/* Itens de Série */}
            {product.itens_serie && (
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">Diferenciais do Modelo:</h4>
                <ul className="flex flex-col gap-1.5 text-xs text-gray-600">
                  {product.itens_serie.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Descrição Detalhada */}
        <section className="py-10 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-3">Sobre o Veículo</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
            {product.descricao}
          </p>
        </section>

        {/* FAQ do Veículo */}
        <section className="py-10 max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-xl text-gray-900">Dúvidas Frequentes sobre Este Modelo</h3>
          </div>

          <div className="flex flex-col gap-3">
            <details className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center text-sm">
                Como recarregar a bateria?
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed pt-2 border-t border-gray-200">
                Basta ligar o carregador bivolt incluso diretamente em qualquer tomada padrão (110V ou 220V). O tempo médio de carga é de 6 a 8 horas para carga total.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center text-sm">
                Vocês têm peças de reposição e oficina em Cotriguaçu?
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed pt-2 border-t border-gray-200">
                <strong>Sim!</strong> A Julia Eletrosom conta com assistência técnica própria e peças de reposição (pastilhas de freio, câmaras, pneus, aceleradores e baterias) para que você nunca fique na mão.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
