import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../../types';
import { fetchProducts } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { StockRow } from '../../components/admin/StockRow';
import { Search, AlertTriangle, XCircle, CheckCircle2, Archive } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminStockPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts(false),
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

  useEffect(() => {
    loadData();
  }, []);

  const handleStockUpdated = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const setFilter = (f: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('filter', f);
    setSearchParams(next);
  };

  const categoryMap = new Map<string, string>();
  for (const c of categories) categoryMap.set(c.id, c.name);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock filter
      if (filterParam === 'low' && !(p.stock > 0 && p.stock <= p.lowStockThreshold)) return false;
      if (filterParam === 'out' && p.stock !== 0) return false;

      // Search
      const clean = search.toLowerCase().trim();
      if (clean && !p.name.toLowerCase().includes(clean)) return false;

      return true;
    });
  }, [products, filterParam, search]);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Gestion Rapide du Stock
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Ajustez les quantités disponibles en temps réel à l'aide des boutons − / + ou de la saisie.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterParam === 'all'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Tous ({products.length})
          </button>

          <button
            onClick={() => setFilter('low')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterParam === 'low'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stock faible ({lowStockCount})</span>
          </button>

          <button
            onClick={() => setFilter('out')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterParam === 'out'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-800 hover:bg-rose-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Ruptures ({outOfStockCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Filtrer par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 shadow-2xs"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Produit &amp; Détails</th>
                <th className="py-3 px-4">Statut Stock</th>
                <th className="py-3 px-4 text-right">Modifier le Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={3} className="py-4 px-4">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-zinc-500">
                    Aucun produit correspondant.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <StockRow
                    key={p.id}
                    product={p}
                    categoryName={categoryMap.get(p.categoryId)}
                    onStockUpdated={handleStockUpdated}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
