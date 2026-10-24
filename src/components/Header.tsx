'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Search, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { CategoryNav } from '@/components/CategoryNav';

export function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const term = searchTerm.trim();
    router.push(term ? `/produtos?busca=${encodeURIComponent(term)}` : '/produtos');
    setSearchOpen(false);
  };

  return (
    <header className="w-full bg-white">
      {/* Barra superior discreta com os diferenciais da loja */}
      <div className="border-b border-gray-100 bg-[#fafaf8]">
        <div className="relative mx-auto flex max-w-[1440px] items-center justify-center px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-gray-500 sm:gap-4 sm:text-[10px]">
            <span>Até 21x no Cartão</span>
            <span className="text-gray-300">|</span>
            <span>Pronta Entrega + Encomenda</span>
            <span className="hidden text-gray-300 sm:inline">|</span>
            <span className="hidden sm:inline">Garantia de Fábrica</span>
          </div>
          <a
            href="https://wa.me/5566984022988"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-4 hidden text-[10px] font-semibold tracking-[0.12em] text-gray-600 transition-colors hover:text-gray-900 lg:block"
          >
            (66) 98402-2988
          </a>
        </div>
      </div>

      {/* Cabeçalho principal com logotipo centralizado */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-5 sm:py-7">
          <div className="flex items-center gap-2 sm:gap-4">
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
              className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-gray-950 sm:block"
            >
              Catálogo
            </Link>
          </div>

          <Link href="/" className="group flex flex-col items-center text-center">
            <span className="text-[8px] font-medium uppercase tracking-[0.4em] text-gray-400 sm:text-[9px]">
              Mobilidade Elétrica
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[22px] font-black leading-none tracking-[-0.045em] text-gray-950 sm:text-3xl lg:text-[38px]">
              <Zap className="h-4 w-4 fill-amber-400 text-amber-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              ELETROSOM
              <span className="font-light text-amber-500">EBIKES</span>
            </span>
          </Link>

          <div className="flex items-center justify-end">
            <a
              href="https://wa.me/5566984022988?text=Ol%C3%A1!+Vim+pelo+site+e+gostaria+de+atendimento."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-gray-800 sm:px-5"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center gap-2 pb-5">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por modelo, scooter ou bike..."
              autoFocus
              className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900"
            />
            <button
              type="submit"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center bg-gray-950 text-white transition-colors hover:bg-gray-800"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      <CategoryNav />
    </header>
  );
}
