import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  initLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  setLanguage: async (lang) => {
    await AsyncStorage.setItem('userLanguage', lang);
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
  initLanguage: async () => {
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
      set({ language: storedLanguage });
    }
  },
})); 