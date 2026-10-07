import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';
import { fetchProductById, saveProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { ProductForm } from '../../components/admin/ProductForm';
import { ProcessedImages } from '../../lib/images';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [prod, cats] = await Promise.all([
          fetchProductById(id),
          fetchCategories(),
        ]);
        setProduct(prod);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    processedImages: ProcessedImages | null
  ) => {
    setSaving(true);
    try {
      await saveProduct(productData, processedImages, product);
      setToasts([
        {
          id: Date.now().toString(),
          type: 'success',
          message: 'Produit mis à jour avec succès !',
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
          message: err.message || 'Erreur lors de la mise à jour.',
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

  if (!product) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-zinc-900">Produit introuvable</h2>
        <button
          onClick={() => navigate('/admin/produits')}
          className="text-violet-700 font-bold hover:underline"
        >
          Retour à la liste des produits
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <ToastContainer
        toasts={toasts}
        onDismiss={(tId) => setToasts((prev) => prev.filter((t) => t.id !== tId))}
      />

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Modifier : {product.name}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Mettez à jour les informations, les paliers ou remplacez la photo.
        </p>
      </div>

      <ProductForm
        initialProduct={product}
        categories={categories}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
};
