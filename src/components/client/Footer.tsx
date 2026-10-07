import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, ExternalLink, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-12 pb-24 md:pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-10 border-b border-zinc-800/80">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Prix de Gros Directs</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Paliers dégressifs dès 3 pièces par article (6 pièces pour les huiles mini-format).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Livraison Partout au Bénin</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Cotonou &amp; Calavi par livreur. Expéditions sécurisées en province par bus et taxis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Mobile Money &amp; Moov Money</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Règlement direct exigé avant expédition. Confirmation immédiate sur WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-700 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                229
              </div>
              <h3 className="font-bold text-base text-white">{settings.businessName}</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
              Grossiste de référence au Bénin en parfumerie Dubaï &amp; orientale, huiles
              concentrées sans alcool, déodorants de marque et diffuseurs d’ambiance.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium pt-1">
              <MapPin className="w-4 h-4 shrink-0 text-violet-400" />
              <span>{settings.locationText}</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3.5">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/produits" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  Tous les produits
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link to="/panier" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  Mon Panier
                </Link>
              </li>
              <li>
                <Link to="/conditions" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  Conditions de vente
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  Contact &amp; Localisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials & Contact */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3.5">
              Contact &amp; Réseaux
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{settings.phone}</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsAppNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>WhatsApp Direct</span>
              </a>

              {settings.whatsappChannelUrl && (
                <a
                  href={settings.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>Chaîne WhatsApp</span>
                </a>
              )}

              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>TikTok Officiel</span>
                </a>
              )}

              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>Page Facebook</span>
                </a>
              )}

              {settings.mapsUrl && (
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>Google Maps</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 mt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} {settings.businessName}. Tous droits réservés.</p>
          <div className="flex items-center gap-3">
            <Link to="/conditions" className="hover:text-zinc-400">
              Conditions de vente
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-zinc-400">
              Assistance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
