/**
 * Language preference store — Zustand. Persists the user's UI language
 * choice to expo-secure-store so it survives app restarts.
 *
 * The store holds a simple `locale: "zh" | "en"` value. Components read
 * translations through the `useT()` hook (lib/i18n/use-translation.ts),
 * which subscribes to this store and returns the matching translation
 * dictionary.
 *
 * Default is "zh" (the app's original language).
 */
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export type Locale = "zh" | "en";

const STORAGE_KEY = "multica_language";

interface LanguageState {
  locale: Locale;
  /** Set the locale and persist to SecureStore. */
  setLocale: (locale: Locale) => Promise<void>;
  /** Restore the locale from SecureStore on cold start. */
  restoreLocale: () => Promise<Locale>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: "zh",

  setLocale: async (locale) => {
    set({ locale });
    await SecureStore.setItemAsync(STORAGE_KEY, locale);
  },

  restoreLocale: async () => {
    const saved = await SecureStore.getItemAsync(STORAGE_KEY);
    if (saved === "zh" || saved === "en") {
      set({ locale: saved });
      return saved;
    }
    return "zh";
  },
}));
