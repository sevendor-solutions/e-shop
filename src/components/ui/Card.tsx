import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  glass = false,
  ...props
}) => {
  const baseStyles = 'bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-sm';
  const glassStyles = glass ? 'glass-premium backdrop-blur-md' : '';
  const hoverStyles = hoverable ? 'hover:-translate-y-1 hover:shadow-md transition-all duration-300' : 'transition-colors';

  return (
    <div
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
