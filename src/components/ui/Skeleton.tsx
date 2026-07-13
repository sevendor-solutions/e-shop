import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  style,
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-slate-200 dark:bg-slate-700';
  
  const variants = {
    text: 'h-4 rounded w-3/4 my-1.5',
    rect: 'rounded-xl',
    circle: 'rounded-full'
  };

  const customStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {})
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};
