import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartStoredItem, CartResolvedItem, Product } from '../types';
import { getApplicablePrice } from '../lib/pricing';
import { fetchProducts } from '../services/productService';

const CART_STORAGE_KEY = 'gds229_cart';

interface CartContextType {
  items: CartStoredItem[];
  resolvedItems: CartResolvedItem[];
  totalQuantity: number;
  totalAmount: number;
  totalSavings: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  validateCart: () => Promise<{ isValid: boolean; messages: string[] }>;
  allProducts: Product[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function readStoredCart(): CartStoredItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function writeStoredCart(items: CartStoredItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartStoredItem[]>(readStoredCart);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products to compute dynamic pricing
  const refreshProducts = async () => {
    try {
      const prods = await fetchProducts(false);
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    writeStoredCart(items);
  }, [items]);

  // Compute resolved items dynamically using getApplicablePrice
  const resolvedItems = useMemo<CartResolvedItem[]>(() => {
    const result: CartResolvedItem[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const pricing = getApplicablePrice(product, item.quantity);

      result.push({
        product,
        quantity: item.quantity,
        unitPrice: pricing.unitPrice,
        subtotal: pricing.subtotal,
        mode: pricing.mode,
        appliedTier: pricing.appliedTier,
        nextTier: pricing.nextTier,
        savings: pricing.savings,
      });
    }

    return result;
  }, [items, products]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => resolvedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [resolvedItems]
  );

  const totalSavings = useMemo(
    () => resolvedItems.reduce((sum, item) => sum + item.savings, 0),
    [resolvedItems]
  );

  const addToCart = (productId: string, quantity = 1): { success: boolean; message?: string } => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.isActive) {
      return { success: false, message: 'Ce produit n’est plus disponible.' };
    }

    if (product.stock <= 0) {
      return { success: false, message: 'Ce produit est actuellement en rupture de stock.' };
    }

    const existingIdx = items.findIndex((i) => i.productId === productId);
    let newItems = [...items];

    if (existingIdx >= 0) {
      const currentQty = newItems[existingIdx].quantity;
      const targetQty = currentQty + quantity;

      if (targetQty > product.stock) {
        newItems[existingIdx] = { productId, quantity: product.stock };
        setItems(newItems);
        return {
          success: true,
          message: `Quantité ajustée au stock disponible (${product.stock} pièces).`,
        };
      }

      newItems[existingIdx] = { productId, quantity: targetQty };
    } else {
      const initialQty = Math.min(quantity, product.stock);
      newItems.push({ productId, quantity: initialQty });
    }

    setItems(newItems);
    return { success: true };
  };

  const updateQuantity = (
    productId: string,
    quantity: number
  ): { success: boolean; message?: string } => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false };

    const safeQty = Math.max(1, Math.round(quantity));
    let finalQty = safeQty;
    let message: string | undefined = undefined;

    if (safeQty > product.stock) {
      finalQty = Math.max(1, product.stock);
      message = `Stock disponible : ${product.stock} pièce(s)`;
    }

    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: finalQty } : item))
    );

    return { success: true, message };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  /**
   * Revalidates cart items against live database products.
   * Required before checkout and on cart loading.
   */
  const validateCart = async (): Promise<{ isValid: boolean; messages: string[] }> => {
    const freshProducts = await fetchProducts(false);
    setProducts(freshProducts);

    const messages: string[] = [];
    const validItems: CartStoredItem[] = [];
    let hasChanges = false;

    for (const item of items) {
      const prod = freshProducts.find((p) => p.id === item.productId);

      if (!prod || !prod.isActive) {
        messages.push(`"${prod?.name || 'Un article'}" n'est plus disponible et a été retiré.`);
        hasChanges = true;
        continue;
      }

      if (prod.stock <= 0) {
        messages.push(`"${prod.name}" est en rupture de stock et a été retiré.`);
        hasChanges = true;
        continue;
      }

      if (item.quantity > prod.stock) {
        messages.push(
          `La quantité de "${prod.name}" a été ramenée à ${prod.stock} (stock disponible).`
        );
        validItems.push({ productId: item.productId, quantity: prod.stock });
        hasChanges = true;
      } else {
        validItems.push(item);
      }
    }

    if (hasChanges) {
      setItems(validItems);
      return { isValid: false, messages };
    }

    return { isValid: true, messages: [] };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        resolvedItems,
        totalQuantity,
        totalAmount,
        totalSavings,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        validateCart,
        allProducts: products,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
