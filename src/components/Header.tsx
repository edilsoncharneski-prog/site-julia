'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/produtos?busca=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
      {/* Top Banner Informativo / Proposta de Valor */}
      <div className="bg-[#212529] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
            <span>💳 Até 21x no Cartão</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">📍 Cotriguaçu - MT</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">🛵 Pronta entrega + encomenda</span>
            <span className="hidden lg:inline">•</span>
            <span className="hidden lg:inline">🔧 Peças de reposição & Oficina</span>
          </div>
          <a
            href="https://wa.me/5566984202988"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-[#25D366] hover:underline shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            (66) 98420-2988
          </a>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Julia Eletrosom Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                Julia Eletrosom
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Motos, Scooters & Veículos Elétricos
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-lg hidden md:flex items-center relative"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por moto, scooter ou acessório..."
              className="w-full pl-4 pr-11 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-gray-400 text-sm transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/favoritos"
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors relative"
              title="Lista de Desejos"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <a
              href="https://wa.me/5566984202988?text=Ol%C3%A1!+Vim+pelo+site+e+gostaria+de+atendimento."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Falar no WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por moto, scooter..."
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-hidden focus:border-gray-400"
            />
            <button
              type="submit"
              className="absolute right-1 p-1.5 rounded-full text-gray-500 hover:text-gray-900"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
