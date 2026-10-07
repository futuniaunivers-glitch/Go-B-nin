import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../components/client/CartItem';
import { CartSummary } from '../../components/client/CartSummary';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    resolvedItems,
    totalQuantity,
    totalAmount,
    totalSavings,
    updateQuantity,
    removeFromCart,
    validateCart,
    loading,
  } = useCart();

  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Validate cart against fresh inventory on mount
  useEffect(() => {
    const runValidation = async () => {
      setIsValidating(true);
      try {
        const res = await validateCart();
        if (!res.isValid && res.messages.length > 0) {
          setValidationMessages(res.messages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsValidating(false);
      }
    };
    runValidation();
  }, []);

  const handleProceed = async () => {
    setIsValidating(true);
    try {
      const res = await validateCart();
      if (!res.isValid) {
        setValidationMessages(res.messages);
        return;
      }
      navigate('/commande');
    } finally {
      setIsValidating(false);
    }
  };

  if (!loading && resolvedItems.length === 0) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-violet-700" />}
          title="Votre panier est vide"
          description="Vous n'avez pas encore ajouté de parfums ou de senteurs à votre panier."
          action={
            <Link to="/produits">
              <Button
                variant="primary"
                size="lg"
                icon={<ShoppingBag className="w-5 h-5" />}
              >
                Découvrir le catalogue
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div className="border-b border-zinc-200 pb-4 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Mon Panier ({totalQuantity} article{totalQuantity > 1 ? 's' : ''})
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Vérifiez vos quantités pour profiter des meilleurs tarifs de gros.
          </p>
        </div>

        <Link
          to="/produits"
          className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 transition-colors"
        >
          <span>Ajouter d'autres articles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Inventory update warnings */}
      {validationMessages.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Mise à jour du stock effectuée dans votre panier :</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 font-medium">
            {validationMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {resolvedItems.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {/* Summary Sticky */}
        <div className="lg:sticky lg:top-24">
          <CartSummary
            totalAmount={totalAmount}
            totalQuantity={totalQuantity}
            totalSavings={totalSavings}
            onProceedToCheckout={handleProceed}
            checkoutDisabled={isValidating || resolvedItems.length === 0}
          />
        </div>
      </div>
    </div>
  );
};
