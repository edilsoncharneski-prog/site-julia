import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Motos, Scooters, Bikes e Triciclos Elétricos`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'eletrosom ebikes',
    'eletrosom',
    'eletroscoortes',
    'moto eletrica',
    'scooter eletrica',
    'autopropelido',
    'bike eletrica',
    'triciclo eletrico',
    'cotriguaçu mt',
    'sem cnh',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: `${SITE_NAME} | Mobilidade Elétrica em Cotriguaçu-MT`,
    description:
      'Scooters, motos, bikes e triciclos elétricos sem CNH. Até 21x no cartão, pronta entrega e garantia de fábrica.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/og-eletrosom-ebikes.png',
        width: 1200,
        height: 630,
        alt: 'Eletrosom Ebikes - Mobilidade Elétrica em Cotriguaçu-MT',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Mobilidade Elétrica`,
    description:
      'Scooters, motos, bikes e triciclos elétricos sem CNH. Até 21x no cartão.',
    images: ['/og-eletrosom-ebikes.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased selection:bg-amber-200">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
