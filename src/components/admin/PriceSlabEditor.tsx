import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EditablePriceTier {
  min_qty: number;
  unit_price: number;
}

interface PriceSlabEditorProps {
  tiers: EditablePriceTier[];
  moq: number;
  onChange: (next: EditablePriceTier[]) => void;
  error?: string;
}

export function PriceSlabEditor({
  tiers,
  moq,
  onChange,
  error,
}: PriceSlabEditorProps) {
  const updateRow = (
    idx: number,
    field: 'min_qty' | 'unit_price',
    val: number,
  ) => {
    const next = tiers.map((row, i) =>
      i === idx ? { ...row, [field]: Number.isNaN(val) ? 0 : val } : row,
    );
    onChange(next);
  };

  const addRow = () => {
    const lastQty = tiers.length > 0 ? tiers[tiers.length - 1].min_qty : moq;
    const lastPrice = tiers.length > 0 ? tiers[tiers.length - 1].unit_price : 0;
    onChange([
      ...tiers,
      {
        min_qty: Math.max(moq, lastQty + 10),
        unit_price: Math.max(0, lastPrice),
      },
    ]);
  };

  const removeRow = (idx: number) => {
    if (tiers.length <= 1) return;
    onChange(tiers.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)]">
            Wholesale Price Slabs (PKR)
          </h3>
          <p className="text-xs text-[var(--ink-soft)]">
            First slab minimum quantity must equal MOQ ({moq}). Quantities must be ascending and unique.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4" />
          <span>Add Slab</span>
        </Button>
      </div>

      <div className="space-y-2">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-3 items-center rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] p-3"
          >
            <div className="col-span-5">
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                Min Qty
              </label>
              <input
                type="number"
                min={1}
                value={tier.min_qty}
                onChange={(e) =>
                  updateRow(idx, 'min_qty', parseInt(e.target.value, 10))
                }
                className="w-full h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm tabular-nums"
              />
            </div>

            <div className="col-span-5">
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                Unit Price (PKR)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={tier.unit_price}
                onChange={(e) =>
                  updateRow(idx, 'unit_price', parseFloat(e.target.value))
                }
                className="w-full h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm tabular-nums"
              />
            </div>

            <div className="col-span-2 flex justify-end pt-5">
              <button
                type="button"
                disabled={tiers.length <= 1}
                onClick={() => removeRow(idx)}
                aria-label={`Remove slab ${idx + 1}`}
                className="p-2 text-[var(--ink-soft)] hover:text-[var(--brand-red)] disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs font-medium text-[var(--brand-red)]">{error}</p>
      )}
    </div>
  );
}
