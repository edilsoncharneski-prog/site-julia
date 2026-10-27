import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ProductColor } from '@/lib/products';
import { WHATSAPP_NUMBER } from '@/lib/site';

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

export function buildWhatsAppApiUrl(text?: string, customPhone?: string) {
  const phone = (customPhone || WHATSAPP_NUMBER)
    .replace(/\D/g, '')
    .replace('84202988', '84022988');
  if (!text) {
    return `https://api.whatsapp.com/send/?phone=${phone}&type=phone_number&app_absent=0`;
  }
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(
    text
  )}&type=phone_number&app_absent=0`;
}

export function buildWhatsAppLink(productTitle?: string, productUrl?: string) {
  let message = 'Olá! Gostaria de mais informações sobre os veículos elétricos da Eletrosom Ebikes.';
  
  if (productTitle) {
    message = `Olá! Gostaria de mais informações sobre o produto: *${productTitle}*`;
    if (productUrl) {
      message += ` (${productUrl})`;
    }
  }

  return buildWhatsAppApiUrl(message);
}

export function buildAvailabilityWhatsAppLink(
  productName: string,
  color: ProductColor,
  productUrl?: string
) {
  const status =
    color.disponibilidade === 'pronta_entrega'
      ? 'Pronta Entrega'
      : 'Sob Pedido / Encomenda';

  const article = productName.startsWith('Triciclo') ? 'no' : 'na';
  let message = `Olá, tenho interesse ${article} ${productName} na cor ${color.nome} (${status}) vista no site.`;
  if (productUrl) message += ` Link: ${productUrl}`;

  return buildWhatsAppApiUrl(message);
}
