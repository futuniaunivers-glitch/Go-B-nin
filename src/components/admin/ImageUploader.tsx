import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { processProductImage, ProcessedImages } from '../../lib/images';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageProcessed: (images: ProcessedImages | null) => void;
  onRemoveCurrentImage?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageProcessed,
  onRemoveCurrentImage,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || currentImageUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const processed = await processProductImage(file);
      const tempPreview = URL.createObjectURL(processed.thumbBlob);
      setPreviewUrl(tempPreview);
      onImageProcessed(processed);
    } catch (err: any) {
      setError(err.message || "Erreur lors du traitement de l'image.");
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageProcessed(null);
    if (onRemoveCurrentImage) onRemoveCurrentImage();
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-neutral-700">
        Photo du produit (Import galerie ou appareil photo)
      </label>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50">
        {/* Preview Container */}
        <div className="relative w-32 h-32 rounded-xl border border-neutral-200 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Aperçu produit"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400 p-2 text-center">
              <ImageIcon className="w-8 h-8 text-neutral-300 mb-1" />
              <span className="text-[10px]">Aucune image</span>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="product-image-input"
          />

          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{displayUrl ? 'Remplacer la photo' : 'Choisir une photo'}</span>
            </button>

            {displayUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-neutral-500 leading-normal">
            Format WebP/JPEG optimisé automatiquement (&lt; 200 Ko) pour un chargement mobile ultra-rapide au Bénin.
          </p>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
