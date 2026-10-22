import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findProductBySlug, getProductColors } from '@/lib/products';
import { SITE_NAME } from '@/lib/site';
import { ProductDetail } from './ProductDetail';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cor?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const found = findProductBySlug(slug);

  if (!found) {
    return { title: 'Produto não encontrado' };
  }

  const { product } = found;
  const colors = getProductColors(product);
  const description =
    product.descricao ||
    `${product.titulo} disponível na ${SITE_NAME}. Consulte cores, condições e parcelamento em até 21x.`;

  return {
    title: product.titulo,
    description,
    alternates: {
      canonical: `/produto/${product.slug}`,
    },
    openGraph: {
      title: `${product.titulo} | ${SITE_NAME}`,
      description,
      url: `/produto/${product.slug}`,
      images: [
        {
          url: colors[0].imagem,
          alt: `${product.titulo} na cor ${colors[0].nome}`,
        },
      ],
    },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { cor } = await searchParams;
  const found = findProductBySlug(slug);

  if (!found) {
    notFound();
  }

  const colors = getProductColors(found.product);
  const requestedColor = Number.parseInt(Array.isArray(cor) ? cor[0] : cor || '', 10);
  const initialColorIndex =
    Number.isInteger(requestedColor) &&
    requestedColor >= 0 &&
    requestedColor < colors.length
      ? requestedColor
      : found.colorIndex;

  return (
    <ProductDetail
      key={found.product.id}
      product={found.product}
      initialColorIndex={initialColorIndex}
    />
  );
}
