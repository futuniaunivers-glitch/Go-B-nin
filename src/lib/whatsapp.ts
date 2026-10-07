import { OrderItemSnapshot } from '../types';
import { formatFCFA } from './format';

export interface WhatsAppOrderData {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  area: string;
  deliveryNote: string;
  extraNote?: string;
  items: OrderItemSnapshot[];
  total: number;
}

/**
 * Builds the exact WhatsApp message formatted as specified in Section 10.
 */
export function buildWhatsAppMessage(data: WhatsAppOrderData): string {
  const lines: string[] = [
    'Bonjour Grossiste des Senteurs 229 👋🏽',
    '',
    'Je souhaite passer une commande.',
    `N° : ${data.orderNumber}`,
    '',
    '🛍️ PRODUITS',
  ];

  for (const item of data.items) {
    const unitPriceFormatted = formatFCFA(item.unitPrice, true); // e.g. "2 500 F"
    const subtotalFormatted = formatFCFA(item.subtotal); // e.g. "20 000 FCFA"
    const wholesaleSuffix = item.priceMode === 'wholesale' ? ' (prix de gros)' : '';

    // • {nom} × {quantité} × {prix unitaire} F = {sous-total} FCFA
    lines.push(
      `• ${item.name} × ${item.quantity} × ${unitPriceFormatted}${wholesaleSuffix} = ${subtotalFormatted}`
    );
  }

  lines.push('');
  lines.push(`💰 TOTAL PRODUITS : ${formatFCFA(data.total)}`);
  lines.push('(Frais de livraison non inclus)');
  lines.push('');
  lines.push('👤 CLIENT');
  lines.push(`Nom : ${data.customerName}`);
  lines.push(`Téléphone : ${data.phone}`);
  lines.push(`Ville : ${data.city}`);
  lines.push(`Quartier : ${data.area}`);
  lines.push('');
  lines.push('📦 LIVRAISON');
  lines.push(data.deliveryNote);

  if (data.extraNote && data.extraNote.trim()) {
    lines.push(data.extraNote.trim());
  }

  lines.push('');
  lines.push("✅ J'ai pris connaissance des conditions de vente et je les accepte.");
  lines.push('');
  lines.push('Merci.');

  return lines.join('\n');
}

/**
 * Generates the complete wa.me link
 * whatsappNumber: digits only, international format without + (e.g. 2290162018807)
 */
export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
