import React, { useState } from 'react';
import { OrderStatus } from '../../types';
import { Loader2 } from 'lucide-react';

interface OrderStatusSelectProps {
  currentStatus: OrderStatus;
  stockDeducted: boolean;
  onStatusChange: (newStatus: OrderStatus) => Promise<void>;
}

export const OrderStatusSelect: React.FC<OrderStatusSelectProps> = ({
  currentStatus,
  stockDeducted,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);

  const statuses: Array<{ value: OrderStatus; label: string; color: string }> = [
    { value: 'new', label: 'Nouvelle', color: 'bg-sky-50 text-sky-900 border-sky-200' },
    { value: 'confirmed', label: 'Confirmée', color: 'bg-amber-50 text-amber-900 border-amber-200' },
    { value: 'preparing', label: 'En préparation', color: 'bg-violet-50 text-violet-900 border-violet-200' },
    { value: 'delivered', label: 'Livrée', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
    { value: 'cancelled', label: 'Annulée', color: 'bg-rose-50 text-rose-900 border-rose-200' },
  ];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as OrderStatus;
    if (nextStatus === currentStatus) return;

    setLoading(true);
    try {
      await onStatusChange(nextStatus);
    } finally {
      setLoading(false);
    }
  };

  const activeColor = statuses.find((s) => s.value === currentStatus)?.color || '';

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative">
        <select
          value={currentStatus}
          disabled={loading}
          onChange={handleChange}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-hidden shadow-2xs transition-colors ${activeColor}`}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value} className="bg-white text-neutral-900">
              {s.label}
              {s.value === 'confirmed' && !stockDeducted ? ' (déduit le stock)' : ''}
              {s.value === 'cancelled' && stockDeducted ? ' (restitue le stock)' : ''}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute right-2 top-2 pointer-events-none">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" />
          </div>
        )}
      </div>

      {stockDeducted && (
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Stock déduit
        </span>
      )}
    </div>
  );
};
