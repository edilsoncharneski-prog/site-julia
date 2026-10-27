'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Wrench,
  X,
} from 'lucide-react';
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

  return (
    <header className="w-full bg-white">
      {/* Barra superior institucional */}
      <div className="border-b border-gray-100 bg-[#fafaf8]">
        <div className="relative mx-auto flex max-w-[1440px] items-center justify-between px-4 py-1.5 sm:justify-center sm:py-2">
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600 sm:hidden">
            <Link href="/" className="hover:text-gray-950">
              Início
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/produtos" className="hover:text-gray-950">
              Catálogo
            </Link>
          </div>

          <div className="hidden items-center justify-center gap-4 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500 sm:flex">
            <span>{STORE_PAYMENT_INFO}</span>
            <span className="text-gray-300">|</span>
            <span>{STORE_AVAILABILITY_INFO}</span>
            <span className="text-gray-300">|</span>
            <span>{STORE_SUPPORT_INFO}</span>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 transition-colors hover:bg-gray-100 sm:hidden"
            aria-label={searchOpen ? 'Fechar busca' : 'Buscar produtos'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            <span>Buscar</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-4 hidden text-[10px] font-semibold tracking-[0.12em] text-gray-600 transition-colors hover:text-gray-900 lg:block"
          >
            {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>

      {/* Estrutura Principal do Topo (Mobile-First idêntico à Mova Scooters) */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="relative flex flex-col items-center pb-4 pt-5 text-center sm:pb-6 sm:pt-7">
          {/* Links rápidos laterais no Desktop */}
          <div className="hidden w-full items-center justify-between sm:absolute sm:inset-x-0 sm:top-7 sm:flex">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                className="rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950"
                aria-label={searchOpen ? 'Fechar busca' : 'Buscar produtos'}
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
              <Link
                href="/"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600 transition-colors hover:text-gray-950"
              >
                Início
              </Link>
              <Link
                href="/produtos"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-gray-950"
              >
                Catálogo
              </Link>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-gray-800"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* 1. Logo Circular Centralizado */}
          <Link
            href="/"
            aria-label={`Ir para a página inicial da ${SITE_NAME}`}
            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-900 bg-gray-950 shadow-md transition-transform duration-200 hover:scale-[1.03] sm:h-28 sm:w-28"
          >
            <Image
              src={STORE_LOGO_PATH}
              alt={`Logo ${SITE_NAME}`}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              priority
              className="object-cover"
            />
          </Link>

          {/* 2. Bloco Central de Informações */}
          <div className="mt-3 flex flex-col items-center text-center">
            <Link href="/" className="hover:opacity-90">
              <span className="text-xl font-extrabold tracking-tight text-gray-950 sm:text-2xl">
                {SITE_NAME}
              </span>
            </Link>

            <ul className="mt-2 flex flex-col items-center gap-1 text-xs leading-snug text-gray-600 sm:text-[13px]">
              <li className="flex items-center justify-center gap-1.5 font-medium text-gray-800">
                <CreditCard className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>{STORE_PAYMENT_INFO}</span>
              </li>
              <li className="flex items-center justify-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>{STORE_CITIES}</span>
              </li>
              <li className="flex items-center justify-center gap-1.5">
                <PackageCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{STORE_AVAILABILITY_INFO}</span>
              </li>
              <li className="flex items-center justify-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 shrink-0 text-gray-700" />
                <span>{STORE_SUPPORT_INFO}</span>
              </li>
            </ul>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs transition-colors hover:bg-emerald-600 hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-current" />
              <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
            </a>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-2xl items-center gap-2 pb-4"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por modelo, scooter ou bike..."
              autoFocus
              className="w-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900"
            />
            <button
              type="submit"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-gray-950 text-white transition-colors hover:bg-gray-800"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {/* 3. Barra de Categorias Circulares Escuras com Ícones Brancos */}
      <CategoryNav />
    </header>
  );
}
