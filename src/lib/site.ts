export const SITE_NAME = 'Eletrosom Ebikes';

/**
 * URL pública atual. Quando o domínio novo estiver apontado na Vercel,
 * basta definir NEXT_PUBLIC_SITE_URL=https://www.eletroscoortes.com.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://site-julia.vercel.app';

export const SITE_DESCRIPTION =
  'Autopropelidos, bikes elétricas e triciclos sem necessidade de CNH ou emplacamento. Pronta entrega e encomendas.';

/**
 * Normaliza qualquer número de WhatsApp vindo de variáveis de ambiente
 * (ex: caso na Vercel ainda esteja 8420), garantindo sempre o número oficial 5566984022988.
 */
const rawWhatsappEnv = (process.env.NEXT_PUBLIC_WHATSAPP || '5566984022988')
  .replace(/\D/g, '')
  .replace('84202988', '84022988');

export const WHATSAPP_NUMBER = rawWhatsappEnv || '5566984022988';

export const WHATSAPP_DISPLAY = (
  process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '(66) 98402-2988'
).replace('8420-2988', '8402-2988');

export const STORE_ADDRESS =
  process.env.NEXT_PUBLIC_ADDRESS ||
  'Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT';

export const STORE_CITIES = 'Cotriguaçu e Região - MT';

export const STORE_PAYMENT_INFO = 'Até 21x no Cartão';

export const STORE_AVAILABILITY_INFO = 'Pronta entrega + encomenda';

export const STORE_SUPPORT_INFO = 'Peças de reposição e Garantia de Fábrica';

export const STORE_LOGO_PATH = '/logo-eletrosom.webp';

export const CONTRAN_RESOLUTION_URL =
  'https://www.in.gov.br/en/web/dou/-/resolucao-contran-n-996-de-15-de-junho-de-2023-491553860';
