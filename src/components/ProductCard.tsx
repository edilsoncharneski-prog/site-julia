'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Zap, Battery, Gauge, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency, buildWhatsAppLink } from '@/lib/utils';

export interface Product {
  id: string;
  titulo: string;
  slug: string;
  descricao?: string;
  preco?: number | null;
  preco_promocional?: number | null;
  exibir_preco?: boolean;
  destaque?: boolean;
  potencia_motor?: string;
  tipo_bateria?: string;
  autonomia?: string;
  velocidade_maxima?: string;
  dispensa_cnh?: boolean;
  imagem_capa?: string;
}

export function ProductCard({ product }: { product: Product }) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('julia_favorites') || '[]');
      setIsFavorited(favorites.includes(product.id));
    } catch {
      // Ignore localStorage error
    }
  }, [product.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favorites = JSON.parse(localStorage.getItem('julia_favorites') || '[]');
      let updated;
      if (favorites.includes(product.id)) {
        updated = favorites.filter((id: string) => id !== product.id);
        setIsFavorited(false);
      } else {
        updated = [...favorites, product.id];
        setIsFavorited(true);
      }
      localStorage.setItem('julia_favorites', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const whatsappUrl = buildWhatsAppLink(
    product.titulo,
    typeof window !== 'undefined' ? `${window.location.origin}/produto/${product.slug}` : undefined
  );

  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Botão Favoritar Flutuante */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs text-gray-400 hover:text-red-500 hover:bg-white shadow-xs transition-colors"
        aria-label="Favoritar"
      >
        <Heart
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isFavorited ? 'fill-red-500 text-red-500' : ''
          }`}
        />
      </button>

      {/* Badges / Selos */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.dispensa_cnh !== false && (
          <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            Dispensado CNH
          </span>
        )}
        {product.destaque && (
          <span className="bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
            Destaque
          </span>
        )}
      </div>

      {/* Imagem do Produto (Square 1:1) */}
      <Link href={`/produto/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {product.imagem_capa ? (
          <Image
            src={product.imagem_capa}
            alt={product.titulo}
            fill
            className="object-contain p-4 group-hover:scale-106 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4">
            <Zap className="w-12 h-12 mb-2 stroke-1" />
            <span className="text-xs">Foto em breve</span>
          </div>
        )}
      </Link>

      {/* Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.titulo}
          </h3>
        </Link>

        {/* Chips de Especificações */}
        <div className="grid grid-cols-2 gap-1.5 my-3 text-[11px] text-gray-600">
          {product.potencia_motor && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{product.potencia_motor}</span>
            </div>
          )}
          {product.tipo_bateria && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <Battery className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{product.tipo_bateria}</span>
            </div>
          )}
          {product.autonomia && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 col-span-2">
              <Gauge className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Autonomia: {product.autonomia}</span>
            </div>
          )}
        </div>

        {/* Preço ou Consulta */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          {product.exibir_preco && product.preco ? (
            <div>
              <div className="text-xs text-gray-500 font-medium">A partir de</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                {formatCurrency(product.preco_promocional || product.preco)}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Até 21x no cartão ou à vista c/ desconto
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Condições Especiais
              </div>
              <div className="text-sm font-bold text-gray-900">
                Consulte Preço & Parcelamento
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 gap-2 mt-3">
            <Link
              href={`/produto/${product.slug}`}
              className="w-full text-center py-2 px-3 rounded-lg border border-gray-300 text-gray-800 font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors"
            >
              Ver Detalhes
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Pedir no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
