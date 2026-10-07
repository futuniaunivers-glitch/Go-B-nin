import { Product, WholesaleTier } from '../types';

export interface ApplicablePriceResult {
  unitPrice: number;
  subtotal: number;
  mode: 'detail' | 'wholesale';
  appliedTier: WholesaleTier | null;
  nextTier: WholesaleTier | null;
  savings: number;
}

/**
 * Pure pricing engine function.
 * Evaluates applicable price, active tier, next tier, subtotal and savings.
 */
export function getApplicablePrice(
  product: Pick<Product, 'detailPrice' | 'wholesaleEnabled' | 'wholesaleTiers'>,
  quantity: number
): ApplicablePriceResult {
  const safeQty = Math.max(0, Math.floor(quantity || 0));
  const detailPrice = Math.max(0, Math.round(product.detailPrice || 0));

  // If no wholesale or empty tiers
  if (
    !product.wholesaleEnabled ||
    !product.wholesaleTiers ||
    product.wholesaleTiers.length === 0 ||
    safeQty === 0
  ) {
    const subtotal = detailPrice * safeQty;
    return {
      unitPrice: detailPrice,
      subtotal,
      mode: 'detail',
      appliedTier: null,
      nextTier: null,
      savings: 0,
    };
  }

  // Sort tiers ascending by minQuantity
  const sortedTiers = [...product.wholesaleTiers]
    .filter((t) => t.minQuantity >= 2 && t.pricePerUnit > 0)
    .sort((a, b) => a.minQuantity - b.minQuantity);

  if (sortedTiers.length === 0) {
    const subtotal = detailPrice * safeQty;
    return {
      unitPrice: detailPrice,
      subtotal,
      mode: 'detail',
      appliedTier: null,
      nextTier: null,
      savings: 0,
    };
  }

  // Find all tiers where safeQty >= minQuantity
  const eligibleTiers = sortedTiers.filter((t) => safeQty >= t.minQuantity);

  let appliedTier: WholesaleTier | null = null;
  let unitPrice = detailPrice;
  let mode: 'detail' | 'wholesale' = 'detail';

  if (eligibleTiers.length > 0) {
    // Retain the tier with the HIGHEST minQuantity
    appliedTier = eligibleTiers[eligibleTiers.length - 1];
    // Safety check: unit price must not exceed detailPrice
    unitPrice = Math.min(appliedTier.pricePerUnit, detailPrice);
    mode = 'wholesale';
  }

  // Find the next tier (smallest tier with minQuantity > safeQty)
  const nextTier = sortedTiers.find((t) => t.minQuantity > safeQty) || null;

  const subtotal = unitPrice * safeQty;
  const regularTotal = detailPrice * safeQty;
  const savings = Math.max(0, regularTotal - subtotal);

  return {
    unitPrice,
    subtotal,
    mode,
    appliedTier,
    nextTier,
    savings,
  };
}

/**
 * Validates wholesale tiers according to business rules:
 * - minQuantity strictly increasing
 * - pricePerUnit strictly decreasing from one tier to the next
 * - every pricePerUnit strictly less than detailPrice
 * - if wholesaleEnabled is true, at least 1 tier is required
 */
export function validateWholesaleTiers(
  wholesaleEnabled: boolean,
  detailPrice: number,
  tiers: WholesaleTier[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!wholesaleEnabled) {
    return { valid: true, errors: [] };
  }

  if (!tiers || tiers.length === 0) {
    errors.push('Si le prix de gros est activé, au moins un palier est requis.');
    return { valid: false, errors };
  }

  let prevMinQty = 1;
  let prevPrice = detailPrice;

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    const indexStr = `Palier ${i + 1}`;

    if (!t.minQuantity || t.minQuantity < 2) {
      errors.push(`${indexStr} : La quantité minimale doit être d'au moins 2 pièces.`);
    }

    if (!t.pricePerUnit || t.pricePerUnit <= 0) {
      errors.push(`${indexStr} : Le prix unitaire doit être supérieur à 0 FCFA.`);
    }

    if (t.pricePerUnit >= detailPrice) {
      errors.push(
        `${indexStr} : Le prix de gros (${t.pricePerUnit} F) doit être strictement inférieur au prix détail (${detailPrice} F).`
      );
    }

    if (i > 0) {
      if (t.minQuantity <= prevMinQty) {
        errors.push(
          `${indexStr} : La quantité minimale (${t.minQuantity}) doit être strictement supérieure à celle du palier précédent (${prevMinQty}).`
        );
      }
      if (t.pricePerUnit >= prevPrice) {
        errors.push(
          `${indexStr} : Le prix unitaire (${t.pricePerUnit} F) doit être strictement inférieur au prix du palier précédent (${prevPrice} F).`
        );
      }
    }

    prevMinQty = t.minQuantity;
    prevPrice = t.pricePerUnit;
  }

  return { valid: errors.length === 0, errors };
}
