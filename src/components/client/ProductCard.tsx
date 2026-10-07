import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA, getStockStatus } from '../../lib/format';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onAddedToCart?: (productName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  onAddedToCart,
}) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const stockInfo = getStockStatus(product.stock, product.lowStockThreshold);

  // Lowest wholesale price
  let lowestTierPrice: number | null = null;
  let lowestTierQty: number | null = null;
  if (product.wholesaleEnabled && product.wholesaleTiers?.length > 0) {
    const sorted = [...product.wholesaleTiers].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    lowestTierPrice = sorted[0].pricePerUnit;
    const sortedByQty = [...product.wholesaleTiers].sort((a, b) => a.minQuantity - b.minQuantity);
    lowestTierQty = sortedByQty[0].minQuantity;
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const res = addToCart(product.id, 1);
    if (res.success) {
      setJustAdded(true);
      if (onAddedToCart) onAddedToCart(product.name);
      setTimeout(() => setJustAdded(false), 1600);
    }
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-white shadow-2xs hover:shadow-md ${
        isOutOfStock
          ? 'opacity-65 border-zinc-200 grayscale-30 bg-zinc-50/50'
          : 'border-zinc-200 hover:border-violet-300'
      }`}
    >
      {/* Product Image */}
      <Link to={`/produits/${product.id}`} className="relative block aspect-square overflow-hidden bg-zinc-100">
        {product.thumbUrl || product.imageUrl ? (
          <img
            src={product.thumbUrl || product.imageUrl || ''}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100">
            <ShoppingBag className="w-10 h-10 stroke-1 text-zinc-300" />
            <span className="text-[11px] font-medium mt-1">Photo à venir</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shadow-2xs ${stockInfo.badgeClass}`}
          >
            {stockInfo.badgeLabel}
          </span>
        </div>

        {/* Wholesale indicator badge */}
        {product.wholesaleEnabled && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-950/85 text-violet-200 border border-violet-500/20 backdrop-blur-xs">
              Gros dès {lowestTierQty} pcs
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {categoryName && (
          <span className="text-[11px] font-semibold text-violet-700 uppercase tracking-wider mb-1 line-clamp-1">
            {categoryName}
          </span>
        )}

        <Link
          to={`/produits/${product.id}`}
          className="font-bold text-zinc-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-violet-700 transition-colors"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Pricing */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-500 font-medium">Prix détail</span>
            <span className="text-base sm:text-lg font-black text-zinc-900 tabular-nums">
              {formatFCFA(product.detailPrice)}
            </span>
          </div>

          {lowestTierPrice && (
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-violet-800 font-semibold">Prix de gros</span>
              <span className="font-bold text-violet-700 tabular-nums">
                dès {formatFCFA(lowestTierPrice, true)} / pce
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-1">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-semibold cursor-not-allowed text-center border border-zinc-200"
            >
              Indisponible
            </button>
          ) : (
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:translate-y-px ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-700 hover:bg-violet-800 active:bg-violet-900 text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Ajouter au panier</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
