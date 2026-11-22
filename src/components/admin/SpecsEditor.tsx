import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EditableSpecRow {
  label_en: string;
  label_ur: string;
  value_en: string;
  value_ur: string;
  sort_order: number;
}

interface SpecsEditorProps {
  specs: EditableSpecRow[];
  onChange: (next: EditableSpecRow[]) => void;
}

export function SpecsEditor({ specs, onChange }: SpecsEditorProps) {
  const addRow = () => {
    onChange([
      ...specs,
      {
        label_en: '',
        label_ur: '',
        value_en: '',
        value_ur: '',
        sort_order: specs.length + 1,
      },
    ]);
  };

  const updateRow = (
    idx: number,
    field: keyof EditableSpecRow,
    value: string,
  ) => {
    onChange(
      specs.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
  };

  const removeRow = (idx: number) => {
    onChange(
      specs
        .filter((_, i) => i !== idx)
        .map((r, i) => ({ ...r, sort_order: i + 1 })),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)]">
            Technical Specifications (EN &amp; Urdu)
          </h3>
          <p className="text-xs text-[var(--ink-soft)]">
            Key-value rows displayed in the product specification table.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4" />
          <span>Add Spec</span>
        </Button>
      </div>

      {specs.length === 0 ? (
        <p className="text-xs text-[var(--ink-soft)] italic">
          No specifications added yet.
        </p>
      ) : (
        <div className="space-y-2">
          {specs.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] p-3"
            >
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                  Label (EN)
                </label>
                <input
                  type="text"
                  value={row.label_en}
                  onChange={(e) => updateRow(idx, 'label_en', e.target.value)}
                  placeholder="e.g. System Voltage"
                  className="w-full h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                  Label (UR)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={row.label_ur}
                  onChange={(e) => updateRow(idx, 'label_ur', e.target.value)}
                  placeholder="سسٹم وولٹیج"
                  className="w-full h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                  Value (EN)
                </label>
                <input
                  type="text"
                  value={row.value_en}
                  onChange={(e) => updateRow(idx, 'value_en', e.target.value)}
                  placeholder="e.g. 12V DC"
                  className="w-full h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                  Value (UR)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={row.value_ur}
                  onChange={(e) => updateRow(idx, 'value_ur', e.target.value)}
                  placeholder="12V DC"
                  className="w-full h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
                />
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  aria-label={`Remove spec ${idx + 1}`}
                  className="p-2 text-[var(--ink-soft)] hover:text-[var(--brand-red)] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
