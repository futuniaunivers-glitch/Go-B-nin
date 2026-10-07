import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { StoreSettings } from '../types';
import { DEFAULT_SETTINGS } from '../lib/defaultData';

const LOCAL_STORAGE_KEY = 'gds229_settings';

function getLocalSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SETTINGS;
}

function saveLocalSettings(settings: StoreSettings): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

export function validateSettings(settings: Partial<StoreSettings>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (settings.whatsappNumber) {
    const digitsOnly = /^\d+$/;
    if (!digitsOnly.test(settings.whatsappNumber.trim())) {
      errors.push('Le numéro WhatsApp ne doit contenir que des chiffres internationaux (sans espace ni signe +). Ex: 2290162018807');
    }
  }

  const urlFields: Array<{ key: keyof StoreSettings; label: string }> = [
    { key: 'whatsappChannelUrl', label: 'Lien de la chaîne WhatsApp' },
    { key: 'tiktokUrl', label: 'Lien TikTok' },
    { key: 'facebookUrl', label: 'Lien Facebook' },
    { key: 'mapsUrl', label: 'Lien Google Maps' },
  ];

  for (const { key, label } of urlFields) {
    const val = settings[key];
    if (val && typeof val === 'string' && val.trim() !== '') {
      if (!val.trim().startsWith('https://')) {
        errors.push(`${label} doit obligatoirement commencer par https://`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function fetchSettings(): Promise<StoreSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'main'));
      if (snap.exists()) {
        return { ...DEFAULT_SETTINGS, ...(snap.data() as StoreSettings) };
      }
      return DEFAULT_SETTINGS;
    } catch (err) {
      console.warn('Firestore fetchSettings fallback to default settings:', err);
      return getLocalSettings();
    }
  }

  return getLocalSettings();
}

export async function saveSettings(settings: StoreSettings): Promise<StoreSettings> {
  const validation = validateSettings(settings);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(
        doc(db, 'settings', 'main'),
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      saveLocalSettings(settings);
      return settings;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/main');
    }
  }

  saveLocalSettings(settings);
  return settings;
}
