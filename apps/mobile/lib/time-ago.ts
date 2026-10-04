/**
 * Mobile time-ago formatter. Mirrors the algorithm in
 * packages/views/inbox/components/inbox-list-item.tsx `useTimeAgo` so
 * "X minutes ago" reads identically across web/desktop and mobile.
 *
 * Uses getT() for locale-aware labels. Components calling this function
 * must also use useT() to ensure re-render on locale change.
 */
import { getT } from "@/lib/i18n/use-translation";

export function timeAgo(dateStr: string): string {
  const t = getT();
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t.timeAgo.justNow;
  if (minutes < 60) return t.timeAgo.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.timeAgo.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  if (days < 7) return t.timeAgo.daysAgo(days);
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return t.timeAgo.weeksAgo(weeks);
  const locale = useLanguageStore.getState().locale;
  return new Date(dateStr).toLocaleDateString(
    locale === "zh" ? "zh-CN" : "en-US",
    { month: "short", day: "numeric" },
  );
}

// Import here to avoid circular dependency issues — language-store imports
// from translations.ts which imports from language-store, but time-ago only
// needs the store's getState() at call time.
import { useLanguageStore } from "@/data/language-store";
