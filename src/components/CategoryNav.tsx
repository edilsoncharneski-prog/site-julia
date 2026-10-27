'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  ScooterIcon,
  BikeIcon,
  TricycleIcon,
  ScooterKickIcon,
  AccessoriesIcon,
  type VehicleIconProps,
} from '@/components/CategoryIcons';

interface Category {
  id: string;
  label: string;
  slug: string;
  Icon: React.ComponentType<VehicleIconProps>;
}

const categories: Category[] = [
  { id: 'autopropelidos', label: 'Autopropelidos', slug: 'autopropelidos', Icon: ScooterIcon },
  { id: 'bikes', label: 'Bikes', slug: 'bikes-eletricas', Icon: BikeIcon },
  { id: 'triciclos', label: 'Triciclos', slug: 'triciclos', Icon: TricycleIcon },
  { id: 'patinetes', label: 'Patinetes', slug: 'patinetes', Icon: ScooterKickIcon },
  { id: 'acessorios', label: 'Acessórios', slug: 'acessorios', Icon: AccessoriesIcon },
];

function CategoryBarInner({ activeSlug }: { activeSlug?: string }) {
  const searchParams = useSearchParams();
  const currentCategory = activeSlug ?? searchParams?.get('categoria') ?? '';

  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto w-full max-w-md px-4 py-3 sm:max-w-2xl">
        <nav
          aria-label="Categorias de veículos"
          className="no-scrollbar flex items-center justify-between gap-2 overflow-x-auto py-1 sm:justify-center sm:gap-8"
        >
          {categories.map(({ id, label, slug, Icon }) => {
            const isActive = currentCategory === slug || currentCategory === id;

            return (
              <Link
                key={id}
                href={`/produtos?categoria=${slug}`}
                className="group flex min-w-[64px] shrink-0 flex-col items-center gap-1.5 text-center"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 group-hover:-translate-y-0.5 ${
                    isActive
                      ? 'bg-black text-white ring-2 ring-yellow-400 ring-offset-2'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span
                  className={`text-xs tracking-tight transition-colors ${
                    isActive
                      ? 'font-bold text-black'
                      : 'font-medium text-zinc-600 group-hover:text-black'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

export function CategoryNav({ activeSlug }: { activeSlug?: string }) {
  return (
    <Suspense fallback={<div className="h-[92px] border-b border-gray-100 bg-white" />}>
      <CategoryBarInner activeSlug={activeSlug} />
    </Suspense>
  );
}
