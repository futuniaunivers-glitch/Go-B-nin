import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../../types';
import { fetchProducts } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { ProductGrid } from '../../components/client/ProductGrid';
import { SearchBar } from '../../components/client/SearchBar';
import { CategoryChips } from '../../components/client/CategoryChips';
import { Skeleton } from '../../components/ui/Skeleton';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const categoryQuery = searchParams.get('cat') || null;
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, cats] = await Promise.all([
          fetchProducts(true), // only active
          fetchCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCategorySelect = (catId: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catId) {
      nextParams.set('cat', catId);
    } else {
      nextParams.delete('cat');
    }
    setSearchParams(nextParams);
  };

  const handleSearchChange = (query: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (query) {
      nextParams.set('q', query);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = categoryQuery ? p.categoryId === categoryQuery : true;
      const cleanSearch = searchQuery.toLowerCase().trim();
      const matchesSearch = cleanSearch
        ? p.name.toLowerCase().includes(cleanSearch) ||
          p.description.toLowerCase().includes(cleanSearch)
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [products, categoryQuery, searchQuery]);

  const addToast = (msg: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type: 'success', message: msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Header */}
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Catalogue des Senteurs &amp; Parfums
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Tous nos articles disponibles en direct pour particuliers, revendeurs et commerces.
        </p>
      </div>

      {/* Search & Category filter */}
      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Rechercher par nom (Yara, Khamrah, Asad, Huiles, Diffuseurs...)"
        />

        <CategoryChips
          categories={categories}
          selectedCategoryId={categoryQuery}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Results meta */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
        <span>
          <strong className="text-zinc-900">{filteredProducts.length}</strong> article(s) trouvé(s)
          {categoryQuery && (
            <span> dans {categories.find((c) => c.id === categoryQuery)?.name}</span>
          )}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid
          products={filteredProducts}
          categories={categories}
          onAddedToCart={(name) => addToast(`"${name}" ajouté au panier !`)}
        />
      )}
    </div>
  );
};
