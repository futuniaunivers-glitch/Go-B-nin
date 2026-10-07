import React from 'react';
import { ShieldCheck, Truck, CreditCard, AlertCircle, Phone, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ConditionsPage: React.FC = () => {
  const { settings } = useSettings();
  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="border-b border-zinc-200 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-900 border border-violet-100 text-xs font-semibold mb-2">
          <ShieldCheck className="w-4 h-4 text-violet-700" />
          <span>Charte Commerciale &amp; Transparence</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">
          Conditions Générales de Vente
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Règles applicables à toutes les commandes passées chez Grossiste des Senteurs 229.
        </p>
      </div>

      {/* Main conditions numbered list */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 sm:p-8 space-y-6 shadow-2xs">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-violet-700" />
          <span>Points essentiels à retenir</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {settings.salesConditions.map((condition, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {index + 1}
              </div>
              <p className="font-medium text-zinc-800 text-sm sm:text-base leading-relaxed mt-0.5">
                {condition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Expéditions */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-4 shadow-2xs">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2.5">
          <Truck className="w-5 h-5 text-violet-700" />
          <span>Modalités de livraison et expédition</span>
        </h2>

        <p className="text-sm text-zinc-600 leading-relaxed">
          {settings.deliveryInfo}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <h4 className="font-bold text-zinc-900">Cotonou &amp; Calavi</h4>
            <p className="text-zinc-600 leading-relaxed">
              Livraison le jour même ou sous 24h par zem ou livreur dédié. Les frais de course
              dépendent de votre zone exacte et sont réglés directement au livreur.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <h4 className="font-bold text-zinc-900">Autres Villes du Bénin</h4>
            <p className="text-zinc-600 leading-relaxed">
              Expédition par les compagnies de bus et taxis de gare (Porto-Novo, Parakou, Bohicon,
              Natitingou, Ouidah, Lokossa...). Colis soigné et sécurisé.
            </p>
          </div>
        </div>
      </div>

      {/* Need assistance */}
      <div className="p-6 rounded-3xl bg-zinc-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-800">
        <div>
          <h3 className="font-bold text-base text-white">Une question sur les conditions ?</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Notre service client est disponible tous les jours sur WhatsApp.
          </p>
        </div>

        <a
          href={`https://wa.me/${cleanWhatsAppNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors"
        >
          <MessageCircle className="w-4 h-4 fill-white text-transparent" />
          <span>Discuter avec nous</span>
        </a>
      </div>
    </div>
  );
};
