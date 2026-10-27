'use client';

import Link from 'next/link';
import { Bike, Navigation, Sparkles, Wrench, Zap } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: typeof Zap;
}

const categories: Category[] = [
  { id: '1', name: 'Autopropelidos', slug: 'autopropelidos', icon: Zap },
  { id: '2', name: 'Bikes', slug: 'bikes-eletricas', icon: Bike },
  { id: '3', name: 'Triciclos', slug: 'triciclos', icon: Navigation },
  { id: '4', name: 'Patinetes', slug: 'patinetes', icon: Sparkles },
  { id: '5', name: 'Acessórios', slug: 'acessorios', icon: Wrench },
];

export function CategoryNav({ activeSlug }: { activeSlug?: string }) {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6">
        <nav
          aria-label="Categorias de veículos"
          className="no-scrollbar flex items-start justify-between gap-2 overflow-x-auto scroll-smooth py-3 sm:justify-center sm:gap-9 sm:py-5"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeSlug === category.slug;

            return (
              <Link
                key={category.id}
                href={`/produtos?categoria=${category.slug}`}
                className="group flex min-w-[64px] shrink-0 flex-col items-center gap-1.5 text-center sm:w-[92px] sm:gap-2"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow-xs transition-all duration-200 group-hover:-translate-y-0.5 sm:h-14 sm:w-14 ${
                    isActive
                      ? 'bg-amber-400 text-gray-950 ring-2 ring-gray-950'
                      : 'bg-gray-950 text-white group-hover:bg-gray-800'
                  }`}
                >
                  <Icon
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    strokeWidth={1.8}
                  />
                </span>
                <span
                  className={`text-[10px] font-medium leading-tight tracking-tight transition-colors sm:text-xs ${
                    isActive
                      ? 'font-bold text-gray-950'
                      : 'text-gray-700 group-hover:text-gray-950'
                  }`}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
