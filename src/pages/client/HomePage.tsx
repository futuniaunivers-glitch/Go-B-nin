import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { fetchProducts } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { useSettings } from '../../context/SettingsContext';
import { ProductCard } from '../../components/client/ProductCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import heroImage from '../../assets/images/hero_perfume_wholesale_1791222646334.jpg';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, cats] = await Promise.all([
          fetchProducts(true),
          fetchCategories(),
        ]);
        setProducts(prods);
        setCategories(cats.filter((c) => c.isActive));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/\D/g, '');
  const featuredProducts = products.slice(0, 8);

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    categoryMap.set(c.id, c.name);
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-xl border border-zinc-800/80">
        {/* Background image with refined luxury gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Collection Parfums et Senteurs 229"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/25 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 sm:py-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/80 border border-violet-700/50 text-violet-200 text-xs sm:text-sm font-semibold backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Grossiste N°1 en Parfumerie &amp; Senteurs à Cotonou 🇧🇯</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-balance">
            Sublimez votre quotidien &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-300">
              boostez votre commerce
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Parfums Dubaï, huiles concentrées sans alcool, déodorants de marque et diffuseurs d'ambiance.
            Achetez au <strong>détail</strong> ou profitez de nos <strong>prix de gros dégressifs dès 3 pièces</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to="/produits" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-violet-900/30 font-semibold"
                icon={<ShoppingBag className="w-5 h-5" />}
              >
                Explorer le catalogue
              </Button>
            </Link>

            <a
              href={`https://wa.me/${cleanWhatsAppNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="whatsapp"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5"
                icon={<MessageCircle className="w-5 h-5" />}
              >
                Commander sur WhatsApp
              </Button>
            </a>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-6 border-t border-zinc-800/80 max-w-xl mx-auto text-center text-xs sm:text-sm">
            <div>
              <div className="font-black text-violet-400 text-base sm:text-xl tabular-nums">Dès 3 pcs</div>
              <div className="text-zinc-400 text-[11px] sm:text-xs">Prix de gros dégressifs</div>
            </div>
            <div>
              <div className="font-black text-violet-400 text-base sm:text-xl">100% Authentique</div>
              <div className="text-zinc-400 text-[11px] sm:text-xs">Senteurs longue tenue</div>
            </div>
            <div>
              <div className="font-black text-violet-400 text-base sm:text-xl">Bénin Express</div>
              <div className="text-zinc-400 text-[11px] sm:text-xs">Cotonou &amp; Régions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Nos Catégories de Senteurs
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Parcourez nos collections pour particuliers et revendeurs
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 transition-colors"
          >
            <span>Tout voir</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/produits?cat=${cat.id}`}
              className="group p-4 rounded-2xl border border-zinc-200 bg-white hover:border-violet-300 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-700 group-hover:bg-violet-700 group-hover:text-white transition-colors flex items-center justify-center font-bold text-sm shadow-2xs">
                {cat.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-violet-900 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                Disponibles en boutique
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mt-1">
              Articles Populaires &amp; Prix de Gros
            </h2>
          </div>
          <Link
            to="/produits"
            className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 transition-colors"
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                categoryName={categoryMap.get(p.categoryId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Wholesale Rules & Benefits explanation box */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-2xs space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-widest text-violet-800 uppercase bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
            Comment fonctionne le tarif grossiste ?
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-900">
            Un système simple, clair et transparent
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Pas besoin de carte professionnelle ni de formalités compliquées. Ajoutez simplement les
            quantités souhaitées dans votre panier !
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-violet-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
              1
            </div>
            <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
              Minimum 3 pièces par article
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              À défaut de prendre la douzaine complète d'un parfum ou déodorant, le prix de gros
              s'enclenche dès 3 pièces du même article (6 pièces pour les huiles en mini-format).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-violet-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
              2
            </div>
            <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
              Calcul automatique au panier
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Le bon tarif s'applique instantanément dans votre récapitulatif. Vous visualisez vos
              économies réalisées en temps réel avant d'envoyer votre commande.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-violet-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
              3
            </div>
            <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
              Envoi WhatsApp &amp; Mobile Money
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Un clic génère votre bon de commande formaté pour WhatsApp. Règlement par MTN MoMo ou
              Moov Money, puis expédition immédiate de votre colis.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/conditions">
            <Button variant="outline" size="md">
              Lire toutes les conditions de vente
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
