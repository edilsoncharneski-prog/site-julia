import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findProductBySlug } from '@/lib/catalog';
import {
  getColorSlug,
  getProductColors,
  resolveColorParamIndex,
} from '@/lib/products';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { ProductDetail } from './ProductDetail';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cor?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { cor } = await searchParams;
  const found = await findProductBySlug(slug);

  if (!found) {
    return { title: 'Produto não encontrado' };
  }

  const { product } = found;
  const colors = getProductColors(product);
  const selectedIndex = resolveColorParamIndex(colors, cor, found.colorIndex);
  const selectedColor = colors[selectedIndex] ?? colors[0];
  const colorSlug = getColorSlug(selectedColor?.nome);
  const canonicalPath = `/produto/${product.slug}`;
  const sharePath = colorSlug
    ? `${canonicalPath}?cor=${colorSlug}`
    : canonicalPath;
  const imageUrl =
    selectedColor?.imagem || product.imagem_capa || '/logo-eletrosom.webp';

  const titleWithColor = selectedColor?.nome
    ? `${product.titulo} (${selectedColor.nome})`
    : product.titulo;

  const description =
    product.descricao ||
    `${product.titulo} na cor ${selectedColor?.nome || 'Padrão'} disponível na ${SITE_NAME}. Sem necessidade de CNH nem emplacamento. Parcelamento em até 21x.`;

  return {
    title: titleWithColor,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${titleWithColor} | ${SITE_NAME}`,
      description,
      url: sharePath,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: imageUrl,
          alt: `${product.titulo} na cor ${selectedColor?.nome || 'Padrão'}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleWithColor} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { cor } = await searchParams;
  const found = await findProductBySlug(slug);

  if (!found) {
    notFound();
  }

  const { product } = found;
  const colors = getProductColors(product);
  const initialColorIndex = resolveColorParamIndex(
    colors,
    cor,
    found.colorIndex
  );
  const selectedColor = colors[initialColorIndex] ?? colors[0];
  const baseUrl = SITE_URL.replace(/\/$/, '');

  const availabilitySchema =
    selectedColor?.disponibilidade === 'pronta_entrega'
      ? 'https://schema.org/InStock'
      : selectedColor?.disponibilidade === 'esgotado'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/PreOrder';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.titulo,
    description:
      product.descricao ||
      `${product.titulo} - Mobilidade elétrica em Cotriguaçu e Região.`,
    image: colors.map((c) => `${baseUrl}${c.imagem}`),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: product.categoria,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/produto/${product.slug}`,
      priceCurrency: 'BRL',
      ...(product.exibir_preco && (product.preco_promocional || product.preco)
        ? { price: Number(product.preco_promocional || product.preco) }
        : {}),
      availability: availabilitySchema,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetail
        key={product.id}
        product={product}
        initialColorIndex={initialColorIndex}
      />
    </>
  );
}
