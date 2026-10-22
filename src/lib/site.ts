export const SITE_NAME = 'Eletrosom Ebikes';

/**
 * URL pública atual. Quando o domínio novo estiver apontado na Vercel,
 * basta definir NEXT_PUBLIC_SITE_URL=https://www.eletroscoortes.com.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://site-julia.vercel.app';

export const SITE_DESCRIPTION =
  'Sua loja de motos elétricas, scooters, bikes e triciclos em Cotriguaçu-MT. Sem necessidade de CNH nem emplacamento. Parcelamento em até 21x no cartão, peças e oficina própria.';

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP || '5566984202988';

export const WHATSAPP_DISPLAY =
  process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '(66) 98420-2988';

export const STORE_ADDRESS =
  process.env.NEXT_PUBLIC_ADDRESS ||
  'Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT';
