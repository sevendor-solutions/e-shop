import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  type?: string;
  textarea?: boolean;
  rows?: number;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      type = 'text',
      className = '',
      textarea = false,
      rows = 3,
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const baseInputStyles = 'w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder-slate-400 dark:text-slate-100 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-950';
    const borderErrorStyles = error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : '';

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        
        {textarea ? (
          <textarea
            id={inputId}
            ref={ref as any}
            rows={rows}
            className={`${baseInputStyles} ${borderErrorStyles} resize-none ${className}`}
            {...(props as any)}
          />
        ) : (
          <input
            id={inputId}
            ref={ref as any}
            type={type}
            className={`${baseInputStyles} ${borderErrorStyles} ${className}`}
            {...(props as any)}
          />
        )}
        
        {error && (
          <span className="text-xs text-red-500 font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
