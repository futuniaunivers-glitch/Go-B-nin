import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';
import { saveProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { ProductForm } from '../../components/admin/ProductForm';
import { ProcessedImages } from '../../lib/images';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    processedImages: ProcessedImages | null
  ) => {
    setSaving(true);
    try {
      await saveProduct(productData, processedImages);
      setToasts([
        {
          id: Date.now().toString(),
          type: 'success',
          message: 'Produit créé avec succès !',
        },
      ]);
      setTimeout(() => {
        navigate('/admin/produits');
      }, 1000);
    } catch (err: any) {
      setToasts([
        {
          id: Date.now().toString(),
          type: 'error',
          message: err.message || 'Erreur lors de la création.',
        },
      ]);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Nouveau Produit
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Renseignez la fiche produit, les photos et les paliers de prix de gros.
        </p>
      </div>

      <ProductForm
        categories={categories}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
};
