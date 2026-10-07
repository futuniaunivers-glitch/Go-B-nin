import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface ConditionsBoxProps {
  conditions: string[];
  accepted: boolean;
  onToggleAccept: (accepted: boolean) => void;
  error?: string;
}

export const ConditionsBox: React.FC<ConditionsBoxProps> = ({
  conditions,
  accepted,
  onToggleAccept,
  error,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 space-y-4 shadow-2xs">
      <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
        <ShieldCheck className="w-5 h-5 text-violet-700 shrink-0" />
        <span>Conditions Générales de Vente (À lire obligatoirement)</span>
      </div>

      <ul className="space-y-2 text-xs sm:text-sm text-zinc-700">
        {conditions.map((condition, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="font-bold text-violet-800 shrink-0">{index + 1}.</span>
            <span className="leading-snug">{condition}</span>
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-zinc-200">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onToggleAccept(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded-md border-zinc-300 text-violet-700 focus:ring-violet-500 cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-violet-800 transition-colors">
            J'ai lu et j'accepte les conditions de vente ci-dessus. <span className="text-rose-600">*</span>
          </span>
        </label>

        {error && (
          <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
};
