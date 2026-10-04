/**
 * useT — returns the translation dictionary for the current locale.
 *
 * Subscribes to the language store so components re-render when the
 * user switches language. Usage:
 *
 *   const t = useT();
 *   <Text>{t.settings.title}</Text>
 *
 * The returned object is referentially stable for a given locale —
 * switching locale produces a new object, triggering re-renders only
 * in components that actually read translations.
 */
import { useLanguageStore } from "@/data/language-store";
import { translations, getT, type TranslationDict } from "./translations";

export { getT, type TranslationDict };
export { translations, type Locale } from "./translations";

export function useT(): TranslationDict {
  const locale = useLanguageStore((s) => s.locale);
  return translations[locale];
}
