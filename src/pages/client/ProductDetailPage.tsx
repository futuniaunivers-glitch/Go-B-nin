import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Check,
  MessageCircle,
  Truck,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { fetchProductById } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { formatFCFA, getStockStatus } from '../../lib/format';
import { getApplicablePrice } from '../../lib/pricing';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { TierTable } from '../../components/client/TierTable';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const prod = await fetchProductById(id);
        setProduct(prod);

        if (prod) {
          const cats = await fetchCategories();
          const cat = cats.find((c) => c.id === prod.categoryId);
          if (cat) setCategory(cat);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || (!product.isActive && product.stock <= 0)) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Produit introuvable</h2>
        <p className="text-xs text-zinc-500">
          Ce produit n'existe pas ou n'est plus proposé dans notre catalogue.
        </p>
        <Link to="/produits">
          <Button variant="primary" size="md">
            Retourner au catalogue
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const stockInfo = getStockStatus(product.stock, product.lowStockThreshold);
  const pricing = getApplicablePrice(product, quantity);

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/\D/g, '');

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product.id, quantity);
    if (res.success) {
      setJustAdded(true);
      const toastId = Date.now().toString();
      setToasts([
        {
          id: toastId,
          type: 'success',
          message: `${quantity} × "${product.name}" ajouté(s) au panier !`,
        },
      ]);
      setTimeout(() => setJustAdded(false), 2000);
      setTimeout(() => setToasts([]), 3000);
    }
  };

  const productWhatsAppText = encodeURIComponent(
    `Bonjour ${settings.businessName}, j'ai une question concernant l'article "${product.name}" (Prix: ${formatFCFA(product.detailPrice)}). Est-il disponible ?`
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <ToastContainer
        toasts={toasts}
        onDismiss={(tId) => setToasts((prev) => prev.filter((t) => t.id !== tId))}
      />

      {/* Back link */}
      <div>
        <Link
          to="/produits"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-violet-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image Container */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-zinc-200/80 shadow-2xs flex items-center justify-center">
            {product.imageUrl || product.thumbUrl ? (
              <img
                src={product.imageUrl || product.thumbUrl || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                <ShoppingBag className="w-16 h-16 stroke-1 text-zinc-300 mb-2" />
                <span className="text-xs">Photo non disponible</span>
              </div>
            )}

            {/* Stock badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-md border shadow-2xs ${stockInfo.badgeClass}`}
              >
                {stockInfo.badgeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Info & Controls */}
        <div className="space-y-6">
          <div>
            {category && (
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md border border-violet-100">
                {category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-2.5 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-medium block">
                  Prix au détail (1 à 2 pièces)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 tabular-nums">
                  {formatFCFA(product.detailPrice)}
                </span>
              </div>

              {pricing.mode === 'wholesale' && (
                <div className="text-right">
                  <span className="text-[11px] font-bold text-violet-800 bg-violet-100 px-2.5 py-0.5 rounded-full inline-block mb-0.5">
                    Tarif gros appliqué
                  </span>
                  <div className="text-xl font-black text-violet-900 tabular-nums">
                    {formatFCFA(pricing.unitPrice)} / pce
                  </div>
                </div>
              )}
            </div>

            {pricing.savings > 0 && (
              <div className="pt-2 border-t border-zinc-200 text-xs font-bold text-emerald-700 flex items-center justify-between">
                <span>Économies pour {quantity} pièce(s) :</span>
                <span className="tabular-nums">-{formatFCFA(pricing.savings)}</span>
              </div>
            )}
          </div>

          {/* Wholesale Tiers Table */}
          {product.wholesaleEnabled && product.wholesaleTiers?.length > 0 && (
            <TierTable
              detailPrice={product.detailPrice}
              tiers={product.wholesaleTiers}
              currentQuantity={quantity}
            />
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Choisir la quantité à commander
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <QuantityStepper
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={setQuantity}
                  size="lg"
                  disabled={isOutOfStock}
                />

                <div className="sm:hidden text-right">
                  <span className="text-xs text-zinc-500 block">Total estimé</span>
                  <span className="text-lg font-black text-zinc-900 tabular-nums">
                    {formatFCFA(pricing.subtotal)}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                {isOutOfStock ? (
                  <Button
                    variant="outline"
                    size="lg"
                    disabled
                    className="w-full text-zinc-400 bg-zinc-100"
                  >
                    Actuellement en rupture de stock
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-base font-semibold shadow-md shadow-violet-700/20"
                    onClick={handleAddToCart}
                    icon={
                      justAdded ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      )
                    }
                  >
                    {justAdded ? 'Ajouté au panier !' : `Ajouter (${formatFCFA(pricing.subtotal)})`}
                  </Button>
                )}
              </div>
            </div>

            {product.stock > 0 && product.stock <= product.lowStockThreshold && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Attention, il ne reste que {product.stock} pièce(s) disponible(s) !</span>
              </p>
            )}
          </div>

          {/* Quick WhatsApp Question */}
          <div className="pt-2">
            <a
              href={`https://wa.me/${cleanWhatsAppNumber}?text=${productWhatsAppText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors text-xs font-semibold"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-transparent" />
              <span>Poser une question sur cet article sur WhatsApp</span>
            </a>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-zinc-200 space-y-2">
              <h3 className="font-bold text-sm text-zinc-900">Description du produit</h3>
              <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery & Payment Badges */}
          <div className="pt-4 border-t border-zinc-200 grid grid-cols-2 gap-3 text-xs text-zinc-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <Truck className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900 block">Livraison Bénin</span>
                <span className="text-zinc-500">Cotonou, Calavi &amp; expédition bus en région.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900 block">Mobile Money</span>
                <span className="text-zinc-500">MTN / Moov Money après validation.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
