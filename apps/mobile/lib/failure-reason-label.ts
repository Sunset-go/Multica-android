/**
 * Mirror of `packages/views/agents/components/tabs/task-failure.ts:REASON_LABEL`.
 *
 * Why mirror: mobile cannot import from packages/views per the apps/mobile
 * CLAUDE.md sharing rule. Only the human copy is mobile-owned.
 *
 * Locale-aware via getT(). Uses the runRow.status translation map.
 *
 * Divergence from web, deliberate: the web helper falls back to the raw wire
 * value, which is machine-y but searchable — right for an operator reading the
 * execution log. This one backs a chat bubble read by the person who just sent
 * a message, so an unrecognised reason degrades to a plain "Failed" instead of
 * leaking an enum string at them.
 */
import { getT } from "@/lib/i18n/use-translation";

export function failureReasonLabel(reason: string | null | undefined): string {
  const t = getT();
  if (!reason) return t.runRow.failed;
  return t.runRow.status[reason as keyof typeof t.runRow.status] ?? t.runRow.failed;
}
