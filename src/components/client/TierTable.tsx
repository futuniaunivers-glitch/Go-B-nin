import React from 'react';
import { WholesaleTier } from '../../types';
import { formatFCFA } from '../../lib/format';
import { Sparkles, TrendingDown } from 'lucide-react';

interface TierTableProps {
  detailPrice: number;
  tiers: WholesaleTier[];
  currentQuantity?: number;
}

export const TierTable: React.FC<TierTableProps> = ({
  detailPrice,
  tiers,
  currentQuantity = 1,
}) => {
  if (!tiers || tiers.length === 0) return null;

  const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-700" />
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Paliers de Prix de Gros
          </h4>
        </div>
        <span className="text-xs font-medium text-zinc-500">
          Prix détail : <span className="font-bold text-zinc-900 tabular-nums">{formatFCFA(detailPrice)}</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-100 text-zinc-500 bg-zinc-50/50">
              <th className="py-2.5 px-3.5 font-semibold">Quantité</th>
              <th className="py-2.5 px-3.5 font-semibold">Prix / pièce</th>
              <th className="py-2.5 px-3.5 font-semibold text-right">Économie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium">
            {sortedTiers.map((tier, idx) => {
              const saving = detailPrice - tier.pricePerUnit;
              const isEligible = currentQuantity >= tier.minQuantity;
              const nextTierMin = sortedTiers[idx + 1]?.minQuantity;
              const isActive =
                isEligible && (nextTierMin === undefined || currentQuantity < nextTierMin);

              return (
                <tr
                  key={tier.minQuantity}
                  className={`transition-colors ${
                    isActive
                      ? 'bg-violet-50/80 font-bold text-violet-950 ring-1 ring-violet-200 inset-0'
                      : 'hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  <td className="py-2.5 px-3.5">
                    <span className="inline-flex items-center gap-1.5">
                      Dès {tier.minQuantity} pièces
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-700 text-white font-bold">
                          Actif
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 font-bold text-violet-900 tabular-nums">
                    {formatFCFA(tier.pricePerUnit)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right text-emerald-700 font-semibold tabular-nums">
                    <span className="inline-flex items-center gap-1 justify-end">
                      <TrendingDown className="w-3 h-3 text-emerald-600" />
                      -{formatFCFA(saving, true)} / pce
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-zinc-50 text-[11px] text-zinc-500 border-t border-zinc-100">
        💡 Le prix de gros s'applique automatiquement dans votre panier dès que le seuil est atteint.
      </div>
    </div>
  );
};
