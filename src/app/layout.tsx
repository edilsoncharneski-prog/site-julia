import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://site-julia.vercel.app'),
  title: 'Julia Eletrosom | Motos, Scooters e Veículos Elétricos',
  description:
    'Sua loja de motos elétricas, scooters, bikes e triciclos em Cotriguaçu-MT. Sem necessidade de CNH nem emplacamento. Parcelamento em até 21x no cartão.',
  keywords: [
    'moto eletrica',
    'scooter eletrica',
    'autopropelido',
    'bike eletrica',
    'triciclo eletrico',
    'cotriguaçu mt',
    'julia eletrosom',
    'sem cnh',
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Julia Eletrosom | Motos e Scooters Elétricas',
    description: 'Veículos elétricos sem CNH em Cotriguaçu-MT. Em até 21x no cartão.',
    url: 'https://site-julia.vercel.app',
    siteName: 'Julia Eletrosom',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased selection:bg-yellow-200">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
