'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Battery,
  BatteryCharging,
  Check,
  ChevronDown,
  Gauge,
  HelpCircle,
  MessageCircle,
  Share2,
  ShieldCheck,
  Timer,
  Weight,
  Zap,
} from 'lucide-react';
import { ColorSwatches } from '@/components/ColorSwatches';
import { StatusBadge } from '@/components/StatusBadge';
import { buildAvailabilityWhatsAppLink, formatCurrency } from '@/lib/utils';
import {
  disponibilidadeLabels,
  getProductColors,
  getDriveEmbedUrl,
  type Product,
} from '@/lib/products';

const diferenciais = [
  'Bateria de alta durabilidade e recarga bivolt',
  'Freios a disco dianteiro e traseiro',
  'Iluminação 100% LED de alta visibilidade',
  'Painel digital completo e alarme sonoro',
  'Garantia de fábrica e suporte dedicado',
  'Peças de reposição sob encomenda para Cotriguaçu/MT',
];

export function ProductDetail({
  product,
  initialColorIndex,
}: {
  product: Product;
  initialColorIndex: number;
}) {
  const colors = getProductColors(product);
  const [activeColor, setActiveColor] = useState(initialColorIndex);
  const [copied, setCopied] = useState(false);
  const selectedColor = colors[activeColor] ?? colors[0];
  const videoEmbedUrl = getDriveEmbedUrl(product.video_url);

  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/produto/${product.slug}?cor=${activeColor}`
      : undefined;

  const whatsappUrl = buildAvailabilityWhatsAppLink(
    product.nome,
    selectedColor,
    productUrl
  );

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}/produto/${product.slug}?cor=${activeColor}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const specs = [
    { label: 'Motor', value: product.potencia_motor || '1000W', icon: Zap },
    { label: 'Bateria', value: product.tipo_bateria || 'Lítio', icon: Battery },
    { label: 'Autonomia', value: product.autonomia || 'Até 50 km', icon: Gauge },
    {
      label: 'Velocidade máxima',
      value: product.velocidade_maxima || '32 km/h',
      icon: Timer,
    },
    {
      label: 'Tempo de recarga',
      value: product.tempo_recarga || '6 a 8 horas',
      icon: BatteryCharging,
    },
    {
      label: 'Capacidade de carga',
      value: product.capacidade_carga || '150 kg',
      icon: Weight,
    },
  ];

  const fichaTecnica: [string, string][] = [];

  if (product.especificacoes_tecnicas && Object.keys(product.especificacoes_tecnicas).length > 0) {
    for (const [key, val] of Object.entries(product.especificacoes_tecnicas)) {
      if (val && !['Cor', 'Link'].includes(key)) {
        fichaTecnica.push([key, String(val)]);
      }
    }
  }

  const addedKeys = new Set(fichaTecnica.map(([k]) => k.toLowerCase()));
  if (!addedKeys.has('modelo')) fichaTecnica.unshift(['Modelo', product.titulo]);
  if (!addedKeys.has('categoria')) fichaTecnica.push(['Categoria', product.categoria]);
  if (!addedKeys.has('motor elétrico') && !addedKeys.has('motor')) {
    fichaTecnica.push(['Motor Elétrico', product.potencia_motor || '1000W']);
  }
  if (!addedKeys.has('bateria')) {
    fichaTecnica.push(['Bateria', product.tipo_bateria || 'Lítio']);
  }
  if (!addedKeys.has('velocidade máxima')) {
    fichaTecnica.push(['Velocidade Máxima', product.velocidade_maxima || '32 km/h']);
  }
  if (!addedKeys.has('autonomia')) {
    fichaTecnica.push(['Autonomia', product.autonomia || 'Até 50 km']);
  }
  if (!addedKeys.has('tempo de recarga')) {
    fichaTecnica.push(['Tempo de Recarga', product.tempo_recarga || '6 a 8 horas']);
  }
  if (!addedKeys.has('capacidade máxima de carga') && !addedKeys.has('capacidade de carga')) {
    fichaTecnica.push(['Capacidade máxima de carga', product.capacidade_carga || '150 kg']);
  }

  fichaTecnica.push(['Cores disponíveis', colors.map((color) => color.nome).join(' • ')]);
  fichaTecnica.push(['Disponibilidade da versão', disponibilidadeLabels[selectedColor.disponibilidade]]);
  fichaTecnica.push([
    'Regulamentação CONTRAN',
    product.dispensa_cnh === false
      ? 'Consulte requisitos de habilitação'
      : 'Dispensado de CNH e emplacamento — Resolução CONTRAN 996/23',
  ]);

  return (
    <div className="min-h-screen bg-white py-6 sm:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 sm:text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Início
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/produtos"
              className="transition-colors hover:text-gray-950"
            >
              Catálogo
            </Link>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            {copied ? 'Link copiado!' : 'Compartilhar'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 border-b border-gray-100 pb-12 lg:grid-cols-2 lg:gap-14">
          {/* Galeria + seletor de cores */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden bg-[#f7f7f5]">
              {colors.map((color, index) => (
                <Image
                  key={color.imagem}
                  src={color.imagem}
                  alt={
                    index === activeColor
                      ? `${product.titulo} na cor ${color.nome}`
                      : ''
                  }
                  aria-hidden={index !== activeColor}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={85}
                  className={`object-contain p-6 transition-opacity duration-300 sm:p-10 ${
                    index === activeColor ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}

              <div className="absolute left-4 top-4 z-10">
                <StatusBadge status={selectedColor.disponibilidade} size="md" />
              </div>

              {product.dispensa_cnh !== false && (
                <div className="absolute right-4 top-4 bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                  Dispensado CNH
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                  Cor selecionada
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedColor.nome}
                  </span>
                  <StatusBadge status={selectedColor.disponibilidade} />
                </div>
              </div>
              <ColorSwatches
                colors={colors}
                activeIndex={activeColor}
                onChange={setActiveColor}
                productName={product.nome}
              />
            </div>
          </div>

          {/* BuyBox */}
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
              {product.categoria === 'Scooter'
                ? 'Scooter elétrica'
                : product.categoria === 'Triciclo'
                  ? 'Triciclo elétrico'
                  : 'Bicicleta elétrica'}
            </span>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-4xl">
              {product.titulo}
            </h1>
            {product.tagline && (
              <p className="mt-2 text-sm text-gray-500">{product.tagline}</p>
            )}

            <div className="mt-5 flex items-start gap-2 border border-emerald-200 bg-emerald-50 p-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div className="text-xs leading-relaxed text-emerald-900">
                <strong>100% legalizado:</strong> não necessita de CNH, emplacamento nem
                IPVA, conforme a Resolução CONTRAN 996/23.
              </div>
            </div>

            <div className="mt-6 border-y border-gray-100 py-6">
              {product.exibir_preco && product.preco ? (
                <div>
                  <span className="text-xs font-medium text-gray-500">Preço à vista:</span>
                  <div className="text-3xl font-extrabold text-gray-950">
                    {formatCurrency(product.preco_promocional || product.preco)}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Ou em até 21x no cartão de crédito
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Condição especial de compra
                  </span>
                  <div className="mt-1 text-xl font-semibold text-gray-950 sm:text-2xl">
                    Consulte cores e parcelamento em até 21x
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Atendimento imediato com nossa equipe em Cotriguaçu/MT.
                  </p>
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#20ba59] hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5 fill-white" />
                Pedir no WhatsApp agora
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {specs.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 border border-gray-100 bg-gray-50 p-3"
                >
                  <Icon className="h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.8} />
                  <div className="min-w-0">
                    <span className="block text-[9px] uppercase tracking-[0.1em] text-gray-400">
                      {label}
                    </span>
                    <strong className="block truncate text-[11px] font-semibold text-gray-900 sm:text-xs">
                      {value}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-bold text-gray-950">Diferenciais do modelo</h4>
              <ul className="flex flex-col gap-1.5 text-xs text-gray-600">
                {diferenciais.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <section className="max-w-4xl border-b border-gray-100 py-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-950">Sobre o veículo</h2>
          <p className="text-sm leading-relaxed text-gray-600">{product.descricao}</p>
        </section>

        {/* Vídeo de Apresentação (Google Drive) */}
        {videoEmbedUrl && (
          <section className="max-w-4xl border-b border-gray-100 py-10">
            <div className="mb-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                Apresentação Oficial
              </span>
              <h2 className="mt-1 text-lg font-semibold text-gray-950 sm:text-xl">
                Conheça em detalhes
              </h2>
            </div>

            <div className="relative aspect-video w-full overflow-hidden border border-gray-200 bg-black shadow-sm">
              <iframe
                src={videoEmbedUrl}
                title={`Apresentação do veículo ${product.titulo}`}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Ficha técnica completa */}
        <section className="border-b border-gray-100 py-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                Especificações
              </span>
              <h2 className="mt-1 text-lg font-semibold text-gray-950 sm:text-xl">
                Ficha técnica completa
              </h2>
            </div>
            <span className="hidden text-[11px] text-gray-400 sm:block">
              Consulte o vendedor para detalhes da versão
            </span>
          </div>

          <dl className="grid grid-cols-1 overflow-hidden border-l border-t border-gray-200 sm:grid-cols-2 lg:grid-cols-3">
            {fichaTecnica.map(([label, value]) => (
              <div
                key={label}
                className="border-b border-r border-gray-200 p-4"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* FAQ do veículo */}
        <section className="max-w-4xl py-10">
          <div className="mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-amber-500" strokeWidth={1.6} />
            <h2 className="text-xl font-semibold text-gray-950">
              Dúvidas frequentes sobre este modelo
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                Como recarregar a bateria?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                Basta ligar o carregador bivolt incluso diretamente em qualquer tomada padrão
                (110V ou 220V). O tempo médio de carga é de 6 a 8 horas para carga total.
              </p>
            </details>

            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                Como funciona a garantia e suporte técnico?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                A Eletrosom Ebikes oferece garantia oficial de fábrica e suporte para encomenda
                de peças de reposição (pastilhas de freio, câmaras, pneus, aceleradores e baterias)
                para que você tenha tranquilidade ao rodar com seu veículo elétrico.
              </p>
            </details>

            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                Esse modelo precisa de CNH ou emplacamento?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                Não. Os modelos comercializados pela Eletrosom Ebikes são autopropelidos
                elétricos dentro dos limites da Resolução CONTRAN 996/23 e dispensam CNH,
                emplacamento e IPVA.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
