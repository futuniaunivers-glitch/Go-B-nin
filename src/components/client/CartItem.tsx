import React, { useState } from 'react';
import { Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { CartResolvedItem } from '../../types';
import { formatFCFA } from '../../lib/format';
import { QuantityStepper } from '../ui/QuantityStepper';
import { Badge } from '../ui/Badge';

interface CartItemProps {
  item: CartResolvedItem;
  onUpdateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  onRemove: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const [stockNotice, setStockNotice] = useState<string | null>(null);
  const { product, quantity, unitPrice, subtotal, mode, nextTier } = item;

  const handleQtyChange = (newQty: number) => {
    const res = onUpdateQuantity(product.id, newQty);
    if (res.message) {
      setStockNotice(res.message);
      setTimeout(() => setStockNotice(null), 3000);
    } else {
      setStockNotice(null);
    }
  };

  // Rule of minimums reminder (Section 7):
  // If in detail mode, but product has wholesale tiers and nextTier exists:
  // "Prix de gros à partir de {minQuantity} pièces. Plus que {N} pièce(s) pour passer à {prix} F l'unité."
  const showWholesaleIncentive =
    mode === 'detail' && product.wholesaleEnabled && nextTier !== null;
  const piecesNeededForWholesale = nextTier ? Math.max(1, nextTier.minQuantity - quantity) : 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-white shadow-2xs space-y-3">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
          {product.thumbUrl || product.imageUrl ? (
            <img
              src={product.thumbUrl || product.imageUrl || ''}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
              Senteur
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-zinc-900 text-sm sm:text-base leading-snug line-clamp-2">
              {product.name}
            </h4>
            <button
              onClick={() => onRemove(product.id)}
              className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
              title="Supprimer cet article"
              aria-label="Supprimer du panier"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Unit price & wholesale badge */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 tabular-nums">
              {formatFCFA(unitPrice)} / pce
            </span>

            {mode === 'wholesale' ? (
              <Badge variant="wholesale" size="sm">
                Prix de gros appliqué
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Prix détail
              </Badge>
            )}
          </div>

          {/* Stepper & Line Subtotal */}
          <div className="mt-3 flex items-center justify-between gap-4">
            <QuantityStepper
              value={quantity}
              min={1}
              max={product.stock}
              onChange={handleQtyChange}
              size="sm"
            />

            <div className="text-right">
              <span className="text-[11px] text-zinc-400 block sm:inline mr-1">Sous-total :</span>
              <span className="text-base sm:text-lg font-black text-zinc-900 tabular-nums">
                {formatFCFA(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock warning if user hit the max */}
      {stockNotice && (
        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/80">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{stockNotice}</span>
        </div>
      )}

      {/* Wholesale incentive box (Section 7) */}
      {showWholesaleIncentive && nextTier && (
        <div className="flex items-start gap-2 text-xs bg-violet-50/70 border border-violet-200 text-violet-900 p-2.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Prix de gros à partir de <strong>{nextTier.minQuantity} pièces</strong>. Plus que{' '}
            <strong className="text-violet-800">{piecesNeededForWholesale} pièce(s)</strong> pour
            passer à <strong className="text-violet-800 tabular-nums">{formatFCFA(nextTier.pricePerUnit)}</strong> l'unité.
          </p>
        </div>
      )}
    </div>
  );
};
