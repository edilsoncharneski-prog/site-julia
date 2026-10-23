import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ProductColor } from '@/lib/products';

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
  let message = 'Olá! Gostaria de mais informações sobre os veículos elétricos da Eletrosom Ebikes.';
  
  if (productTitle) {
    message = `Olá! Gostaria de mais informações sobre o produto: *${productTitle}*`;
    if (productUrl) {
      message += ` (${productUrl})`;
    }
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildAvailabilityWhatsAppLink(
  productName: string,
  color: ProductColor,
  productUrl?: string
) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP || '5566984202988';
  const status =
    color.disponibilidade === 'pronta_entrega'
      ? 'Pronta Entrega'
      : 'Sob Pedido / Encomenda';

  const article = productName.startsWith('Triciclo') ? 'no' : 'na';
  let message = `Olá, tenho interesse ${article} ${productName} na cor ${color.nome} (${status}) vista no site.`;
  if (productUrl) message += ` Link: ${productUrl}`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
