import { Ban, Package, Zap } from 'lucide-react';
import {
  disponibilidadeDescricao,
  disponibilidadeLabels,
  type Disponibilidade,
} from '@/lib/products';

export function StatusBadge({
  status,
  size = 'sm',
}: {
  status: Disponibilidade;
  size?: 'sm' | 'md';
}) {
  const isProntaEntrega = status === 'pronta_entrega';
  const isEsgotado = status === 'esgotado';
  const Icon = isProntaEntrega ? Zap : isEsgotado ? Ban : Package;

  return (
    <span
      title={disponibilidadeDescricao[status]}
      className={`inline-flex items-center gap-1 rounded-full border font-semibold backdrop-blur-sm ${
        size === 'sm'
          ? 'px-2 py-1 text-[9px] uppercase tracking-[0.08em]'
          : 'px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] sm:text-xs'
      } ${
        isProntaEntrega
          ? 'border-emerald-200 bg-emerald-50/95 text-emerald-700'
          : isEsgotado
            ? 'border-red-200 bg-red-50/95 text-red-700'
            : 'border-slate-200 bg-white/95 text-slate-500'
      }`}
    >
      <Icon
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${
          isProntaEntrega
            ? 'fill-emerald-600 text-emerald-600'
            : isEsgotado
              ? 'text-red-600'
              : ''
        }`}
        strokeWidth={2}
      />
      {disponibilidadeLabels[status]}
    </span>
  );
}
