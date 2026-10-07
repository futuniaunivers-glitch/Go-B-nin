import React, { createContext, useContext, useEffect, useState } from 'react';
import { StoreSettings } from '../types';
import { DEFAULT_SETTINGS } from '../lib/defaultData';
import { fetchSettings, saveSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (newSettings: StoreSettings) => {
    const updated = await saveSettings(newSettings);
    setSettings(updated);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: load,
        updateSettings: update,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
