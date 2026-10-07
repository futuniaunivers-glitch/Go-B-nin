import React from 'react';
import { Product, Category } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';
import { Sparkles } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onAddedToCart?: (productName: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  onAddedToCart,
  emptyTitle = 'Aucun produit trouvé',
  emptyDescription = 'Essayez de modifier votre recherche ou vos filtres de catégorie.',
}) => {
  // Sort products: In-stock items first, out-of-stock items (stock == 0) placed at the end
  const sortedProducts = [...products].sort((a, b) => {
    const aOut = a.stock <= 0 ? 1 : 0;
    const bOut = b.stock <= 0 ? 1 : 0;
    return aOut - bOut;
  });

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat.id, cat.name);
  }

  if (sortedProducts.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="w-8 h-8" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap.get(product.categoryId)}
          onAddedToCart={onAddedToCart}
        />
      ))}
    </div>
  );
};
