import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductDetail } from '@/components/product/ProductDetail';

interface PageProps { params: { slug: string }; }

async function getProduct(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.short_description || product.description,
    openGraph: {
      title: product.name,
      description: product.short_description || '',
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const supabase = createClient();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, user:users(full_name, avatar_url)')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('is_active', true)
    .limit(6);

  return (
    <ProductDetail
      product={product}
      reviews={reviews ?? []}
      relatedProducts={relatedProducts ?? []}
    />
  );
}
