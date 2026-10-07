import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Product, Category } from '../../types';
import {
  fetchProducts,
  deleteProduct,
  toggleProductActive,
} from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { formatFCFA, getStockStatus } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [toDeleteProduct, setToDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleToggleActive = async (p: Product) => {
    const nextStatus = !p.isActive;
    try {
      await toggleProductActive(p.id, nextStatus);
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, isActive: nextStatus } : item))
      );
      addToast(
        `"${p.name}" est maintenant ${nextStatus ? 'visible sur le catalogue' : 'masqué'}.`
      );
    } catch (err) {
      addToast('Erreur lors du changement de visibilité.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!toDeleteProduct) return;
    setDeleting(true);
    try {
      await deleteProduct(toDeleteProduct.id);
      setProducts((prev) => prev.filter((item) => item.id !== toDeleteProduct.id));
      addToast(`"${toDeleteProduct.name}" a été définitivement supprimé.`);
      setToDeleteProduct(null);
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const categoryMap = new Map<string, string>();
  for (const c of categories) categoryMap.set(c.id, c.name);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const clean = search.toLowerCase().trim();
      const matchesSearch = clean
        ? p.name.toLowerCase().includes(clean) || p.description.toLowerCase().includes(clean)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <div className="space-y-6 pb-16">
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Gestion des Produits ({products.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Ajoutez, modifiez ou masquez vos parfums, huiles et senteurs.
          </p>
        </div>

        <Link to="/admin/produits/nouveau">
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Nouveau produit
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 shadow-2xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-56 px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 shadow-2xs"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Prix détail</th>
                <th className="py-3 px-4">Tarif de gros</th>
                <th className="py-3 px-4">Visibilité</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-4">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stockInfo = getStockStatus(p.stock, p.lowStockThreshold);
                  const lowestTier =
                    p.wholesaleEnabled && p.wholesaleTiers?.length > 0
                      ? [...p.wholesaleTiers].sort((a, b) => a.pricePerUnit - b.pricePerUnit)[0]
                      : null;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                            {p.thumbUrl || p.imageUrl ? (
                              <img
                                src={p.thumbUrl || p.imageUrl || ''}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                                Senteur
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-zinc-900 line-clamp-1 max-w-xs">
                            {p.name}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-zinc-600">
                        {categoryMap.get(p.categoryId) || '—'}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stockInfo.badgeClass}`}
                        >
                          {p.stock} pcs
                        </span>
                      </td>

                      {/* Detail Price */}
                      <td className="py-3 px-4 font-bold text-zinc-900 tabular-nums">
                        {formatFCFA(p.detailPrice)}
                      </td>

                      {/* Wholesale Tiers */}
                      <td className="py-3 px-4">
                        {lowestTier ? (
                          <span className="text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md font-bold text-xs tabular-nums">
                            Dès {formatFCFA(lowestTier.pricePerUnit, true)} ({lowestTier.minQuantity} pcs)
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">Non activé</span>
                        )}
                      </td>

                      {/* Visibility Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200'
                          }`}
                        >
                          {p.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Actif</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Masqué</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/produits/${p.id}`}
                            className="p-2 rounded-xl text-zinc-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setToDeleteProduct(p)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(toDeleteProduct)}
        onClose={() => setToDeleteProduct(null)}
        title="Confirmer la suppression"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setToDeleteProduct(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={deleting}
              onClick={handleDeleteConfirm}
            >
              Supprimer définitivement
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-neutral-700">
            Êtes-vous sûr de vouloir supprimer définitivement l'article{' '}
            <strong>"{toDeleteProduct?.name}"</strong> ?
          </p>
          <p className="text-xs text-neutral-500">
            Cette action supprimera également les photos associées. Les commandes passées
            contenant cet article ne seront pas affectées grâce aux instantanés (snapshots).
          </p>
        </div>
      </Modal>
    </div>
  );
};
