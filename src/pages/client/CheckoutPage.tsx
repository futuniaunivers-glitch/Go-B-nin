import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { CheckoutForm, CheckoutFormData } from '../../components/client/CheckoutForm';
import { formatFCFA } from '../../lib/format';
import { generateOrderNumber } from '../../lib/orderNumber';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../../lib/whatsapp';
import { createOrder } from '../../services/orderService';
import { OrderItemSnapshot } from '../../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedItems, totalAmount, totalSavings, totalQuantity, validateCart, clearCart } =
    useCart();
  const { settings } = useSettings();

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (resolvedItems.length === 0) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">Votre panier est vide</h2>
        <p className="text-xs text-zinc-500">
          Veuillez ajouter des articles avant de passer commande.
        </p>
        <Link to="/produits" className="inline-block">
          <Button variant="primary" size="md">
            Voir le catalogue
          </Button>
        </Link>
      </div>
    );
  }

  const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
    setValidationError(null);
    setSubmitting(true);

    try {
      // 1. Revalidate cart items against current inventory
      const validation = await validateCart();
      if (!validation.isValid) {
        setValidationError(
          `Certains articles de votre panier ont été modifiés suite à la mise à jour des stocks :\n• ${validation.messages.join(
            '\n• '
          )}\nVeuillez vérifier votre commande avant de continuer.`
        );
        setSubmitting(false);
        return;
      }

      // 2. Generate order number
      const orderNumber = generateOrderNumber();

      // Snapshot items
      const itemsSnapshot: OrderItemSnapshot[] = resolvedItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        priceMode: item.mode,
      }));

      // 3. Build WhatsApp message and link
      const whatsAppMessage = buildWhatsAppMessage({
        orderNumber,
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        deliveryNote: formData.deliveryNote.trim(),
        extraNote: formData.extraNote.trim(),
        items: itemsSnapshot,
        total: totalAmount,
      });

      const whatsAppUrl = buildWhatsAppUrl(settings.whatsappNumber, whatsAppMessage);

      // 4. Save order to Firestore / local storage (non-blocking if it fails)
      try {
        await createOrder({
          orderNumber,
          customerName: formData.customerName.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          deliveryNote: formData.deliveryNote.trim(),
          extraNote: formData.extraNote.trim() || undefined,
          items: itemsSnapshot,
          total: totalAmount,
          acceptedConditions: true,
        });
      } catch (err) {
        console.warn('Could not save order document:', err);
      }

      // Store order details in sessionStorage for the confirmation page
      sessionStorage.setItem(
        'gds229_last_order',
        JSON.stringify({
          orderNumber,
          customerName: formData.customerName.trim(),
          phone: formData.phone.trim(),
          total: totalAmount,
          items: itemsSnapshot,
          whatsAppMessage,
          whatsAppUrl,
        })
      );

      // 5. Clear cart
      clearCart();

      // 6. Navigate to confirmation page with order number
      navigate(`/commande/envoyee?n=${orderNumber}`);
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Une erreur est survenue lors de l’envoi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <Link
          to="/panier"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-violet-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Modifier mon panier</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Finaliser ma commande
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Renseignez vos coordonnées de livraison pour générer votre commande WhatsApp.
        </p>
      </div>

      {/* Validation alert if inventory changed */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Vérification du panier :</span>
          </div>
          <p className="whitespace-pre-line leading-relaxed font-medium">{validationError}</p>
        </div>
      )}

      {/* 1) Collapsible Summary */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 border border-violet-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-semibold">
                Récapitulatif de vos articles ({totalQuantity})
              </div>
              <div className="text-base sm:text-lg font-black text-zinc-900 tabular-nums">
                Total : {formatFCFA(totalAmount)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-violet-700">
            <span>{isSummaryOpen ? 'Masquer' : 'Voir les détails'}</span>
            {isSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isSummaryOpen && (
          <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/50 space-y-3">
            <div className="divide-y divide-zinc-200 text-xs">
              {resolvedItems.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-900 block truncate">
                      {item.product.name}
                    </span>
                    <span className="text-zinc-500">
                      {item.quantity} × {formatFCFA(item.unitPrice)}
                      {item.mode === 'wholesale' && (
                        <span className="text-violet-700 font-semibold ml-1">(prix gros)</span>
                      )}
                    </span>
                  </div>
                  <span className="font-bold text-zinc-900 shrink-0 tabular-nums">
                    {formatFCFA(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline font-bold text-sm">
              <span className="text-zinc-600">Total produits :</span>
              <span className="text-zinc-950 font-black text-base tabular-nums">{formatFCFA(totalAmount)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="text-xs text-emerald-700 font-semibold text-right tabular-nums">
                Économies réalisées grâce au tarif gros : -{formatFCFA(totalSavings)}
              </div>
            )}
            <div className="text-[11px] text-zinc-400 italic text-right">
              (Frais de livraison non inclus, réglés au livreur)
            </div>
          </div>
        )}
      </div>

      {/* 2 & 3 & 4) Checkout Form with Conditions and WhatsApp Send Button */}
      <CheckoutForm onSubmit={handleCheckoutSubmit} loading={submitting} />
    </div>
  );
};
