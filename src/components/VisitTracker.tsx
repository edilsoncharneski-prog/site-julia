'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (typeof window === 'undefined') return;

    try {
      const storageKey = 'eletrosom_visit_tracked';
      const now = Date.now();
      const lastTracked = Number(sessionStorage.getItem(storageKey) || '0');

      // Conta no máximo 1 visita por sessão a cada 30 minutos para não inflar em recarregamentos
      if (lastTracked && now - lastTracked < 30 * 60 * 1000) {
        return;
      }

      sessionStorage.setItem(storageKey, String(now));
      fetch('/api/visit', {
        method: 'POST',
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignora caso sessionStorage esteja desativado
    }
  }, [pathname]);

  return null;
}
