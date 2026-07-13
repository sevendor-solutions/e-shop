import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number; // 0 to 5
  max?: number;
  size?: number;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 16,
  className = ''
}) => {
  // Clamp value between 0 and max
  const ratingValue = Math.min(Math.max(0, value), max);
  
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, index) => {
        const starNumber = index + 1;
        
        let fillType: 'full' | 'half' | 'empty' = 'empty';
        if (ratingValue >= starNumber) {
          fillType = 'full';
        } else if (ratingValue > starNumber - 1) {
          fillType = 'half';
        }

        return (
          <div key={index} className="relative text-amber-400">
            {fillType === 'full' && (
              <Star size={size} fill="currentColor" stroke="currentColor" />
            )}
            {fillType === 'empty' && (
              <Star size={size} className="text-slate-300 dark:text-slate-600" stroke="currentColor" />
            )}
            {fillType === 'half' && (
              <div className="relative">
                <Star size={size} className="text-slate-300 dark:text-slate-600" stroke="currentColor" />
                <div className="absolute top-0 left-0 overflow-hidden w-1/2 text-amber-400">
                  <Star size={size} fill="currentColor" stroke="currentColor" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
