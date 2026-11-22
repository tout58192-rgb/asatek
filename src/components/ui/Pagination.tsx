import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { useI18n } from '../../contexts/LanguageContext';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-6 mt-8"
    >
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        <span>{t('common.previous')}</span>
      </Button>

      <span className="text-sm text-[var(--ink-soft)] tabular-nums">
        {t('common.pageOf', { page, total: totalPages })}
      </span>

      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <span>{t('common.next')}</span>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </Button>
    </nav>
  );
}
