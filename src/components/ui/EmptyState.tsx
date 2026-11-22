import React from 'react';
import { PackageSearch, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  variant?: 'empty' | 'error';
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  variant = 'empty',
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[var(--line)] text-[var(--brand-red)]">
        {variant === 'error' ? (
          <AlertTriangle className="w-6 h-6" />
        ) : (
          <PackageSearch className="w-6 h-6" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-[var(--ink-soft)] max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
