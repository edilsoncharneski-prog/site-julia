import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function buildWhatsAppLink(productTitle?: string, productUrl?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP || '5566984202988';
  let message = 'Olá! Gostaria de mais informações sobre os veículos elétricos da Julia Eletrosom.';
  
  if (productTitle) {
    message = `Olá! Gostaria de mais informações sobre o produto: *${productTitle}*`;
    if (productUrl) {
      message += ` (${productUrl})`;
    }
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
