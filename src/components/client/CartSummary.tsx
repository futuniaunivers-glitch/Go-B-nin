import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, TrendingDown } from 'lucide-react';
import { formatFCFA } from '../../lib/format';
import { Button } from '../ui/Button';

interface CartSummaryProps {
  totalAmount: number;
  totalQuantity: number;
  totalSavings: number;
  onProceedToCheckout?: () => void;
  checkoutDisabled?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  totalAmount,
  totalQuantity,
  totalSavings,
  onProceedToCheckout,
  checkoutDisabled = false,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <h3 className="text-base font-bold text-zinc-900 pb-3 border-b border-zinc-100">
        Récapitulatif de la commande
      </h3>

      <div className="space-y-2.5 text-sm text-zinc-600">
        <div className="flex justify-between">
          <span>Articles ({totalQuantity})</span>
          <span className="font-semibold text-zinc-900 tabular-nums">{formatFCFA(totalAmount + totalSavings)}</span>
        </div>

        {totalSavings > 0 && (
          <div className="flex justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 font-semibold text-xs">
            <span className="inline-flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              Économies tarif gros
            </span>
            <span className="tabular-nums">-{formatFCFA(totalSavings)}</span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t border-zinc-100 items-baseline">
          <div>
            <span className="text-base font-bold text-zinc-900 block">TOTAL PRODUITS</span>
            <span className="text-xs text-zinc-500 italic">
              (Les frais de livraison ne sont pas inclus.)
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-zinc-950 tabular-nums">
            {formatFCFA(totalAmount)}
          </span>
        </div>
      </div>

      <div className="pt-3 space-y-2.5">
        {onProceedToCheckout ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onProceedToCheckout}
            disabled={checkoutDisabled || totalQuantity === 0}
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Passer la commande
          </Button>
        ) : (
          <Link to="/commande" className="block">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={checkoutDisabled || totalQuantity === 0}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Passer la commande
            </Button>
          </Link>
        )}

        <Link to="/produits" className="block text-center">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full"
            icon={<ShoppingBag className="w-4 h-4" />}
          >
            Continuer mes achats
          </Button>
        </Link>
      </div>
    </div>
  );
};
