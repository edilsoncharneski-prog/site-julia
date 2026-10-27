import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { VisitTracker } from '@/components/VisitTracker';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  STORE_ADDRESS,
  STORE_LOGO_PATH,
  WHATSAPP_NUMBER,
} from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Mobilidade Elétrica em Cotriguaçu e Região`,
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
    'juruena mt',
    'colniza mt',
    'castanheira mt',
    'noroeste de mato grosso',
    'moto eletrica juruena',
    'moto eletrica colniza',
    'moto eletrica cotriguaçu',
    'sem cnh',
  ],
  other: {
    'geo.region': 'BR-MT',
    'geo.placename': 'Cotriguaçu, Juruena, Colniza, Castanheira - MT',
  },
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
    title: `${SITE_NAME} | Mobilidade Elétrica em Cotriguaçu e Região`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: STORE_LOGO_PATH,
        width: 400,
        height: 400,
        alt: `${SITE_NAME} | Mobilidade Elétrica em Cotriguaçu e Região`,
      },
      {
        url: '/og-eletrosom-ebikes.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Mobilidade Elétrica em Cotriguaçu e Região`,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Mobilidade Elétrica em Cotriguaçu e Região`,
    description: SITE_DESCRIPTION,
    images: [STORE_LOGO_PATH, '/og-eletrosom-ebikes.png'],
  },
};

const dealerJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MotorcycleDealer',
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL.replace(/\/$/, '')}${STORE_LOGO_PATH}`,
  telephone: `+${WHATSAPP_NUMBER}`,
  description:
    'Loja de motos elétricas, scooters e autopropelidos sem CNH atendendo Cotriguaçu, Juruena, Colniza e Noroeste de MT.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: STORE_ADDRESS,
    addressLocality: 'Cotriguaçu',
    addressRegion: 'MT',
    addressCountry: 'BR',
  },
  areaServed: [
    { '@type': 'City', name: 'Cotriguaçu' },
    { '@type': 'City', name: 'Juruena' },
    { '@type': 'City', name: 'Colniza' },
    { '@type': 'City', name: 'Castanheira' },
  ],
  knowsAbout: [
    'Motos elétricas',
    'Scooters elétricas',
    'Autopropelidos',
    'Bicicletas elétricas sem CNH',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased selection:bg-amber-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <VisitTracker />
      </body>
    </html>
  );
}
