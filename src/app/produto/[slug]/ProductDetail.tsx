'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Battery,
  BatteryCharging,
  Check,
  ChevronDown,
  ExternalLink,
  Gauge,
  HelpCircle,
  Maximize2,
  MessageCircle,
  Play,
  Share2,
  ShieldCheck,
  Timer,
  Weight,
  Zap,
} from 'lucide-react';
import { ColorSwatches } from '@/components/ColorSwatches';
import { StatusBadge } from '@/components/StatusBadge';
import { CONTRAN_RESOLUTION_URL, SITE_URL } from '@/lib/site';
import { buildAvailabilityWhatsAppLink, formatCurrency } from '@/lib/utils';
import {
  disponibilidadeLabels,
  getColorSlug,
  getProductColors,
  getDriveEmbedUrl,
  getDriveStreamUrl,
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
  const [videoActivated, setVideoActivated] = useState(false);
  const [useIframePlayer, setUseIframePlayer] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selectedColor = colors[activeColor] ?? colors[0];
  const selectedColorParam = getColorSlug(selectedColor?.nome) || encodeURIComponent(selectedColor?.nome || '');
  const videoEmbedUrl = getDriveEmbedUrl(product.video_url);
  const videoStreamUrl = getDriveStreamUrl(product.video_url, product.slug);

  const triggerFullscreenVideo = () => {
    const requestElFullscreen = (el: HTMLVideoElement | null) => {
      if (!el) return;
      el.play().catch(() => {});
      const anyEl = el as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (typeof anyEl.requestFullscreen === 'function') {
        anyEl.requestFullscreen().catch(() => {
          anyEl.webkitEnterFullscreen?.();
        });
      } else if (typeof anyEl.webkitEnterFullscreen === 'function') {
        anyEl.webkitEnterFullscreen();
      } else if (typeof anyEl.webkitRequestFullscreen === 'function') {
        anyEl.webkitRequestFullscreen().catch(() => {});
      }
    };

    if (!videoActivated) {
      setVideoActivated(true);
      setTimeout(() => requestElFullscreen(videoRef.current), 120);
    } else {
      requestElFullscreen(videoRef.current);
    }
  };

  const productUrl = `${SITE_URL.replace(/\/$/, '')}/produto/${product.slug}?cor=${selectedColorParam}`;

  const whatsappUrl = buildAvailabilityWhatsAppLink(
    product.nome,
    selectedColor,
    productUrl
  );

  const handleColorChange = (index: number) => {
    setActiveColor(index);
    if (typeof window !== 'undefined') {
      const nextColor = colors[index] ?? colors[0];
      const nextColorParam =
        getColorSlug(nextColor?.nome) || encodeURIComponent(nextColor?.nome || '');
      const nextUrl = `${window.location.pathname}?cor=${nextColorParam}`;
      window.history.replaceState(null, '', nextUrl);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}/produto/${product.slug}?cor=${selectedColorParam}`
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
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
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
                  className={`object-contain p-6 transition-opacity duration-200 sm:p-10 ${
                    index === activeColor ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}

              <div className="absolute left-4 top-4 z-10">
                <StatusBadge status={selectedColor.disponibilidade} size="md" />
              </div>

              {product.dispensa_cnh !== false && (
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 inline-flex items-center justify-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold tracking-tight text-emerald-800 shadow-2xs backdrop-blur-xs sm:bottom-4 sm:left-auto sm:right-4 sm:px-3 sm:text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>Não precisa de CNH nem Emplacamento</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/95 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Cor selecionada
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {selectedColor.nome}
                  </span>
                  <StatusBadge status={selectedColor.disponibilidade} />
                </div>
              </div>
              <ColorSwatches
                colors={colors}
                activeIndex={activeColor}
                onChange={handleColorChange}
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
                IPVA, conforme a{' '}
                <a
                  href={CONTRAN_RESOLUTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-1 font-bold text-emerald-950 underline decoration-emerald-600/50 underline-offset-2 transition-colors hover:text-emerald-700 hover:underline"
                >
                  <span>Resolução CONTRAN 996/23</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                .
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
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-950/40 transition-all duration-150 hover:from-emerald-400 hover:to-green-500 active:scale-[0.97]"
              >
                <MessageCircle className="h-5 w-5 fill-white" />
                {selectedColor.disponibilidade === 'esgotado'
                  ? 'Consultar previsão de reposição'
                  : 'Pedir no WhatsApp agora'}
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

        {/* Vídeo de Apresentação com Facade Pattern + CDN Instant Play */}
        {videoEmbedUrl && (
          <section className="max-w-4xl border-b border-gray-100 py-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                  Apresentação Oficial
                </span>
                <h2 className="mt-1 text-lg font-semibold text-gray-950 sm:text-xl">
                  Conheça em detalhes
                </h2>
              </div>

              {videoStreamUrl && (
                <button
                  type="button"
                  onClick={triggerFullscreenVideo}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white active:scale-95"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Assistir em tela cheia</span>
                </button>
              )}
            </div>

            <div className="relative aspect-video w-full overflow-hidden border border-gray-200 bg-black shadow-sm">
              {!videoActivated ? (
                <button
                  type="button"
                  onClick={() => setVideoActivated(true)}
                  aria-label={`Reproduzir vídeo de apresentação de ${product.titulo}`}
                  className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950 text-left focus:outline-none"
                >
                  <Image
                    src={selectedColor?.imagem || product.imagem_capa || '/logo-eletrosom.webp'}
                    alt={`Capa do vídeo de ${product.titulo}`}
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    loading="lazy"
                    className="object-contain p-6 opacity-85 transition-transform duration-500 group-hover:scale-105 sm:p-10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-zinc-950 shadow-xl transition-transform duration-200 group-hover:scale-110 sm:h-20 sm:w-20">
                      <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
                    </span>
                    <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-xs border border-white/15">
                      Assistir vídeo de apresentação
                    </span>
                  </div>
                </button>
              ) : videoStreamUrl && !useIframePlayer ? (
                <video
                  ref={videoRef}
                  key={videoStreamUrl}
                  src={videoStreamUrl}
                  poster={selectedColor?.imagem || product.imagem_capa || '/logo-eletrosom.webp'}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onError={() => setUseIframePlayer(true)}
                  className="h-full w-full bg-black object-contain"
                >
                  <source src={videoStreamUrl} type="video/mp4" />
                  Seu navegador não suporta a reprodução de vídeo.
                </video>
              ) : (
                <iframe
                  src={videoEmbedUrl}
                  title={`Apresentação do veículo ${product.titulo}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </section>
        )}

        {/* Ficha técnica completa + Grid de Destaques Rápidos no topo */}
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

          {/* Grid de Destaques Rápidos (Autonomia, Velocidade Máxima, Capacidade de Carga e Bateria/Recarga) - Estilo Painel Digital HUD */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-sm">
              <div className="flex items-center justify-between text-yellow-400">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Autonomia
                </span>
                <Gauge className="h-4 w-4 shrink-0" />
              </div>
              <strong className="mt-2 text-lg font-bold text-yellow-400">
                {product.autonomia || 'Até 50 km'}
              </strong>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-sm">
              <div className="flex items-center justify-between text-yellow-400">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Velocidade Máxima
                </span>
                <Timer className="h-4 w-4 shrink-0" />
              </div>
              <strong className="mt-2 text-lg font-bold text-yellow-400">
                {product.velocidade_maxima || '32 km/h'}
              </strong>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-sm">
              <div className="flex items-center justify-between text-yellow-400">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Capacidade de Carga
                </span>
                <Weight className="h-4 w-4 shrink-0" />
              </div>
              <strong className="mt-2 text-lg font-bold text-yellow-400">
                {product.capacidade_carga || '150 kg'}
              </strong>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-sm">
              <div className="flex items-center justify-between text-yellow-400">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Bateria / Recarga
                </span>
                <BatteryCharging className="h-4 w-4 shrink-0" />
              </div>
              <strong className="mt-2 truncate text-lg font-bold text-yellow-400">
                {product.tipo_bateria || 'Lítio'} • {product.tempo_recarga || '6 a 8h'}
              </strong>
            </div>
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
                <dd className="mt-1 text-sm text-gray-900">
                  {label === 'Regulamentação CONTRAN' && product.dispensa_cnh !== false ? (
                    <>
                      Dispensado de CNH e emplacamento —{' '}
                      <a
                        href={CONTRAN_RESOLUTION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex cursor-pointer items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-yellow-500 hover:underline"
                      >
                        <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        <span>Resolução CONTRAN 996/23</span>
                      </a>
                    </>
                  ) : (
                    value
                  )}
                </dd>
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
                1. Este modelo precisa de CNH ou emplacamento?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                {product.dispensa_cnh ? (
                  <>
                    <strong>Não precisa de CNH nem emplacamento.</strong> Este modelo enquadra-se nos limites de
                    equipamento de mobilidade individual autopropelido da{" "}
                    <a
                      href={CONTRAN_RESOLUTION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-1 font-semibold text-gray-900 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-amber-600 hover:underline"
                    >
                      <span>Resolução CONTRAN nº 996/2023</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>{" "}
                    (potência nominal até 1000W e velocidade limitada a 32 km/h), sendo isento de CNH, ACC,
                    licenciamento e IPVA.
                  </>
                ) : (
                  <>
                    Consulte a classificação exata conforme a{" "}
                    <a
                      href={CONTRAN_RESOLUTION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-1 font-semibold text-gray-900 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-amber-600 hover:underline"
                    >
                      <span>Resolução CONTRAN nº 996/2023</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    : autopropelidos até 1000W e 32 km/h dispensam CNH e emplacamento, enquanto ciclomotores
                    acima desses limites requerem registro e habilitação ACC ou Categoria A.
                  </>
                )}
              </p>
            </details>

            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                2. É obrigatório usar capacete? Onde posso circular?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                <strong>Sim, o uso de capacete de proteção é indispensável</strong> para o condutor e passageiro.
                Você pode circular em <strong>ciclovias, ciclofaixas e vias urbanas locais</strong> (mantendo-se à
                direita da pista e respeitando o sentido do trânsito, conforme o Art. 57 do CTB). Não é permitido
                transitar sobre calçadas ou em rodovias de trânsito rápido.
              </p>
            </details>

            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                3. Como carregar a bateria e quanto gasta na conta de luz?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                Basta conectar o <strong>carregador bivolt ({product.especificacoes_tecnicas?.["Carregador"] || "110V/220V"})</strong> incluso em
                qualquer tomada comum residencial. O tempo médio de recarga deste modelo é de{" "}
                <strong>{product.tempo_recarga || "4 a 7 horas"}</strong>, e o consumo elétrico é extremamente
                baixo: cerca de <strong>R$ 0,50 a R$ 1,50 por carga completa</strong>. Dica: recarregue antes de
                zerar totalmente a carga para preservar a vida útil da bateria (3 a 8 anos).
              </p>
            </details>

            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                4. Posso andar na chuva com este modelo?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                <strong>Sim, em chuvas leves a moderadas.</strong> Os componentes elétricos possuem vedação para uso
                urbano sob chuva. Evite apenas atravessar ruas alagadas (onde a água cubra o eixo da roda/motor ou o
                assoalho da bateria) e nunca utilize lavadoras de alta pressão diretamente no painel ou compartimento
                elétrico.
              </p>
            </details>

            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                5. Qual o peso suportado e a autonomia real?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                Este modelo tem capacidade máxima indicada de <strong>{product.capacidade_carga || "até 150 kg"}</strong>{" "}
                e autonomia estimada de <strong>{product.autonomia || "45 a 60 km"}</strong> por carga completa. A
                autonomia exata varia conforme o peso transportado, relevo (subidas), calibragem dos pneus e nível de
                velocidade utilizado.
              </p>
            </details>

            <details className="group border border-gray-200 bg-gray-50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                6. Qual o custo de manutenção, garantia e suporte?
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-600">
                O custo de manutenção é até <strong>80% menor</strong> que o de uma moto a gasolina, pois não há
                troca de óleo, filtros, velas ou embreagem — apenas revisões básicas de freios, pneus e suspensão. A{" "}
                <strong>Eletrosom Ebikes</strong> oferece <strong>garantia oficial de fábrica</strong> e suporte
                para encomenda de peças de reposição.
              </p>
            </details>
          </div>
        </section>
      </div>

      {/* Barra Fixa Inferior (Sticky CTA Bar) Mobile para Conversão Rápida */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 shadow-2xl backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-[#f7f7f5]">
              <Image
                src={selectedColor.imagem || product.imagem_capa || '/logo-eletrosom.webp'}
                alt={`${product.nome} - ${selectedColor.nome}`}
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-white">
                {product.nome}
              </div>
              <div className="truncate text-[11px] text-zinc-400">
                Cor: <strong className="text-yellow-400">{selectedColor.nome}</strong>
              </div>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.06em] text-white shadow-lg shadow-emerald-950/50 transition-all duration-150 hover:from-emerald-400 hover:to-green-500 active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4 shrink-0 fill-white" />
            <span>
              {selectedColor.disponibilidade === 'esgotado'
                ? 'Avisar'
                : 'Pedir no WhatsApp'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
