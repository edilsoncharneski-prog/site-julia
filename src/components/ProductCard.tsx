'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { ColorSwatches } from '@/components/ColorSwatches';
import { StatusBadge } from '@/components/StatusBadge';
import {
  getColorSlug,
  getInitialColorIndex,
  getProductColors,
  type Product,
} from '@/lib/products';
import { SITE_URL } from '@/lib/site';
import { buildAvailabilityWhatsAppLink } from '@/lib/utils';

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const colors = getProductColors(product);
  const initialIndex = getInitialColorIndex(colors);
  const [activeColor, setActiveColor] = useState(initialIndex);
  const selectedColor = colors[activeColor] ?? colors[0];
  const safeSlug = (product.slug || product.id || '').trim();
  const colorSlug = getColorSlug(selectedColor?.nome);
  const productHref = colorSlug
    ? `/produto/${safeSlug}?cor=${colorSlug}`
    : `/produto/${safeSlug}`;

  const directProductUrl = `${SITE_URL.replace(/\/$/, '')}${productHref}`;
  const whatsappHref = buildAvailabilityWhatsAppLink(
    product.nome,
    selectedColor,
    directProductUrl
  );

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={productHref}
        className="relative block aspect-square overflow-hidden bg-[#f7f7f5]"
        aria-label={`Ver detalhes de ${product.titulo} na cor ${selectedColor.nome}`}
      >
        <Image
          key={selectedColor.imagem}
          src={selectedColor.imagem || product.imagem_capa || '/logo-eletrosom.webp'}
          alt={`${product.titulo} na cor ${selectedColor.nome}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={85}
          priority={priority}
          className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04] sm:p-8"
        />

        <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 sm:left-3 sm:top-3">
          <StatusBadge status={selectedColor.disponibilidade} />
        </span>

        {product.dispensa_cnh !== false && (
          <span className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 inline-flex items-center justify-center gap-1 rounded bg-white/90 px-2 py-1 text-[9px] font-semibold tracking-tight text-emerald-800 shadow-2xs backdrop-blur-xs sm:bottom-2.5 sm:left-auto sm:right-2.5 sm:text-[10px]">
            <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600" />
            <span>Sem CNH • Não emplaca (CONTRAN)</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col items-center px-1 pt-3.5 text-center sm:pt-4">
        <Link
          href={productHref}
          className="flex min-h-[2.5rem] items-start justify-center focus:outline-none"
        >
          <h3 className="text-[13px] font-medium leading-snug tracking-tight text-gray-900 sm:text-sm">
            {product.emoji ? `${product.emoji} ` : ''}
            {product.nome}
          </h3>
        </Link>

        <span className="mt-0.5 text-[11px] font-medium text-gray-500">
          Cor: <strong className="text-gray-800">{selectedColor.nome}</strong>
        </span>

        <div className="mt-2.5">
          <ColorSwatches
            colors={colors}
            activeIndex={activeColor}
            onChange={setActiveColor}
            productName={product.nome}
            size="sm"
          />
        </div>

        <div className="mt-auto flex w-full flex-col gap-2 pt-4">
          <Link
            href={productHref}
            className="flex w-full items-center justify-center border border-gray-300 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-800 transition-colors duration-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white sm:py-2.5 sm:text-[11px]"
          >
            VER DETALHES
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar ${product.nome} na cor ${selectedColor.nome} pelo WhatsApp`}
            className="flex w-full items-center justify-center gap-1.5 bg-[#25D366] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-[#20ba59] sm:py-2.5 sm:text-[11px]"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0 fill-white" />
            <span>Pedir no WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
