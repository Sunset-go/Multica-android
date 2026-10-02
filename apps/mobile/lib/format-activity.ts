/**
 * Activity-row text formatter. Subset of the web `formatActivity` in
 * packages/views/issues/components/issue-detail.tsx:95 — same actions,
 * Chinese-only copy (mobile is now Chinese-only).
 *
 * Unknown actions fall through to the raw string in `entry.action`. NEVER
 * throw and NEVER drop the row — that's the API Response Compatibility rule
 * from repo-root CLAUDE.md (server may add new action enum values; older
 * mobile clients in the in the wild must render them as a generic fallback, not
 * crash).
 */
import type {
  IssuePriority,
  IssueStatus,
  TimelineEntry,
} from "@multica/core/types";
import { formatDateOnly } from "@multica/core/issues/date";

const STATUS_LABEL: Record<IssueStatus, string> = {
  backlog: "待办",
  todo: "待开始",
  in_progress: "进行中",
  in_review: "审阅中",
  done: "已完成",
  blocked: "已阻塞",
  cancelled: "已取消",
};

const PRIORITY_LABEL: Record<IssuePriority, string> = {
  urgent: "紧急",
  high: "高",
  medium: "中",
  low: "低",
  none: "无优先级",
};

function statusName(s: string | undefined): string {
  if (s && s in STATUS_LABEL) return STATUS_LABEL[s as IssueStatus];
  return s ?? "?";
}

function priorityName(p: string | undefined): string {
  if (p && p in PRIORITY_LABEL) return PRIORITY_LABEL[p as IssuePriority];
  return p ?? "?";
}

// start_date / due_date are calendar days — format timezone-safely (no offset
// day shift). Mirrors web's formatActivity in issue-detail.tsx.
function shortDate(date: string | undefined): string {
  if (!date) return "?";
  return formatDateOnly(date, { month: "short", day: "numeric" }, "zh-CN");
}

export function formatActivity(
  entry: TimelineEntry,
  resolveActorName: (
    type: string | null | undefined,
    id: string | null | undefined,
  ) => string,
): string {
  const details = (entry.details ?? {}) as Record<string, string>;
  switch (entry.action) {
    case "created":
      return "创建了任务";
    case "status_changed":
      return `修改了状态：${statusName(details.from)} → ${statusName(details.to)}`;
    case "priority_changed":
      return `修改了优先级：${priorityName(details.from)} → ${priorityName(details.to)}`;
    case "assignee_changed": {
      const isSelf =
        details.to_type === entry.actor_type &&
        details.to_id === entry.actor_id;
      if (isSelf) return "自分配给自己";
      if (details.from_id && !details.to_id) return "移除了负责人";
      const toName =
        details.to_id && details.to_type
          ? resolveActorName(details.to_type, details.to_id)
          : null;
      if (toName) return `分配给了 ${toName}`;
      return "修改了负责人";
    }
    case "start_date_changed": {
      if (!details.to) return "移除了开始日期";
      return `设置开始日期为 ${shortDate(details.to)}`;
    }
    case "due_date_changed": {
      if (!details.to) return "移除了截止日期";
      return `设置截止日期为 ${shortDate(details.to)}`;
    }
    case "title_changed":
      return `重命名：\"${details.from ?? "?"}\" → \"${details.to ?? "?"}\"`;
    case "description_updated":
      return "更新了描述";
    case "task_completed": {
      const n = entry.coalesced_count ?? 1;
      return n > 1 ? `完成了 ${n} 个任务` : "完成了 1 个任务";
    }
    case "task_failed": {
      const n = entry.coalesced_count ?? 1;
      return n > 1 ? `${n} 个任务失败` : "1 个任务失败";
    }
    case "squad_leader_evaluated": {
      const reason = details.reason?.trim();
      switch (details.outcome) {
        case "action":
          return reason
            ? `已评估并执行操作：${reason}`
            : "已评估并执行操作";
        case "no_action":
          return reason
            ? `已评估：无需操作（${reason}）`
            : "已评估：无需操作";
        case "failed":
          return reason
            ? `评估失败：${reason}`
            : "评估失败";
        default:
          return "评估了小队触发器";
      }
    }
    default:
      return entry.action ?? "";
  }
}
