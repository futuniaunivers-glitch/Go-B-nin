/**
 * Generates an order number formatted as GS229-AAMMJJ-XXXX
 * XXXX is 4 random characters chosen from ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (no confusing I, O, 0, 1)
 */
export function generateOrderNumber(date = new Date()): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    rand += chars[idx];
  }

  return `GS229-${year}${month}${day}-${rand}`;
}
