import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-violet-700 hover:bg-violet-800 active:bg-violet-900 text-white shadow-xs active:translate-y-px focus-visible:ring-violet-600 font-semibold',
    secondary:
      'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs active:translate-y-px focus-visible:ring-zinc-600 font-semibold',
    outline:
      'border border-zinc-200 bg-white hover:bg-zinc-50/80 hover:border-zinc-300 text-zinc-800 shadow-2xs focus-visible:ring-violet-500 font-medium',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500 font-semibold',
    ghost:
      'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-violet-500 font-medium',
    whatsapp:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-xs h-8 px-3 rounded-lg gap-1.5',
    md: 'text-sm h-10 px-4 rounded-xl gap-2',
    lg: 'text-sm sm:text-base h-12 px-5 rounded-xl gap-2 font-semibold',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
