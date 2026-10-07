import React from 'react';
import { Plus, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { WholesaleTier } from '../../types';
import { formatFCFA } from '../../lib/format';
import { validateWholesaleTiers } from '../../lib/pricing';

interface TierEditorProps {
  wholesaleEnabled: boolean;
  detailPrice: number;
  tiers: WholesaleTier[];
  onChange: (tiers: WholesaleTier[]) => void;
}

export const TierEditor: React.FC<TierEditorProps> = ({
  wholesaleEnabled,
  detailPrice,
  tiers,
  onChange,
}) => {
  if (!wholesaleEnabled) return null;

  const validation = validateWholesaleTiers(wholesaleEnabled, detailPrice, tiers);

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMinQty = lastTier ? lastTier.minQuantity + 3 : 3;
    const newPrice = lastTier
      ? Math.max(500, lastTier.pricePerUnit - 300)
      : Math.max(500, detailPrice - 500);

    onChange([...tiers, { minQuantity: newMinQty, pricePerUnit: newPrice }]);
  };

  const handleUpdateTier = (
    index: number,
    field: keyof WholesaleTier,
    value: number
  ) => {
    const updated = tiers.map((t, i) => {
      if (i === index) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onChange(updated);
  };

  const handleRemoveTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-violet-50/40 border border-violet-200/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-700" />
          <h4 className="text-sm font-bold text-zinc-900">
            Paliers de prix de gros (dégressifs)
          </h4>
        </div>
        <button
          type="button"
          onClick={handleAddTier}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-700 text-white text-xs font-semibold hover:bg-violet-800 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un palier</span>
        </button>
      </div>

      <p className="text-xs text-zinc-600">
        Définissez les paliers. Le prix de gros s'applique automatiquement lorsque le client
        atteint la quantité requise pour cet article.
      </p>

      {tiers.length === 0 ? (
        <div className="text-center py-4 bg-white/70 rounded-xl border border-dashed border-violet-300 text-xs text-zinc-500">
          Aucun palier défini. Cliquez sur "Ajouter un palier" pour activer le tarif de gros.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs"
            >
              <span className="text-xs font-bold text-zinc-500 w-6">
                #{idx + 1}
              </span>

              <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Quantité min (≥ 2)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={2}
                      value={tier.minQuantity}
                      onChange={(e) =>
                        handleUpdateTier(idx, 'minQuantity', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-zinc-300 focus:border-violet-600 focus:outline-hidden"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400">
                      pcs
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Prix unitaire gros (&lt; {formatFCFA(detailPrice, true)})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={50}
                      value={tier.pricePerUnit}
                      onChange={(e) =>
                        handleUpdateTier(idx, 'pricePerUnit', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-zinc-300 focus:border-violet-600 focus:outline-hidden"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400">
                      FCFA
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveTier(idx)}
                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Supprimer ce palier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Validation Errors */}
      {!validation.valid && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Erreurs de validation des paliers :</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
