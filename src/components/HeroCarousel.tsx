'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import {
  getColorSlug,
  getProductColors,
  type Disponibilidade,
  type Product,
} from '@/lib/products';
import type { ActiveCarouselSlide } from '@/lib/catalog';

interface UnifiedCarouselItem {
  id: string;
  kind: 'banner' | 'product';
  imageUrl: string;
  title: string;
  subtitle?: string | null;
  linkUrl: string;
  colorName?: string;
  colorHex?: string;
  colorHexSecondary?: string;
  disponibilidade?: Disponibilidade;
  categoryLabel?: string;
  motorPower?: string;
  autonomia?: string;
}

interface HeroCarouselProps {
  slides?: ActiveCarouselSlide[];
  products?: Product[];
}

const AUTOPLAY_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 45;

export function HeroCarousel({ slides = [], products = [] }: HeroCarouselProps) {
  const items = useMemo<UnifiedCarouselItem[]>(() => {
    const customItems: UnifiedCarouselItem[] = slides
      .filter((s) => Boolean(s.image_url))
      .map((s) => ({
        id: `banner-${s.id}`,
        kind: 'banner' as const,
        imageUrl: s.image_url,
        title: s.title || 'Eletrosom Ebikes',
        subtitle: s.subtitle || null,
        linkUrl: s.link_url || '/produtos',
      }));

    if (customItems.length > 0) {
      return customItems;
    }

    // Fallback inteligente: monta slides iterando sobre todos os modelos e variações de cores do catálogo
    const productSlides: UnifiedCarouselItem[] = [];
    for (const product of products) {
      const colors = getProductColors(product);
      const safeSlug = (product.slug || product.id || '').trim();

      for (const color of colors) {
        if (!color.imagem) continue;
        const colorSlug = getColorSlug(color.nome);
        const linkUrl = colorSlug
          ? `/produto/${safeSlug}?cor=${colorSlug}`
          : `/produto/${safeSlug}`;

        productSlides.push({
          id: `prod-${product.id}-${colorSlug || color.nome}`,
          kind: 'product',
          imageUrl: color.imagem,
          title: product.titulo || product.nome,
          subtitle:
            product.tagline ||
            'Sem necessidade de CNH nem emplacamento • Parcelamento em até 21x no cartão',
          linkUrl,
          colorName: color.nome,
          colorHex: color.hex,
          colorHexSecondary: color.hex_secundario,
          disponibilidade: color.disponibilidade,
          categoryLabel: product.categoria,
          motorPower: product.potencia_motor || '1000W',
          autonomia: product.autonomia || 'Até 50 km',
        });
      }
    }

    // Prioriza variações a Pronta Entrega no início do carrossel, seguidas pelas demais variações
    productSlides.sort((a, b) => {
      const aReady = a.disponibilidade === 'pronta_entrega' ? 0 : 1;
      const bReady = b.disponibilidade === 'pronta_entrega' ? 0 : 1;
      return aReady - bReady;
    });

    return productSlides;
  }, [slides, products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const total = items.length;

  const goToSlide = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrentIndex(((index % total) + total) % total);
    },
    [total]
  );

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(nextSlide, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, total, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0]?.clientX ?? touchStartX.current;
    touchDeltaX.current = currentX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null) {
      if (touchDeltaX.current <= -SWIPE_THRESHOLD_PX) {
        nextSlide();
      } else if (touchDeltaX.current >= SWIPE_THRESHOLD_PX) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  if (total === 0) return null;

  const activeIndex = currentIndex >= total ? 0 : currentIndex;
  const activeItem = items[activeIndex];

  // Janela deslizante de indicadores (dots) caso haja muitas variações de cores
  const maxVisibleDots = 12;
  const halfWindow = Math.floor(maxVisibleDots / 2);
  let startDot = Math.max(0, activeIndex - halfWindow);
  const endDot = Math.min(total, startDot + maxVisibleDots);
  if (endDot - startDot < maxVisibleDots) {
    startDot = Math.max(0, endDot - maxVisibleDots);
  }
  const visibleDotIndices = Array.from(
    { length: endDot - startDot },
    (_, idx) => startDot + idx
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destaques Eletrosom Ebikes"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full select-none overflow-hidden border-b border-gray-200 bg-[#f7f7f5]"
    >
      <div className="mx-auto max-w-[1440px]">
        {activeItem.kind === 'banner' ? (
          /* Layout de Banner Institucional (.webp) */
          <div className="relative aspect-16/9 w-full sm:aspect-21/9 lg:aspect-24/9">
            {items.map((slide, idx) => {
              const isCurrent = idx === activeIndex;
              const isAdjacent =
                idx === (activeIndex + 1) % total ||
                idx === (activeIndex - 1 + total) % total;

              if (!isCurrent && !isAdjacent && idx !== 0) return null;

              return (
                <div
                  key={slide.id}
                  aria-hidden={!isCurrent}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    isCurrent
                      ? 'z-10 opacity-100'
                      : 'pointer-events-none z-0 opacity-0'
                  }`}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || 'Banner Eletrosom Ebikes'}
                    fill
                    sizes="100vw"
                    priority={idx === 0}
                    loading={idx === 0 ? undefined : 'lazy'}
                    className="object-cover"
                  />

                  {(slide.title || slide.subtitle || slide.linkUrl) && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6 sm:items-center sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent sm:p-12 lg:p-16">
                      <div className="max-w-xl text-white">
                        {slide.title && (
                          <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                            {slide.title}
                          </h2>
                        )}
                        {slide.subtitle && (
                          <p className="mt-2 text-xs text-gray-200 sm:mt-3 sm:text-base">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.linkUrl && (
                          <Link
                            href={slide.linkUrl}
                            className="mt-4 inline-flex items-center gap-2 bg-amber-400 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-gray-950 transition-colors hover:bg-amber-300 sm:mt-6"
                          >
                            <span>Conferir agora</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Layout Dinâmico de Produto + Variação de Cor */
          <div className="grid min-h-[420px] grid-cols-1 items-center gap-6 px-4 py-8 sm:min-h-[460px] sm:px-10 sm:py-10 lg:grid-cols-12 lg:gap-10 lg:px-16">
            {/* Coluna Texto do Modelo e Variação */}
            <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:col-span-6 lg:items-start lg:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {activeItem.disponibilidade && (
                  <StatusBadge status={activeItem.disponibilidade} size="md" />
                )}
                <span className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Não precisa de CNH nem Emplacamento
                </span>
              </div>

              <span className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-600">
                {activeItem.categoryLabel || 'Mobilidade Elétrica'} • Eletrosom Ebikes
              </span>

              <h2 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-[42px]">
                {activeItem.title}
              </h2>

              {activeItem.colorName && (
                <div className="mt-3 inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 shadow-2xs">
                  <span
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={{
                      background: activeItem.colorHexSecondary
                        ? `linear-gradient(135deg, ${activeItem.colorHex} 50%, ${activeItem.colorHexSecondary} 50%)`
                        : activeItem.colorHex || '#111111',
                    }}
                  />
                  <span className="text-xs font-semibold text-gray-800">
                    Cor: <strong className="text-gray-950">{activeItem.colorName}</strong>
                  </span>
                </div>
              )}

              {activeItem.subtitle && (
                <p className="mt-3 max-w-lg text-xs leading-relaxed text-gray-600 sm:text-sm">
                  {activeItem.subtitle}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-gray-500 lg:justify-start">
                {activeItem.motorPower && (
                  <span>
                    Motor: <strong className="text-gray-900">{activeItem.motorPower}</strong>
                  </span>
                )}
                <span className="text-gray-300">•</span>
                {activeItem.autonomia && (
                  <span>
                    Autonomia: <strong className="text-gray-900">{activeItem.autonomia}</strong>
                  </span>
                )}
                <span className="text-gray-300">•</span>
                <span>
                  Até <strong className="text-gray-900">21x no cartão</strong>
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  href={activeItem.linkUrl}
                  className="inline-flex items-center gap-2 bg-gray-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-gray-800"
                >
                  <span>Ver Detalhes</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/produtos"
                  className="inline-flex items-center justify-center border border-gray-300 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-800 transition-colors hover:border-gray-900 hover:text-gray-950"
                >
                  Catálogo Completo
                </Link>
              </div>
            </div>

            {/* Coluna Imagem da Moto na Cor Ativa */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <Link
                href={activeItem.linkUrl}
                aria-label={`Ver detalhes de ${activeItem.title} na cor ${activeItem.colorName || ''}`}
                className="relative mx-auto block aspect-4/3 w-full max-w-[540px] sm:aspect-16/11"
              >
                {items.map((slide, idx) => {
                  const isCurrent = idx === activeIndex;
                  const isAdjacent =
                    idx === (activeIndex + 1) % total ||
                    idx === (activeIndex - 1 + total) % total;

                  if (!isCurrent && !isAdjacent && idx !== 0) return null;

                  return (
                    <Image
                      key={slide.id}
                      src={slide.imageUrl}
                      alt={`${slide.title} - ${slide.colorName || ''}`}
                      fill
                      sizes="100vw"
                      priority={idx === 0}
                      loading={idx === 0 ? undefined : 'lazy'}
                      className={`object-contain p-2 transition-all duration-500 ease-out sm:p-4 ${
                        isCurrent
                          ? 'scale-100 opacity-100'
                          : 'pointer-events-none scale-95 opacity-0'
                      }`}
                    />
                  );
                })}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Setas Laterais de Navegação Manual */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-900 shadow-md backdrop-blur-xs transition-all hover:bg-gray-950 hover:text-white sm:left-4 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-900 shadow-md backdrop-blur-xs transition-all hover:bg-gray-950 hover:text-white sm:right-4 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicadores Inferiores (Dots / Bullets) + Contador */}
          <div className="relative z-20 flex items-center justify-center gap-2 pb-4 pt-1">
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 shadow-2xs backdrop-blur-xs border border-gray-200/80">
              {visibleDotIndices.map((idx) => {
                const isActiveDot = idx === activeIndex;
                return (
                  <button
                    key={items[idx].id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Ir para o slide ${idx + 1}`}
                    aria-current={isActiveDot ? 'true' : undefined}
                    className={`h-2 rounded-full transition-all ${
                      isActiveDot
                        ? 'w-6 bg-gray-950'
                        : 'w-2 bg-gray-300 hover:bg-gray-500'
                    }`}
                  />
                );
              })}
              <span className="ml-1.5 text-[10px] font-semibold tabular-nums text-gray-500">
                {activeIndex + 1}/{total}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
