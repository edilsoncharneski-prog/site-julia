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
  { id: '2', name: 'Bikes Elétricas', slug: 'bikes-eletricas', icon: Bike },
  { id: '3', name: 'Triciclos', slug: 'triciclos', icon: Navigation },
  { id: '4', name: 'Patinetes', slug: 'patinetes', icon: Sparkles },
  { id: '5', name: 'Acessórios', slug: 'acessorios', icon: Wrench },
];

export function CategoryNav({ activeSlug }: { activeSlug?: string }) {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <nav className="no-scrollbar flex items-start justify-start gap-2 overflow-x-auto py-4 sm:justify-center sm:gap-10 sm:py-5">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeSlug === category.slug;

            return (
              <Link
                key={category.id}
                href={`/produtos?categoria=${category.slug}`}
                className="group flex w-16 shrink-0 flex-col items-center gap-2 text-center sm:w-[92px]"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 group-hover:-translate-y-0.5 sm:h-14 sm:w-14 ${
                    isActive
                      ? 'border-gray-950 bg-gray-950 text-white'
                      : 'border-gray-200 bg-[#f7f7f5] text-gray-600 group-hover:border-gray-900 group-hover:text-gray-950'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" strokeWidth={1.6} />
                </span>
                <span
                  className={`text-[9px] font-medium leading-tight tracking-tight transition-colors sm:text-[11px] ${
                    isActive ? 'text-gray-950' : 'text-gray-600 group-hover:text-gray-950'
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
