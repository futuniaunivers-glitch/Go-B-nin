import React, { useState } from 'react';
import { Minus, Plus, Check, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA, getStockStatus } from '../../lib/format';
import { updateProductStock } from '../../services/productService';

interface StockRowProps {
  product: Product;
  categoryName?: string;
  onStockUpdated: (productId: string, newStock: number) => void;
}

export const StockRow: React.FC<StockRowProps> = ({
  product,
  categoryName,
  onStockUpdated,
}) => {
  const [stockValue, setStockValue] = useState(product.stock);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const stockInfo = getStockStatus(stockValue, product.lowStockThreshold);

  const handleSave = async (newStock: number) => {
    const safeStock = Math.max(0, Math.round(newStock));
    setSaving(true);
    try {
      await updateProductStock(product.id, safeStock);
      setStockValue(safeStock);
      onStockUpdated(product.id, safeStock);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDecrement = () => {
    if (stockValue > 0) {
      const next = stockValue - 1;
      setStockValue(next);
      handleSave(next);
    }
  };

  const handleIncrement = () => {
    const next = stockValue + 1;
    setStockValue(next);
    handleSave(next);
  };

  const handleManualBlur = () => {
    if (stockValue !== product.stock) {
      handleSave(stockValue);
    }
  };

  return (
    <tr className="border-b border-zinc-200/80 hover:bg-zinc-50/70 transition-colors">
      {/* Product Image & Name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
            {product.thumbUrl || product.imageUrl ? (
              <img
                src={product.thumbUrl || product.imageUrl || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                Photo
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-900 line-clamp-1">{product.name}</div>
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <span>{categoryName || 'Catégorie'}</span>
              <span>•</span>
              <span className="font-semibold text-zinc-800 tabular-nums">{formatFCFA(product.detailPrice)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Current Status */}
      <td className="py-3 px-4">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${stockInfo.badgeClass}`}
        >
          {stockInfo.badgeLabel}
        </span>
      </td>

      {/* Fast Stock Controls */}
      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center gap-1.5 justify-end">
          <div className="inline-flex items-center rounded-xl border border-zinc-300 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              disabled={saving || stockValue <= 0}
              onClick={handleDecrement}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              min={0}
              value={stockValue}
              disabled={saving}
              onChange={(e) => setStockValue(parseInt(e.target.value, 10) || 0)}
              onBlur={handleManualBlur}
              className="w-14 h-8 text-center text-sm font-extrabold text-zinc-900 border-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              type="button"
              disabled={saving}
              onClick={handleIncrement}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-6 flex items-center justify-center">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
            ) : justSaved ? (
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            ) : null}
          </div>
        </div>
      </td>
    </tr>
  );
};
