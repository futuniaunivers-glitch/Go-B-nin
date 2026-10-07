import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Navigation, FileText, CheckCircle2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ConditionsBox } from './ConditionsBox';
import { useSettings } from '../../context/SettingsContext';

const CHECKOUT_STORAGE_KEY = 'gds229_customer_info';

export interface CheckoutFormData {
  customerName: string;
  phone: string;
  city: string;
  area: string;
  deliveryNote: string;
  extraNote: string;
  acceptedConditions: boolean;
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  loading?: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const { settings } = useSettings();

  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    try {
      const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          customerName: parsed.customerName || '',
          phone: parsed.phone || '',
          city: parsed.city || 'Cotonou',
          area: parsed.area || '',
          deliveryNote: parsed.deliveryNote || '',
          extraNote: '', // Do NOT persist extraNote as specified
          acceptedConditions: false,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      customerName: '',
      phone: '',
      city: 'Cotonou',
      area: '',
      deliveryNote: '',
      extraNote: '',
      acceptedConditions: false,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Save to localStorage when user types (excluding extraNote and acceptedConditions)
  useEffect(() => {
    try {
      const toSave = {
        customerName: formData.customerName,
        phone: formData.phone,
        city: formData.city,
        area: formData.area,
        deliveryNote: formData.deliveryNote,
      };
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error(e);
    }
  }, [formData.customerName, formData.phone, formData.city, formData.area, formData.deliveryNote]);

  const validatePhone = (raw: string): boolean => {
    // Accepts numbers, spaces, and optional leading +, between 8 and 15 digits
    const digitsOnly = raw.replace(/\D/g, '');
    return digitsOnly.length >= 8 && digitsOnly.length <= 15;
  };

  const validateField = (name: keyof CheckoutFormData, value: any): string => {
    switch (name) {
      case 'customerName':
        if (!value || !value.trim()) return 'Le nom complet est obligatoire.';
        if (value.trim().length < 2) return 'Veuillez saisir votre nom complet.';
        return '';
      case 'phone':
        if (!value || !value.trim()) return 'Le numéro de téléphone est obligatoire.';
        if (!validatePhone(value)) {
          return 'Le numéro doit comporter entre 8 et 15 chiffres (ex: 01 62 01 88 07 ou +229...).';
        }
        return '';
      case 'city':
        if (!value || !value.trim()) return 'La ville est obligatoire.';
        return '';
      case 'area':
        if (!value || !value.trim()) return 'Le quartier ou la zone est obligatoire.';
        return '';
      case 'deliveryNote':
        if (!value || !value.trim()) return 'L’indication de livraison est obligatoire.';
        if (value.trim().length < 4) {
          return 'Veuillez préciser un repère (ex: près du carrefour, face à la pharmacie...).';
        }
        return '';
      case 'acceptedConditions':
        if (!value) return 'Vous devez accepter les conditions de vente pour continuer.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const isFormValid = (): boolean => {
    const nameErr = validateField('customerName', formData.customerName);
    const phoneErr = validateField('phone', formData.phone);
    const cityErr = validateField('city', formData.city);
    const areaErr = validateField('area', formData.area);
    const deliveryErr = validateField('deliveryNote', formData.deliveryNote);
    const conditionsErr = validateField('acceptedConditions', formData.acceptedConditions);

    return (
      !nameErr &&
      !phoneErr &&
      !cityErr &&
      !areaErr &&
      !deliveryErr &&
      !conditionsErr
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {
      customerName: validateField('customerName', formData.customerName),
      phone: validateField('phone', formData.phone),
      city: validateField('city', formData.city),
      area: validateField('area', formData.area),
      deliveryNote: validateField('deliveryNote', formData.deliveryNote),
      acceptedConditions: validateField('acceptedConditions', formData.acceptedConditions),
    };

    setErrors(newErrors);
    setTouched({
      customerName: true,
      phone: true,
      city: true,
      area: true,
      deliveryNote: true,
      acceptedConditions: true,
    });

    const hasAnyError = Object.values(newErrors).some((err) => err !== '');
    if (hasAnyError) return;

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-2xs space-y-5">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900">
            Coordonnées de livraison
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Vos informations serviront à préparer et acheminer votre colis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom complet"
            placeholder="Ex : Akpaki Jean-Marc"
            value={formData.customerName}
            required
            onChange={(e) => handleChange('customerName', e.target.value)}
            onBlur={() => handleBlur('customerName')}
            error={touched.customerName ? errors.customerName : undefined}
            icon={<User className="w-4 h-4 text-zinc-400" />}
          />

          <Input
            label="Téléphone (WhatsApp ou appel)"
            type="tel"
            placeholder="Ex : +229 01 62 01 88 07"
            value={formData.phone}
            required
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            error={touched.phone ? errors.phone : undefined}
            helper="Numéro joignable pour la confirmation et la livraison."
            icon={<Phone className="w-4 h-4 text-zinc-400" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ville"
            placeholder="Ex : Cotonou, Calavi, Porto-Novo..."
            value={formData.city}
            required
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            error={touched.city ? errors.city : undefined}
            icon={<MapPin className="w-4 h-4 text-zinc-400" />}
          />

          <Input
            label="Quartier / Zone"
            placeholder="Ex : Cadjèhoun, Akpakpa, Tankpè..."
            value={formData.area}
            required
            onChange={(e) => handleChange('area', e.target.value)}
            onBlur={() => handleBlur('area')}
            error={touched.area ? errors.area : undefined}
            icon={<Navigation className="w-4 h-4 text-zinc-400" />}
          />
        </div>

        <Input
          label="Indication précise de livraison (Repère)"
          placeholder="Ex : Près de la pharmacie de l'étoile, 2e von pavée après le marché"
          value={formData.deliveryNote}
          required
          onChange={(e) => handleChange('deliveryNote', e.target.value)}
          onBlur={() => handleBlur('deliveryNote')}
          error={touched.deliveryNote ? errors.deliveryNote : undefined}
          helper="Indication indispensable pour que le livreur vous trouve facilement."
          icon={<FileText className="w-4 h-4 text-zinc-400" />}
        />

        <Textarea
          label="Précision supplémentaire sur la commande (facultatif)"
          placeholder="Ex : Préférence horaire, appel avant départ, etc."
          value={formData.extraNote}
          rows={2}
          onChange={(e) => handleChange('extraNote', e.target.value)}
        />
      </div>

      {/* Conditions Box */}
      <ConditionsBox
        conditions={settings.salesConditions}
        accepted={formData.acceptedConditions}
        onToggleAccept={(val) => handleChange('acceptedConditions', val)}
        error={touched.acceptedConditions ? errors.acceptedConditions : undefined}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="whatsapp"
          size="lg"
          className="w-full text-base sm:text-lg py-4 rounded-2xl shadow-md"
          loading={loading}
          disabled={!isFormValid() || loading}
          icon={<CheckCircle2 className="w-5 h-5 stroke-[2.5]" />}
        >
          ENVOYER SUR WHATSAPP
        </Button>
        <p className="text-center text-xs text-zinc-500 mt-2 font-medium">
          🔒 Envoi direct de votre récapitulatif sur WhatsApp pour validation et paiement.
        </p>
      </div>
    </form>
  );
};
