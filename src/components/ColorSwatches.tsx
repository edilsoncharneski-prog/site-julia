'use client';

import type { CSSProperties } from 'react';
import type { ProductColor } from '@/lib/products';

function colorStyle(color: ProductColor): CSSProperties {
  if (color.hex_secundario) {
    return {
      background: `linear-gradient(135deg, ${color.hex} 0 50%, ${color.hex_secundario} 50% 100%)`,
    };
  }

  return { backgroundColor: color.hex };
}

export function ColorSwatches({
  colors,
  activeIndex,
  onChange,
  productName,
  size = 'md',
}: {
  colors: ProductColor[];
  activeIndex: number;
  onChange: (index: number) => void;
  productName: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="group"
      aria-label={`Cores disponíveis para ${productName}`}
    >
      {colors.map((color, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={`${color.nome}-${index}`}
            type="button"
            onClick={() => onChange(index)}
            onMouseEnter={() => onChange(index)}
            onFocus={() => onChange(index)}
            aria-label={`${productName} na cor ${color.nome}`}
            aria-pressed={isActive}
            title={color.nome}
            className="group relative flex cursor-pointer items-center justify-center rounded-full p-1 transition-transform active:scale-95 focus:outline-none"
          >
            <span
              style={colorStyle(color)}
              className={`block rounded-full border border-zinc-500/40 transition-all duration-200 ${
                size === 'sm' ? 'h-6 w-6' : 'h-7 w-7 sm:h-8 sm:w-8'
              } ${
                isActive
                  ? 'scale-105 ring-2 ring-yellow-400 ring-offset-2 ring-offset-zinc-900'
                  : 'group-hover:border-zinc-300'
              }`}
            />
            <span className="sr-only">{color.nome}</span>
          </button>
        );
      })}
    </div>
  );
}
