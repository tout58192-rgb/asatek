export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
      <div className="aspect-square w-full skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-24 rounded skeleton-shimmer" />
        <div className="h-4 w-full rounded skeleton-shimmer" />
        <div className="h-4 w-2/3 rounded skeleton-shimmer" />
        <div className="h-5 w-32 rounded skeleton-shimmer" />
        <div className="h-10 w-full rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-[var(--line)]">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 w-full max-w-[140px] rounded skeleton-shimmer" />
        </td>
      ))}
    </tr>
  );
}
