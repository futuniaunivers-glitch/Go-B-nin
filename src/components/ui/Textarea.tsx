import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-700">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-500/15 focus:outline-hidden transition-colors shadow-2xs ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''
          } ${className}`}
          rows={props.rows || 3}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {helper && !error && <p className="text-xs text-zinc-500">{helper}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
