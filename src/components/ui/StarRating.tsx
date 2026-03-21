import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating, max = 5, size = 'sm', showCount, count, interactive, onChange, className
}: StarRatingProps) {
  const sizes = { sm: 14, md: 18, lg: 22 };
  const px = sizes[size];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(!interactive && 'pointer-events-none', interactive && 'hover:scale-110 transition-transform')}
          >
            <Star
              size={px}
              className={cn(
                filled || partial ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600',
              )}
            />
          </button>
        );
      })}
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({count})</span>
      )}
    </div>
  );
}
