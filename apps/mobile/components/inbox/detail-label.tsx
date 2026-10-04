/**
 * Mobile InboxDetailLabel — type-aware second-line for inbox rows.
 *
 * Mirrors packages/views/inbox/components/inbox-detail-label.tsx exactly:
 * for each InboxItemType the user sees the same label they would see on
 * web/desktop. This is a Behavioral parity concern — if web shows "Set
 * status to ✓ Done", mobile must show "状态设为 ✓ 已完成" (rendered
 * with mobile primitives, not the literal HTML).
 *
 * Web is i18n-driven (useT). Mobile is now Chinese-only; the label
 * map is kept inline because each type has a distinct message shape.
 */
import { View } from "react-native";
import type {
  InboxItem,
  IssueStatus,
  IssuePriority,
} from "@multica/core/types";
import { formatDateOnly } from "@multica/core/issues/date";
import { Text } from "@/components/ui/text";
import { StatusIcon } from "@/components/ui/status-icon";
import { PriorityIcon } from "@/components/ui/priority-icon";
import { useActorLookup } from "@/data/use-actor-name";
import { useLanguageStore } from "@/data/language-store";
import { useT, type Locale } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

// due_date is a calendar day — format timezone-safely (no offset day shift).
function shortDate(dateStr: string, locale: Locale): string {
  return formatDateOnly(dateStr, { month: "short", day: "numeric" }, locale === "zh" ? "zh-CN" : "en-US");
}

function singleLine(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function InboxDetailLabel({
  item,
  className,
}: {
  item: InboxItem;
  className?: string;
}) {
  const t = useT();
  const locale = useLanguageStore((s) => s.locale);
  const { getName } = useActorLookup();
  const details = item.details ?? {};

  // Cases with inline icons → Row layout.
  if (item.type === "status_changed" && details.to) {
    const status = details.to as IssueStatus;
    return (
      <View className={cn("flex-row items-center gap-1", className)}>
        <Text className="text-xs text-muted-foreground">{t.inboxDetail.setStatusTo}</Text>
        <StatusIcon status={status} size={12} />
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {t.issueStatus[status] ?? status}
        </Text>
      </View>
    );
  }

  if (item.type === "priority_changed" && details.to) {
    const priority = details.to as IssuePriority;
    return (
      <View className={cn("flex-row items-center gap-1", className)}>
        <Text className="text-xs text-muted-foreground">{t.inboxDetail.setPriorityTo}</Text>
        <PriorityIcon priority={priority} size={12} />
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {t.issuePriority[priority] ?? priority}
        </Text>
      </View>
    );
  }

  // Single-string cases.
  const text = (() => {
    switch (item.type) {
      case "issue_assigned":
      case "assignee_changed":
        if (details.new_assignee_id) {
          const name = getName(
            (details.new_assignee_type ?? "member") as "member" | "agent",
            details.new_assignee_id,
          );
          return t.inboxDetail.assignedTo(name);
        }
        return t.inboxDetail.type[item.type];
      case "unassigned":
        return t.inboxDetail.removedAssignee;
      case "due_date_changed":
        return details.to
          ? t.inboxDetail.dueDateSetTo(shortDate(details.to, locale))
          : t.inboxDetail.removedDueDate;
      case "new_comment":
        return singleLine(item.body) || t.inboxDetail.type[item.type];
      case "reaction_added":
        return details.emoji
          ? t.inboxDetail.reactedWith(details.emoji)
          : t.inboxDetail.type[item.type];
      case "quick_create_done":
        return details.identifier
          ? t.inboxDetail.createdByAgent(details.identifier)
          : t.inboxDetail.type[item.type];
      case "quick_create_failed": {
        const detail = singleLine(details.error) || singleLine(item.body);
        return detail ? t.inboxDetail.failedDetail(detail) : t.inboxDetail.type[item.type];
      }
      // Mirrors packages/views/inbox/components/inbox-detail-label.tsx: the
      // unconfirmed outcome deliberately drops the "失败：" prefix, because
      // the issue may actually have been created.
      case "quick_create_unconfirmed": {
        const detail = singleLine(details.error) || singleLine(item.body);
        return detail || t.inboxDetail.type[item.type];
      }
      default:
        return t.inboxDetail.type[item.type] ?? item.type;
    }
  })();

  return (
    <Text
      className={cn("text-xs text-muted-foreground", className)}
      numberOfLines={1}
    >
      {text}
    </Text>
  );
}
