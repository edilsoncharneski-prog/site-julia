'use client';

import Link from 'next/link';
import { Zap, Bike, Navigation, Sparkles, Wrench } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: any;
  color?: string;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Autopropelidos', slug: 'autopropelidos', icon: Zap, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: '2', name: 'Bikes Elétricas', slug: 'bikes-eletricas', icon: Bike, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: '3', name: 'Triciclos', slug: 'triciclos', icon: Navigation, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: '4', name: 'Patinetes', slug: 'patinetes', icon: Sparkles, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: '5', name: 'Acessórios & Peças', slug: 'acessorios', icon: Wrench, color: 'bg-gray-50 text-gray-700 border-gray-200' },
];

export function CategoryNav({ activeSlug }: { activeSlug?: string }) {
  return (
    <section className="w-full bg-white border-b border-gray-100 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {defaultCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeSlug === cat.slug;

            return (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="flex flex-col items-center group shrink-0 text-center w-20 sm:w-24"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 flex items-center justify-center p-3 transition-all duration-200 group-hover:scale-108 group-hover:shadow-md ${
                    isActive
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                      : `${cat.color || 'bg-gray-50 border-gray-200 text-gray-700'}`
                  }`}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-medium tracking-tight transition-colors line-clamp-1 ${
                    isActive ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
