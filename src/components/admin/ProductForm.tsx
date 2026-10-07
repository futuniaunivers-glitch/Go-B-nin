import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category, WholesaleTier } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TierEditor } from './TierEditor';
import { ImageUploader } from './ImageUploader';
import { ProcessedImages } from '../../lib/images';
import { validateWholesaleTiers } from '../../lib/pricing';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product | null;
  categories: Category[];
  onSave: (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    processedImages: ProcessedImages | null
  ) => Promise<void>;
  loading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  categories,
  onSave,
  loading = false,
}) => {
  const navigate = useNavigate();

  const [name, setName] = useState(initialProduct?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialProduct?.categoryId || categories[0]?.id || ''
  );
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [detailPrice, setDetailPrice] = useState<number>(initialProduct?.detailPrice || 3000);
  const [wholesaleEnabled, setWholesaleEnabled] = useState(
    initialProduct?.wholesaleEnabled ?? true
  );
  const [wholesaleTiers, setWholesaleTiers] = useState<WholesaleTier[]>(
    initialProduct?.wholesaleTiers || [
      { minQuantity: 3, pricePerUnit: 2700 },
      { minQuantity: 6, pricePerUnit: 2500 },
      { minQuantity: 12, pricePerUnit: 2300 },
    ]
  );
  const [stock, setStock] = useState<number>(initialProduct?.stock ?? 25);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    initialProduct?.lowStockThreshold ?? 10
  );
  const [isActive, setIsActive] = useState<boolean>(initialProduct?.isActive ?? true);
  const [processedImages, setProcessedImages] = useState<ProcessedImages | null>(null);
  const [imageCleared, setImageCleared] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Mark form as dirty when any field changes
  useEffect(() => {
    setIsDirty(true);
  }, [
    name,
    categoryId,
    description,
    detailPrice,
    wholesaleEnabled,
    wholesaleTiers,
    stock,
    lowStockThreshold,
    isActive,
    processedImages,
  ]);

  // Window beforeunload prompt when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Le nom du produit est obligatoire.');
      return;
    }

    if (!categoryId) {
      setFormError('Veuillez sélectionner une catégorie.');
      return;
    }

    if (detailPrice <= 0) {
      setFormError('Le prix détail doit être supérieur à 0 FCFA.');
      return;
    }

    if (wholesaleEnabled) {
      const tierValidation = validateWholesaleTiers(wholesaleEnabled, detailPrice, wholesaleTiers);
      if (!tierValidation.valid) {
        setFormError(tierValidation.errors.join(' '));
        return;
      }
    }

    try {
      await onSave(
        {
          id: initialProduct?.id,
          name: name.trim(),
          categoryId,
          description: description.trim(),
          imageUrl: imageCleared ? null : initialProduct?.imageUrl || null,
          thumbUrl: imageCleared ? null : initialProduct?.thumbUrl || null,
          imagePath: imageCleared ? null : initialProduct?.imagePath || null,
          thumbPath: imageCleared ? null : initialProduct?.thumbPath || null,
          detailPrice: Math.round(detailPrice),
          wholesaleEnabled,
          wholesaleTiers: wholesaleEnabled ? wholesaleTiers : [],
          stock: Math.max(0, Math.round(stock)),
          lowStockThreshold: Math.max(0, Math.round(lowStockThreshold)),
          isActive,
        },
        processedImages
      );
      setIsDirty(false);
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de l’enregistrement du produit.');
    }
  };

  const handleBack = () => {
    if (isDirty && !window.confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?')) {
      return;
    }
    navigate('/admin/produits');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste</span>
        </button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          icon={<Save className="w-4 h-4" />}
        >
          ENREGISTRER
        </Button>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{formError}</p>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-5">
        <h3 className="font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3">
          Informations générales
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom du produit"
            placeholder="Ex : Eau de Parfum Lattafa Yara 100ml"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <Select
            label="Catégorie"
            value={categoryId}
            required
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

        <Textarea
          label="Description du produit"
          placeholder="Ex : Notes olfactives, contenance, conseils d'utilisation..."
          value={description}
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Image Uploader */}
        <ImageUploader
          currentImageUrl={imageCleared ? null : initialProduct?.imageUrl}
          onImageProcessed={(imgs) => {
            setProcessedImages(imgs);
            if (imgs) setImageCleared(false);
          }}
          onRemoveCurrentImage={() => {
            setImageCleared(true);
            setProcessedImages(null);
          }}
        />
      </div>

      {/* Pricing card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-5">
        <h3 className="font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3">
          Tarification (Détail & Gros)
        </h3>

        <div className="max-w-xs">
          <Input
            label="Prix au détail (FCFA)"
            type="number"
            min={100}
            step={50}
            value={detailPrice}
            required
            onChange={(e) => setDetailPrice(parseInt(e.target.value, 10) || 0)}
            helper="Prix unitaire appliqué pour les petites quantités."
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={wholesaleEnabled}
              onChange={(e) => setWholesaleEnabled(e.target.checked)}
              className="w-4 h-4 rounded-md border-zinc-300 text-violet-700 focus:ring-violet-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-zinc-900">
              Activer les prix de gros et demi-gros pour cet article
            </span>
          </label>
        </div>

        {wholesaleEnabled && (
          <TierEditor
            wholesaleEnabled={wholesaleEnabled}
            detailPrice={detailPrice}
            tiers={wholesaleTiers}
            onChange={setWholesaleTiers}
          />
        )}
      </div>

      {/* Stock & Visibility card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-5">
        <h3 className="font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3">
          Stock et visibilité
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantité en stock"
            type="number"
            min={0}
            value={stock}
            required
            onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
            helper="Quantité réelle en magasin."
          />

          <Input
            label="Seuil d'alerte stock faible"
            type="number"
            min={0}
            value={lowStockThreshold}
            required
            onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 0)}
            helper="Défaut : 10 pièces."
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded-md border-zinc-300 text-violet-700 focus:ring-violet-500 cursor-pointer"
            />
            <div>
              <span className="text-sm font-bold text-zinc-900 block">
                Produit actif (visible sur le catalogue)
              </span>
              <span className="text-xs text-zinc-500">
                Si décoché, le produit sera masqué du catalogue public.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="lg" onClick={handleBack}>
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<Save className="w-5 h-5" />}
        >
          ENREGISTRER
        </Button>
      </div>
    </form>
  );
};
