import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { formatFCFA } from '../../lib/format';

interface SavedOrderSession {
  orderNumber: string;
  customerName: string;
  phone: string;
  total: number;
  whatsAppMessage: string;
  whatsAppUrl: string;
}

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const orderNumber = searchParams.get('n') || '';

  const [orderSession, setOrderSession] = useState<SavedOrderSession | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('gds229_last_order');
      if (raw) {
        setOrderSession(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');
  const whatsAppUrl =
    orderSession?.whatsAppUrl ||
    `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      orderSession?.whatsAppMessage || `Bonjour, commande N° ${orderNumber}`
    )}`;

  const handleOpenWhatsApp = () => {
    window.location.href = whatsAppUrl;
  };

  const handleCopyMessage = async () => {
    if (!orderSession?.whatsAppMessage) return;
    try {
      await navigator.clipboard.writeText(orderSession.whatsAppMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const isLongMessage = (orderSession?.whatsAppMessage?.length || 0) > 1500;

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 text-center pb-24">
      {/* Top Success Badge */}
      <div className="space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in-75">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Commande prête à être validée !
        </h1>

        <div className="inline-block px-4 py-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 font-black text-base sm:text-lg tracking-wider">
          N° {orderNumber || orderSession?.orderNumber || 'GS229'}
        </div>

        <p className="text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed font-normal">
          Votre bon de commande a été préparé avec succès. Cliquez sur le bouton ci-dessous pour
          envoyer le message prérempli à notre équipe sur WhatsApp.
        </p>
      </div>

      {/* Main WhatsApp Action */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-md space-y-4 text-left">
        <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>Étape 1 : Ouvrir WhatsApp et envoyer votre bon</span>
        </h3>

        <p className="text-xs text-zinc-500">
          Votre message contient tous les détails de vos articles, vos quantités, votre adresse et
          le total.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="whatsapp"
            size="lg"
            className="flex-1 text-base sm:text-lg py-4 shadow-md"
            onClick={handleOpenWhatsApp}
            icon={<MessageCircle className="w-5 h-5 fill-white text-transparent" />}
          >
            Ouvrir WhatsApp
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCopyMessage}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Message copié !' : 'Copier le texte'}
          </Button>
        </div>

        {isLongMessage && (
          <p className="text-xs text-violet-900 bg-violet-50 p-2.5 rounded-xl border border-violet-100 font-medium">
            💡 Astuce : Votre commande contient beaucoup d'articles. Si le message ne s'ouvre pas
            automatiquement, utilisez "Copier le texte" puis collez-le directement dans WhatsApp.
          </p>
        )}
      </div>

      {/* Payment and Delivery Instructions Box */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 text-left space-y-4">
        <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-violet-700" />
          <span>Étape 2 : Paiement Mobile Money &amp; Confirmation</span>
        </h3>

        <div className="space-y-2.5 text-xs sm:text-sm text-zinc-700">
          <div className="flex items-start gap-2">
            <span className="font-bold text-violet-800">1.</span>
            <span>
              <strong>Paiement préalable exigé</strong> par MTN Mobile Money ou Moov Money dès
              réception du total avec les frais de livraison convenus.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-bold text-violet-800">2.</span>
            <span>
              <strong>Aucun paiement à la livraison</strong> pour les marchandises. À l'arrivée du
              livreur, vous ne réglez que les frais de course.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-bold text-violet-800">3.</span>
            <span>
              Les commandes sont immédiatement préparées et expédiées après confirmation du
              règlement.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="pt-2">
        <Link to="/produits">
          <Button
            variant="outline"
            size="md"
            icon={<ShoppingBag className="w-4 h-4" />}
          >
            Retourner au catalogue
          </Button>
        </Link>
      </div>
    </div>
  );
};
