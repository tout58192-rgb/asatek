import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, id, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--ink)] mb-1.5"
          >
            {label}
            {required && (
              <span className="text-[var(--brand-red)] ms-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-full min-h-[44px] rounded-lg border bg-white px-3.5 py-2 text-sm text-[var(--ink)] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 focus:border-[var(--brand-red)] ${
            error ? 'border-[var(--brand-red)]' : 'border-[var(--line)]'
          } ${className}`}
          {...rest}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-[var(--ink-soft)]">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-[var(--brand-red)] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, id, className = '', rows = 3, ...rest }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--ink)] mb-1.5"
          >
            {label}
            {required && (
              <span className="text-[var(--brand-red)] ms-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 focus:border-[var(--brand-red)] ${
            error ? 'border-[var(--brand-red)]' : 'border-[var(--line)]'
          } ${className}`}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--brand-red)] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
