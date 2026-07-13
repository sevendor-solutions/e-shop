import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider';
  
  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
