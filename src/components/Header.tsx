'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageCircle, Search, X } from 'lucide-react';
import { useState } from 'react';
import { CategoryNav } from '@/components/CategoryNav';
import {
  SITE_NAME,
  STORE_AVAILABILITY_INFO,
  STORE_CITIES,
  STORE_LOGO_PATH,
  STORE_PAYMENT_INFO,
  STORE_SUPPORT_INFO,
  WHATSAPP_DISPLAY,
} from '@/lib/site';
import { buildWhatsAppApiUrl } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const whatsappUrl = buildWhatsAppApiUrl(
    'Olá! Vim pelo site da Eletrosom Ebikes e gostaria de atendimento.'
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const term = searchTerm.trim();
    router.push(term ? `/produtos?busca=${encodeURIComponent(term)}` : '/produtos');
    setSearchOpen(false);
  };

  const handleResetNavigation = () => {
    setSearchOpen(false);
    setSearchTerm('');
  };

  return (
    <header className="w-full bg-white">
      {/* Barra superior institucional e navegação rápida */}
      <div className="border-b border-gray-100 bg-[#fafaf8]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-1.5 sm:py-2">
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
            <Link
              href="/"
              onClick={handleResetNavigation}
              className="transition-all hover:text-gray-950 active:scale-95"
            >
              Início
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/produtos"
              onClick={handleResetNavigation}
              className="transition-all hover:text-gray-950 active:scale-95"
            >
              Catálogo
            </Link>
            <span className="hidden text-gray-300 sm:inline">•</span>
            <Link
              href="/sobre"
              onClick={handleResetNavigation}
              className="hidden transition-all hover:text-gray-950 active:scale-95 sm:inline"
            >
              Sobre
            </Link>
            <span className="hidden text-gray-300 sm:inline">•</span>
            <Link
              href="/contato"
              onClick={handleResetNavigation}
              className="hidden transition-all hover:text-gray-950 active:scale-95 sm:inline"
            >
              Contato
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 transition-all hover:bg-gray-200/70 active:scale-95"
              aria-label={searchOpen ? 'Fechar busca' : 'Buscar produtos'}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bloco de Bio Institucional (Container max-w-md mx-auto estilo Concessionária / Mova) */}
      <div className="mx-auto w-full max-w-md px-4 pb-3 pt-5 text-center">
        <div className="flex flex-col items-center">
          {/* 1 & 2. Logo Circular + Título envolvidos em um único <Link href="/"> */}
          <Link
            href="/"
            onClick={handleResetNavigation}
            aria-label={`Ir para a página inicial da ${SITE_NAME}`}
            className="group flex flex-col items-center focus:outline-none active:scale-95 transition-transform"
          >
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-900 bg-zinc-950 shadow-md transition-transform duration-200 group-hover:scale-[1.03] sm:h-28 sm:w-28">
              <Image
                src={STORE_LOGO_PATH}
                alt={`Logo ${SITE_NAME}`}
                fill
                sizes="(max-width: 640px) 96px, 112px"
                priority
                className="object-cover"
              />
            </div>

            <span className="mt-3 text-xl font-extrabold tracking-tight text-zinc-950 transition-opacity group-hover:opacity-90 sm:text-2xl">
              {SITE_NAME}
            </span>
          </Link>

          {/* 3. Lista de destaques com espaçamento vertical harmônico */}
          <ul className="mt-2.5 flex flex-col items-center gap-1 text-xs leading-relaxed text-zinc-700 sm:text-[13px]">
            <li>💳 {STORE_PAYMENT_INFO}</li>
            <li>📍 {STORE_CITIES}</li>
            <li>🛵 {STORE_AVAILABILITY_INFO}</li>
            <li>🔧 {STORE_SUPPORT_INFO}</li>
          </ul>

          {/* 4. Botão/badge de WhatsApp em destaque + Indicador visual de status */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#20ba59] hover:shadow-md active:scale-95"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
          </a>

          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Atendimento online via WhatsApp</span>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="mt-4 flex w-full items-center gap-2"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por modelo, scooter ou bike..."
              autoFocus
              className="w-full border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900"
            />
            <button
              type="submit"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center bg-zinc-950 text-white transition-colors hover:bg-zinc-800"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {/* 5. Seletor de Categorias com SVGs dedicados */}
      <CategoryNav />
    </header>
  );
}
