import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max,
  onChange,
  size = 'md',
  disabled = false,
}) => {
  const safeMax = Math.max(min, max || min);

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < safeMax) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseInt(e.target.value, 10);
    if (isNaN(rawVal)) {
      onChange(min);
      return;
    }
    const clamped = Math.max(min, Math.min(rawVal, safeMax));
    onChange(clamped);
  };

  const sizeClasses = {
    sm: {
      btn: 'w-7 h-7 text-xs',
      input: 'w-10 h-7 text-xs',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      btn: 'w-8 h-8 text-sm',
      input: 'w-12 h-8 text-sm font-semibold',
      icon: 'w-4 h-4',
    },
    lg: {
      btn: 'w-10 h-10 text-base',
      input: 'w-14 h-10 text-base font-bold',
      icon: 'w-5 h-5',
    },
  };

  return (
    <div className="inline-flex items-center rounded-xl border border-zinc-200 bg-white p-0.5 shadow-2xs">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className={`flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer active:scale-95 ${sizeClasses[size].btn}`}
        aria-label="Diminuer la quantité"
      >
        <Minus className={sizeClasses[size].icon} />
      </button>

      <input
        type="number"
        min={min}
        max={safeMax}
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
        className={`text-center bg-transparent border-0 focus:outline-hidden text-zinc-900 font-semibold tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${sizeClasses[size].input}`}
      />

      <button
        type="button"
        disabled={disabled || value >= safeMax}
        onClick={handleIncrement}
        className={`flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer active:scale-95 ${sizeClasses[size].btn}`}
        aria-label="Augmenter la quantité"
      >
        <Plus className={sizeClasses[size].icon} />
      </button>
    </div>
  );
};
