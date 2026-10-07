import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

export const Header: React.FC = () => {
  const { totalQuantity } = useCart();
  const { settings } = useSettings();
  const location = useLocation();

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Catalogue', path: '/produits' },
    { label: 'Catégories', path: '/categories' },
    { label: 'Conditions', path: '/conditions' },
    { label: 'Contact', path: '/contact' },
  ];

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      {/* Top announcement bar */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="text-zinc-400">🇧🇯</span>
        <span className="truncate">
          Grossiste &amp; Détail de Senteurs à Cotonou • Parfums, Huiles, Déodorants &amp; Diffuseurs
        </span>
        <a
          href={`https://wa.me/${cleanWhatsAppNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-violet-300 hover:text-white ml-2 font-medium underline underline-offset-2 transition-colors"
        >
          WhatsApp : {settings.phone}
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-700 flex items-center justify-center text-white shadow-2xs group-hover:bg-violet-800 transition-colors">
            <span className="font-extrabold text-sm sm:text-base tracking-tight">229</span>
          </div>
          <div>
            <span className="block font-bold text-sm sm:text-base text-zinc-900 tracking-tight leading-tight">
              {settings.businessName}
            </span>
            <span className="hidden sm:block text-[11px] text-zinc-500 font-normal">
              {settings.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === '/produits' && location.pathname.startsWith('/produits')) ||
              (link.path === '/categories' && location.pathname.startsWith('/categories'));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-800 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 font-medium'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions (WhatsApp & Cart) */}
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${cleanWhatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Discuter</span>
          </a>

          <Link
            to="/panier"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-2xs active:scale-95"
            aria-label="Voir mon panier"
          >
            <ShoppingCart className="w-4 h-4 text-zinc-200" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
