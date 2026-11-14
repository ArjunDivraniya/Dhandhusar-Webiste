import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#24231F] tracking-wide">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-lg bg-white border text-sm text-[#24231F] placeholder:text-[#5C5850]/50 transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#315B3B]/20 focus:border-[#315B3B] disabled:bg-[#F5F0E5]/50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-[#D9C6A5]/80 hover:border-[#D9C6A5]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#5C5850]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

