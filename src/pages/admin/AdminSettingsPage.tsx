import React, { useEffect, useState } from 'react';
import { StoreSettings } from '../../types';
import { fetchSettings, saveSettings, validateSettings } from '../../services/settingsService';
import { useSettings } from '../../context/SettingsContext';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';
import {
  Save,
  Plus,
  Trash2,
  Building,
  Share2,
  ShieldCheck,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminSettingsPage: React.FC = () => {
  const { refreshSettings } = useSettings();
  const [formData, setFormData] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetchSettings();
        setFormData(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleFieldChange = (field: keyof StoreSettings, val: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: val });
  };

  const handleAddCondition = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      salesConditions: [...formData.salesConditions, 'Nouvelle condition de vente...'],
    });
  };

  const handleUpdateCondition = (index: number, val: string) => {
    if (!formData) return;
    const updated = [...formData.salesConditions];
    updated[index] = val;
    setFormData({ ...formData, salesConditions: updated });
  };

  const handleRemoveCondition = (index: number) => {
    if (!formData) return;
    const updated = formData.salesConditions.filter((_, i) => i !== index);
    setFormData({ ...formData, salesConditions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setValidationErrors([]);
    const validation = validateSettings(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      await saveSettings(formData);
      await refreshSettings();
      addToast('Paramètres de la boutique enregistrés avec succès !');
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Paramètres Commerciaux
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Configurez les coordonnées, les réseaux sociaux, les conditions et les infos de livraison.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          loading={saving}
          onClick={handleSubmit}
          icon={<Save className="w-4 h-4" />}
        >
          Enregistrer les modifications
        </Button>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-950">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Erreurs de validation :</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Entreprise & Contacts */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-5">
          <h3 className="font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-violet-700" />
            <span>Informations sur l'entreprise</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom commercial"
              value={formData.businessName}
              required
              onChange={(e) => handleFieldChange('businessName', e.target.value)}
            />

            <Input
              label="Accroche / Slogan"
              value={formData.tagline}
              required
              onChange={(e) => handleFieldChange('tagline', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Téléphone d'appel public"
              value={formData.phone}
              required
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              helper="Ex : +229 0162018807"
            />

            <Input
              label="Numéro WhatsApp commercial (chiffres uniquement)"
              value={formData.whatsappNumber}
              required
              onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
              helper="Sans espace ni signe +. Ex : 2290162018807"
            />
          </div>

          <Input
            label="Texte de localisation"
            value={formData.locationText}
            required
            onChange={(e) => handleFieldChange('locationText', e.target.value)}
            helper="Ex : Cotonou, Bénin — Disponible en boutique et livraison partout au Bénin"
          />
        </div>

        {/* 2. Réseaux Sociaux & Liens */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-5">
          <h3 className="font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-violet-700" />
            <span>Réseaux sociaux &amp; Liens (doivent débuter par https://)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lien Chaîne WhatsApp"
              value={formData.whatsappChannelUrl}
              placeholder="https://whatsapp.com/channel/..."
              onChange={(e) => handleFieldChange('whatsappChannelUrl', e.target.value)}
            />

            <Input
              label="Lien TikTok"
              value={formData.tiktokUrl}
              placeholder="https://www.tiktok.com/@..."
              onChange={(e) => handleFieldChange('tiktokUrl', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lien Page Facebook"
              value={formData.facebookUrl}
              placeholder="https://www.facebook.com/..."
              onChange={(e) => handleFieldChange('facebookUrl', e.target.value)}
            />

            <Input
              label="Lien Itinéraire Google Maps"
              value={formData.mapsUrl}
              placeholder="https://maps.app.goo.gl/..."
              onChange={(e) => handleFieldChange('mapsUrl', e.target.value)}
            />
          </div>
        </div>

        {/* 3. Conditions de Vente */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-700" />
              <span>Conditions Générales de Vente (CGV)</span>
            </h3>

            <button
              type="button"
              onClick={handleAddCondition}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une règle</span>
            </button>
          </div>

          <p className="text-xs text-zinc-500">
            Ces points s'affichent sur la page /conditions et dans le bloc d'acceptation obligatoire avant l'envoi de chaque commande WhatsApp.
          </p>

          <div className="space-y-2.5">
            {formData.salesConditions.map((cond, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 w-6">#{idx + 1}</span>
                <input
                  type="text"
                  value={cond}
                  onChange={(e) => handleUpdateCondition(idx, e.target.value)}
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 bg-white text-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(idx)}
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Supprimer cette condition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Livraison & Expéditions */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-violet-700" />
            <span>Informations de Livraison</span>
          </h3>

          <Textarea
            label="Texte explicatif sur les livraisons (Cotonou, Calavi et provinces)"
            rows={4}
            value={formData.deliveryInfo}
            onChange={(e) => handleFieldChange('deliveryInfo', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            icon={<Save className="w-5 h-5" />}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};
