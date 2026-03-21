import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function RatingStars({ rating, maxRating = 5, size = 'sm', showCount, count, className }: RatingStarsProps) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <div key={i} className="relative">
              <Star className={cn(sizes[size], 'text-gray-200 dark:text-gray-700')} fill="currentColor" />
              {(filled || partial) && (
                <div className={cn('absolute inset-0 overflow-hidden', partial && `w-[${Math.round((rating % 1) * 100)}%]`)}>
                  <Star className={cn(sizes[size], 'text-amber-400')} fill="currentColor" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>
      )}
    </div>
  );
}
