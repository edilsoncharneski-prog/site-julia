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
      className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1"
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
            className="group relative flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full p-2 transition-transform active:scale-95 focus:outline-none"
          >
            <span
              style={colorStyle(color)}
              className={`block rounded-full border transition-all duration-200 ${
                size === 'sm' ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-8 w-8 sm:h-9 sm:w-9'
              } ${
                isActive
                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                  : 'border-gray-300 group-hover:border-gray-500'
              }`}
            />
            <span className="sr-only">{color.nome}</span>
          </button>
        );
      })}
    </div>
  );
}
