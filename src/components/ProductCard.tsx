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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-3.5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 sm:p-4">
      <Link
        href={productHref}
        className="relative block h-64 w-full overflow-hidden rounded-xl bg-[#f7f7f5] sm:h-72"
        aria-label={`Ver detalhes de ${product.titulo} na cor ${selectedColor.nome}`}
      >
        <Image
          key={selectedColor.imagem}
          src={selectedColor.imagem || product.imagem_capa || '/logo-eletrosom.webp'}
          alt={`${product.titulo} na cor ${selectedColor.nome}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          priority={priority}
          className="object-contain px-4 pb-11 pt-10 transition-all duration-200 ease-out group-hover:scale-[1.03] transition-opacity sm:px-6 sm:pb-12 sm:pt-11"
        />

        <span className="pointer-events-none absolute left-3 top-3 z-10">
          <StatusBadge status={selectedColor.disponibilidade} />
        </span>

        {product.dispensa_cnh !== false && (
          <span className="pointer-events-none absolute bottom-2.5 left-3 right-3 z-10 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-semibold leading-tight tracking-tight text-emerald-800 shadow-xs backdrop-blur-xs sm:left-auto sm:right-3">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="whitespace-nowrap">Não precisa de CNH nem Emplacamento</span>
          </span>
        )}
      </Link>

      {/* Sombra elíptica suave e difusa de estúdio abaixo do veículo */}
      <div
        aria-hidden="true"
        className="-mt-2 mx-auto h-3 w-3/4 rounded-full bg-black/40 blur-md"
      />

      <div className="flex flex-1 flex-col items-center px-1 pt-3.5 text-center sm:pt-4">
        <Link
          href={productHref}
          className="flex min-h-[2.25rem] items-start justify-center focus:outline-none"
        >
          <h3 className="text-base font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-yellow-400">
            {product.emoji ? `${product.emoji} ` : ''}
            {product.nome}
          </h3>
        </Link>

        <span className="mt-1 text-xs font-medium text-zinc-400">
          Cor: <strong className="text-zinc-100">{selectedColor.nome}</strong>
        </span>

        <div className="mt-3 w-full">
          <ColorSwatches
            colors={colors}
            activeIndex={activeColor}
            onChange={setActiveColor}
            productName={product.nome}
            size="sm"
          />
        </div>

        <div className="mt-auto flex w-full flex-col gap-2.5 pt-4">
          <Link
            href={productHref}
            className="flex w-full items-center justify-center whitespace-nowrap rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-200 transition-all duration-150 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white active:scale-[0.97]"
          >
            VER DETALHES
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar ${product.nome} na cor ${selectedColor.nome} pelo WhatsApp`}
            className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white shadow-lg shadow-emerald-950/40 transition-all duration-150 hover:from-emerald-400 hover:to-green-500 active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4 shrink-0 fill-white" />
            <span className="whitespace-nowrap">
              {selectedColor.disponibilidade === 'esgotado'
                ? 'Avisar Reposição'
                : 'Pedir no WhatsApp'}
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
