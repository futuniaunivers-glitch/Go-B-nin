import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Layers, AlertCircle } from 'lucide-react';
import { Category, Product } from '../../types';
import {
  fetchCategories,
  saveCategory,
  deleteCategory,
} from '../../services/categoryService';
import { fetchProducts } from '../../services/productService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [orderInput, setOrderInput] = useState<number>(1);
  const [isActiveInput, setIsActiveInput] = useState(true);

  // Delete modal
  const [toDeleteCategory, setToDeleteCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts(false),
      ]);
      setCategories(cats);
      setProducts(prods);
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

  const getProductCount = (catId: string) => {
    return products.filter((p) => p.categoryId === catId).length;
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setNameInput('');
    setOrderInput(categories.length + 1);
    setIsActiveInput(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setNameInput(c.name);
    setOrderInput(c.order);
    setIsActiveInput(c.isActive);
    setModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSaving(true);
    try {
      const id = editingCategory?.id || `cat_${Date.now()}`;
      const toSave: Category = {
        id,
        name: nameInput.trim(),
        order: Number(orderInput) || 1,
        isActive: isActiveInput,
      };

      await saveCategory(toSave);
      await loadData();
      setModalOpen(false);
      addToast(
        editingCategory ? 'Catégorie renommée avec succès !' : 'Nouvelle catégorie créée !'
      );
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const updated = { ...cat, isActive: !cat.isActive };
      await saveCategory(updated);
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      addToast(`Catégorie ${updated.isActive ? 'activée' : 'masquée'}.`);
    } catch (err) {
      addToast('Erreur lors du changement d’état.', 'error');
    }
  };

  const handleDeleteClick = (cat: Category) => {
    const count = getProductCount(cat.id);
    if (count > 0) {
      setDeleteError(
        `Impossible de supprimer "${cat.name}" car elle contient actuellement ${count} produit(s). Vous devez déplacer ses produits ou désactiver la catégorie.`
      );
    } else {
      setDeleteError(null);
    }
    setToDeleteCategory(cat);
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteCategory) return;
    const count = getProductCount(toDeleteCategory.id);
    if (count > 0) return;

    setSaving(true);
    try {
      await deleteCategory(toDeleteCategory.id, false);
      setCategories((prev) => prev.filter((c) => c.id !== toDeleteCategory.id));
      addToast(`"${toDeleteCategory.name}" a été supprimée.`);
      setToDeleteCategory(null);
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la suppression.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Catégories ({categories.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Organisez les rayons de votre boutique et l'ordre d'affichage.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Nouvelle catégorie
        </Button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              Aucune catégorie pour l'instant.
            </div>
          ) : (
            categories.map((c) => {
              const productCount = getProductCount(c.id);

              return (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center">
                      {c.order}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-zinc-900">
                        {c.name}
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {productCount} produit{productCount > 1 ? 's' : ''} associé{productCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        c.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                      }`}
                    >
                      {c.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Masquée</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 rounded-xl text-zinc-600 hover:text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer"
                      title="Renommer / Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(c)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              loading={saving}
              onClick={handleSaveModal}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveModal} className="space-y-4">
          <Input
            label="Nom de la catégorie"
            placeholder="Ex : Parfums Dubaï, Déodorants..."
            value={nameInput}
            required
            onChange={(e) => setNameInput(e.target.value)}
          />

          <Input
            label="Ordre d'affichage (numéro)"
            type="number"
            min={1}
            value={orderInput}
            required
            onChange={(e) => setOrderInput(parseInt(e.target.value, 10) || 1)}
            helper="Définit la position dans les filtres et menus."
          />

          <label className="flex items-center gap-3 cursor-pointer pt-2 select-none">
            <input
              type="checkbox"
              checked={isActiveInput}
              onChange={(e) => setIsActiveInput(e.target.checked)}
              className="w-4 h-4 rounded-md border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-zinc-800">
              Catégorie active (visible dans les filtres publics)
            </span>
          </label>
        </form>
      </Modal>

      {/* Delete / Protected Modal */}
      <Modal
        isOpen={Boolean(toDeleteCategory)}
        onClose={() => setToDeleteCategory(null)}
        title="Supprimer la catégorie"
        footer={
          deleteError ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setToDeleteCategory(null)}
            >
              J'ai compris
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => setToDeleteCategory(null)}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={saving}
                onClick={handleConfirmDelete}
              >
                Supprimer
              </Button>
            </>
          )
        }
      >
        {deleteError ? (
          <div className="space-y-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Suppression bloquée</span>
            </div>
            <p>{deleteError}</p>
          </div>
        ) : (
          <p className="text-sm text-neutral-700">
            Voulez-vous vraiment supprimer la catégorie{' '}
            <strong>"{toDeleteCategory?.name}"</strong> ? Cette action est irréversible.
          </p>
        )}
      </Modal>
    </div>
  );
};
