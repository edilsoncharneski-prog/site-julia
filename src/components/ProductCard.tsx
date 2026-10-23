'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ColorSwatches } from '@/components/ColorSwatches';
import { StatusBadge } from '@/components/StatusBadge';
import {
  getInitialColorIndex,
  getProductColors,
  type Product,
} from '@/lib/products';

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
  const productHref = `/produto/${safeSlug}`;

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={productHref}
        className="relative block aspect-square overflow-hidden bg-[#f7f7f5]"
        aria-label={`Ver detalhes de ${product.titulo}`}
      >
        <Image
          key={selectedColor.imagem}
          src={selectedColor.imagem || product.imagem_capa || '/logo.png'}
          alt={`${product.titulo} na cor ${selectedColor.nome}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={85}
          priority={priority}
          className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04] sm:p-8"
        />

        <span className="pointer-events-none absolute left-3 top-3 z-10">
          <StatusBadge status={selectedColor.disponibilidade} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col items-center px-1 pt-4 text-center">
        <Link
          href={productHref}
          className="flex min-h-[2.6rem] items-start justify-center focus:outline-none sm:min-h-[2.5rem]"
        >
          <h3 className="text-[13px] font-medium leading-snug tracking-tight text-gray-900 sm:text-sm">
            {product.emoji ? `${product.emoji} ` : ''}
            {product.nome}
          </h3>
        </Link>

        <div className="mt-3">
          <ColorSwatches
            colors={colors}
            activeIndex={activeColor}
            onChange={setActiveColor}
            productName={product.nome}
            size="sm"
          />
        </div>

        <div className="mt-auto w-full pt-5">
          <Link
            href={`/produto/${safeSlug}`}
            className="flex w-full items-center justify-center border border-gray-300 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-800 transition-colors duration-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white sm:text-[11px]"
          >
            VER DETALHES
          </Link>
        </div>
      </div>
    </article>
  );
}
