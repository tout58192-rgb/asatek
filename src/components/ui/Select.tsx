import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, id, className = '', children, ...rest }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full min-h-[44px] rounded-lg border bg-white px-3.5 py-2 text-sm text-[var(--ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 focus:border-[var(--brand-red)] ${
            error ? 'border-[var(--brand-red)]' : 'border-[var(--line)]'
          } ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-xs text-[var(--brand-red)] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
