import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-200 bg-white">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center mb-3.5 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-zinc-900">{title}</h3>
      {description && (
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
