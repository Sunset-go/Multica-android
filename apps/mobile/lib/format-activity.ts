/**
 * Activity-row text formatter. Subset of the web `formatActivity` in
 * packages/views/issues/components/issue-detail.tsx — same actions,
 * locale-aware via getT().
 *
 * Unknown actions fall through to the raw string in `entry.action`. NEVER
 * throw and NEVER drop the row — that's the API Response Compatibility rule
 * from repo-root CLAUDE.md (server may add new action enum values; older
 * mobile clients in the wild must render them as a generic fallback, not
 * crash).
 */
import type {
  IssuePriority,
  IssueStatus,
  TimelineEntry,
} from "@multica/core/types";
import { formatDateOnly } from "@multica/core/issues/date";
import { getT } from "@/lib/i18n/use-translation";
import { useLanguageStore } from "@/data/language-store";

function statusName(s: string | undefined): string {
  const t = getT();
  if (s && s in t.activity.status) return t.activity.status[s as IssueStatus];
  return s ?? "?";
}

function priorityName(p: string | undefined): string {
  const t = getT();
  if (p && p in t.activity.priority)
    return t.activity.priority[p as IssuePriority];
  return p ?? "?";
}

// start_date / due_date are calendar days — format timezone-safely (no offset
// day shift). Mirrors web's formatActivity in issue-detail.tsx.
function shortDate(date: string | undefined): string {
  if (!date) return "?";
  const locale = useLanguageStore.getState().locale;
  return formatDateOnly(date, { month: "short", day: "numeric" }, locale === "zh" ? "zh-CN" : "en-US");
}

export function formatActivity(
  entry: TimelineEntry,
  resolveActorName: (
    type: string | null | undefined,
    id: string | null | undefined,
  ) => string,
): string {
  const t = getT();
  const details = (entry.details ?? {}) as Record<string, string>;
  switch (entry.action) {
    case "created":
      return t.activity.createdIssue;
    case "status_changed":
      return t.activity.statusChanged(statusName(details.from), statusName(details.to));
    case "priority_changed":
      return t.activity.priorityChanged(priorityName(details.from), priorityName(details.to));
    case "assignee_changed": {
      const isSelf =
        details.to_type === entry.actor_type &&
        details.to_id === entry.actor_id;
      if (isSelf) return t.activity.selfAssigned;
      if (details.from_id && !details.to_id) return t.activity.removedAssignee;
      const toName =
        details.to_id && details.to_type
          ? resolveActorName(details.to_type, details.to_id)
          : null;
      if (toName) return t.activity.assignedTo(toName);
      return t.activity.changedAssignee;
    }
    case "start_date_changed": {
      if (!details.to) return t.activity.removedStartDate;
      return t.activity.setStartDate(shortDate(details.to));
    }
    case "due_date_changed": {
      if (!details.to) return t.activity.removedDueDate;
      return t.activity.setDueDate(shortDate(details.to));
    }
    case "title_changed":
      return t.activity.renamed(details.from ?? "?", details.to ?? "?");
    case "description_updated":
      return t.activity.updatedDescription;
    case "task_completed": {
      const n = entry.coalesced_count ?? 1;
      return t.activity.completedTasks(n);
    }
    case "task_failed": {
      const n = entry.coalesced_count ?? 1;
      return t.activity.failedTasks(n);
    }
    case "squad_leader_evaluated": {
      const reason = details.reason?.trim();
      switch (details.outcome) {
        case "action":
          return reason
            ? t.activity.evaluatedWithAction(reason)
            : t.activity.evaluatedNoAction;
        case "no_action":
          return reason
            ? t.activity.evaluatedNoActionReason(reason)
            : t.activity.evaluatedNoAction;
        case "failed":
          return reason
            ? t.activity.evaluationFailed(reason)
            : t.activity.evaluationFailedNoReason;
        default:
          return t.activity.evaluatedSquadTrigger;
      }
    }
    default:
      return entry.action ?? "";
  }
}
