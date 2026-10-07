import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { Category, Product } from '../../types';
import { fetchCategories } from '../../services/categoryService';
import { fetchProducts } from '../../services/productService';
import { Skeleton } from '../../components/ui/Skeleton';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts(true),
        ]);
        setCategories(cats.filter((c) => c.isActive));
        setProducts(prods);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getProductCount = (catId: string) => {
    return products.filter((p) => p.categoryId === catId).length;
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Catégories de Senteurs &amp; Produits
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Explorez nos collections spécialisées vendues en gros et détail.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const count = getProductCount(cat.id);
            return (
              <Link
                key={cat.id}
                to={`/produits?cat=${cat.id}`}
                className="group p-6 rounded-2xl border border-zinc-200 bg-white hover:border-violet-300 hover:shadow-md transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 group-hover:bg-violet-700 text-violet-700 group-hover:text-white transition-colors flex items-center justify-center font-extrabold text-lg shadow-2xs">
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 group-hover:text-violet-900 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {count} article{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-violet-50 group-hover:text-violet-800 text-zinc-400 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
