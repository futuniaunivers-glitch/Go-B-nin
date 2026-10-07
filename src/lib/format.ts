/**
 * Formats a monetary amount in FCFA with regular space thousands separator.
 * Integers only, no decimals.
 */
export function formatFCFA(amount: number, short = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return short ? '0 F' : '0 FCFA';
  }

  const rounded = Math.round(amount);
  // Format with standard regular space (ASCII 32, \u0020), NOT narrow no-break space
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return short ? `${formatted} F` : `${formatted} FCFA`;
}

/**
 * Formats a phone number for display (e.g. +229 01 62 01 88 07)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.trim();
}

/**
 * Returns derived stock status string and style classes
 */
export function getStockStatus(stock: number, lowStockThreshold = 10): {
  status: 'Rupture' | 'Stock faible' | 'Disponible';
  badgeClass: string;
  badgeLabel: string;
} {
  if (stock <= 0) {
    return {
      status: 'Rupture',
      badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      badgeLabel: 'Rupture',
    };
  }
  if (stock <= lowStockThreshold) {
    return {
      status: 'Stock faible',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      badgeLabel: `Plus que ${stock} en stock`,
    };
  }
  return {
    status: 'Disponible',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    badgeLabel: 'Disponible',
  };
}
