import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'wholesale';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/70',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/70',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    accent: 'bg-violet-700 text-white border-violet-800',
    wholesale: 'bg-violet-50 text-violet-800 border-violet-200 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-0.5 rounded-md font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border border-solid ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
