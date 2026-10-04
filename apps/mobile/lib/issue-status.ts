/**
 * Mirror of the BOARD_STATUSES order + status labels from
 * packages/core/issues/config/status.ts.
 *
 * Mirrored, not imported: the source file co-exports `STATUS_CONFIG` with
 * web colour tokens (Tailwind v4 syntax) that mobile must not pull in.
 * Keeping this list owned by mobile keeps the import boundary clean.
 *
 * If web ever reorders BOARD_STATUSES or adds/removes a status, this file
 * must be updated to keep the "Counts and visibility must agree" rule
 * (apps/mobile/CLAUDE.md) intact.
 */
import type { IssuePriority, IssueStatus } from "@multica/core/types";
import { getT } from "@/lib/i18n/use-translation";

/** Statuses surfaced in list/board views (matches web — `cancelled` excluded). */
export const BOARD_STATUSES: IssueStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "blocked",
];

export function getStatusLabel(status: IssueStatus): string {
  return getT().issueStatus[status];
}

export function getPriorityLabel(priority: IssuePriority): string {
  return getT().issuePriority[priority];
}

/** @deprecated Use getStatusLabel() — locale-aware. Kept for call-site compat. */
export const STATUS_LABEL: Record<IssueStatus, string> = new Proxy(
  {} as Record<IssueStatus, string>,
  { get: (_, key: string) => getT().issueStatus[key as IssueStatus] ?? key },
);

/** @deprecated Use getPriorityLabel() — locale-aware. Kept for call-site compat. */
export const PRIORITY_LABEL: Record<IssuePriority, string> = new Proxy(
  {} as Record<IssuePriority, string>,
  { get: (_, key: string) => getT().issuePriority[key as IssuePriority] ?? key },
);
