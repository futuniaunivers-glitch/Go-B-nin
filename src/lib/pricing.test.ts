import { getApplicablePrice } from './pricing';
import { WholesaleTier } from '../types';

/**
 * Unit test assertions for the pricing engine.
 * Test case specification from prompt:
 * detailPrice: 3000
 * wholesaleTiers: {3 -> 2700, 6 -> 2500, 12 -> 2300}
 *
 * Expected:
 * qty 0  -> 0 F
 * qty 1  -> 3000 F (detail)
 * qty 2  -> 3000 F (detail, subtotal 6000)
 * qty 3  -> 2700 F (wholesale, subtotal 8100)
 * qty 5  -> 2700 F (wholesale, subtotal 13500)
 * qty 6  -> 2500 F (wholesale, subtotal 15000)
 * qty 8  -> 2500 F (wholesale, subtotal 20000)
 * qty 11 -> 2500 F (wholesale, subtotal 27500)
 * qty 12 -> 2300 F (wholesale, subtotal 27600)
 * qty 13 -> 2300 F (wholesale, subtotal 29900)
 *
 * Product without wholesale:
 * qty 5  -> 3000 F (detail, subtotal 15000)
 */

export function runPricingTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  const testProduct = {
    detailPrice: 3000,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 3, pricePerUnit: 2700 },
      { minQuantity: 6, pricePerUnit: 2500 },
      { minQuantity: 12, pricePerUnit: 2300 },
    ] as WholesaleTier[],
  };

  const noWholesaleProduct = {
    detailPrice: 3000,
    wholesaleEnabled: false,
    wholesaleTiers: [] as WholesaleTier[],
  };

  const cases = [
    { qty: 0, expectedUnitPrice: 3000, expectedSubtotal: 0, expectedMode: 'detail' },
    { qty: 1, expectedUnitPrice: 3000, expectedSubtotal: 3000, expectedMode: 'detail' },
    { qty: 2, expectedUnitPrice: 3000, expectedSubtotal: 6000, expectedMode: 'detail' },
    { qty: 3, expectedUnitPrice: 2700, expectedSubtotal: 8100, expectedMode: 'wholesale' },
    { qty: 5, expectedUnitPrice: 2700, expectedSubtotal: 13500, expectedMode: 'wholesale' },
    { qty: 6, expectedUnitPrice: 2500, expectedSubtotal: 15000, expectedMode: 'wholesale' },
    { qty: 8, expectedUnitPrice: 2500, expectedSubtotal: 20000, expectedMode: 'wholesale' },
    { qty: 11, expectedUnitPrice: 2500, expectedSubtotal: 27500, expectedMode: 'wholesale' },
    { qty: 12, expectedUnitPrice: 2300, expectedSubtotal: 27600, expectedMode: 'wholesale' },
    { qty: 13, expectedUnitPrice: 2300, expectedSubtotal: 29900, expectedMode: 'wholesale' },
  ];

  for (const c of cases) {
    const res = getApplicablePrice(testProduct, c.qty);
    const pass =
      res.unitPrice === c.expectedUnitPrice &&
      res.subtotal === c.expectedSubtotal &&
      res.mode === c.expectedMode;

    if (!pass) {
      allPassed = false;
      results.push(
        `FAIL: qty ${c.qty} -> got ${res.unitPrice}F (${res.mode}), total: ${res.subtotal}. Expected ${c.expectedUnitPrice}F (${c.expectedMode}), total: ${c.expectedSubtotal}`
      );
    } else {
      results.push(`PASS: qty ${c.qty} -> ${res.unitPrice} F [${res.mode}] = ${res.subtotal} F`);
    }
  }

  // Without wholesale test
  const resNoWholesale = getApplicablePrice(noWholesaleProduct, 5);
  if (
    resNoWholesale.unitPrice === 3000 &&
    resNoWholesale.subtotal === 15000 &&
    resNoWholesale.mode === 'detail'
  ) {
    results.push('PASS: product without wholesale qty 5 -> 3000 F [detail] = 15 000 F');
  } else {
    allPassed = false;
    results.push('FAIL: product without wholesale failed');
  }

  return { passed: allPassed, results };
}
