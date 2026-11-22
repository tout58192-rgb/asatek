import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)] border border-transparent',
  secondary:
    'bg-white text-[var(--brand-red)] border border-[var(--brand-red)] hover:bg-[var(--brand-red-light)]',
  whatsapp:
    'bg-[var(--whatsapp)] text-white hover:bg-[var(--whatsapp-dark)] border border-transparent',
  ghost:
    'bg-transparent text-[var(--ink)] hover:bg-[var(--bg-alt)] border border-transparent',
  danger:
    'bg-[#991B1B] text-white hover:bg-[#7F1D1D] border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[38px] px-3 py-1.5 text-sm',
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[48px] px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-red)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
