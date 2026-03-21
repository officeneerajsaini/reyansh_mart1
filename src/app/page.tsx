import { Suspense } from 'react';
import { HeroSection } from '@/components/common/HeroSection';
import { CategoryGrid } from '@/components/common/CategoryGrid';
import { FeaturedProducts } from '@/components/common/FeaturedProducts';
import { PromoSection } from '@/components/common/PromoSection';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryGrid />
        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 py-8">
            {Array.from({length: 10}).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        }>
          <FeaturedProducts title="🔥 Best Sellers" category="featured" />
          <PromoSection />
          <FeaturedProducts title="🥦 Fresh Produce" category="fruits-veggies" />
          <FeaturedProducts title="🥛 Dairy & Eggs" category="dairy-eggs" />
        </Suspense>
      </div>
    </div>
  );
}
