import React from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="border-b border-zinc-200 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-900 border border-violet-100 text-xs font-semibold mb-2">
          <Sparkles className="w-4 h-4 text-violet-700" />
          <span>Toujours à votre écoute</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">
          Contact &amp; Localisation
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Retrouvez nos coordonnées, nos réseaux et nos horaires d'ouverture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Contacts */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-2xs space-y-6">
          <h2 className="text-lg font-bold text-zinc-900">Coordonnées directes</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block">Téléphone / Appel</span>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="font-bold text-zinc-900 text-base hover:text-violet-700 transition-colors"
                >
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block">WhatsApp Direct</span>
                <a
                  href={`https://wa.me/${cleanWhatsAppNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 text-base hover:underline"
                >
                  +{settings.whatsappNumber}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block">Localisation</span>
                <p className="font-semibold text-zinc-900 text-sm">{settings.locationText}</p>
                {settings.mapsUrl && (
                  <a
                    href={settings.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-700 hover:underline font-bold mt-1"
                  >
                    <span>Ouvrir sur Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block">Disponibilité</span>
                <p className="font-semibold text-zinc-900 text-sm">
                  Du Lundi au Samedi : 08h00 – 20h00
                </p>
                <p className="text-xs text-zinc-500">Commandes WhatsApp 7j/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Networks & Communities */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-2xs space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet-700" />
            <span>Nos réseaux officiels</span>
          </h2>

          <div className="space-y-3">
            {settings.whatsappChannelUrl && (
              <a
                href={settings.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    WA
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-800">
                      Chaîne WhatsApp Officielle
                    </h4>
                    <span className="text-xs text-zinc-500">
                      Recevez les arrivages et nouveautés en direct
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-emerald-700" />
              </a>
            )}

            {settings.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 hover:border-pink-300 hover:bg-pink-50/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-800 flex items-center justify-center font-bold">
                    TK
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 group-hover:text-pink-800">
                      Compte TikTok
                    </h4>
                    <span className="text-xs text-zinc-500">
                      Vidéos de présentation et démonstrations
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-pink-700" />
              </a>
            )}

            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    FB
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 group-hover:text-blue-800">
                      Page Facebook
                    </h4>
                    <span className="text-xs text-zinc-500">
                      Actualités, avis clients et promotions
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-700" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
