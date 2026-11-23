import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'asatek_quote_items';

export interface QuoteItemEntry {
  product_id: string;
  quantity: number;
  // Snapshot fallback for display while product details load or if deactivated
  snapshot_name_en: string;
  snapshot_name_ur?: string | null;
  snapshot_sku: string;
  snapshot_moq: number;
  snapshot_image_url?: string | null;
}

interface QuoteContextValue {
  items: QuoteItemEntry[];
  totalCount: number;
  lastAddedAt: number;
  addItem: (entry: QuoteItemEntry) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearQuote: () => void;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

function loadInitialItems(): QuoteItemEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QuoteItemEntry[]) : [];
  } catch {
    return [];
  }
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItemEntry[]>(loadInitialItems);
  const [lastAddedAt, setLastAddedAt] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const addItem = useCallback((entry: QuoteItemEntry) => {
    const safeQty = Math.max(entry.snapshot_moq || 1, Math.floor(entry.quantity));
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === entry.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === entry.product_id
            ? { ...i, quantity: Math.min(1_000_000, i.quantity + safeQty) }
            : i,
        );
      }
      return [...prev, { ...entry, quantity: safeQty }];
    });
    setLastAddedAt(Date.now());
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item;
        const min = Math.max(1, item.snapshot_moq || 1);
        const clamped = Math.max(min, Math.min(1_000_000, Math.floor(quantity || min)));
        return { ...item, quantity: clamped };
      }),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const clearQuote = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <QuoteContext.Provider
      value={{
        items,
        totalCount: items.length,
        lastAddedAt,
        addItem,
        updateQuantity,
        removeItem,
        clearQuote,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote(): QuoteContextValue {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error('useQuote must be used inside QuoteProvider');
  }
  return ctx;
}
