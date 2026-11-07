/**
 * Bottom chip row for the Quick Create (agent-mode) form. Mirrors
 * `create-form-attribute-row.tsx` but operates on `useQuickCreateDraftStore`
 * and offers the narrower agent-mode field set: target actor (agent/squad),
 * priority, due date and project — no status / human assignee (the server
 * dispatches the prompt to the actor directly).
 *
 * Tapping a chip pushes a formSheet picker route under
 * `quick-create-picker/<field>` — the route reads/writes the same draft
 * store, so the chip rehydrates automatically when the sheet dismisses.
 */
import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AttributeChip } from "@/components/issue/attribute-chip";
import { ActorAvatar } from "@/components/ui/actor-avatar";
import { PriorityIcon } from "@/components/ui/priority-icon";
import { ProjectIcon } from "@/components/ui/project-icon";
import { formatDateOnly } from "@multica/core/issues/date";
import { useQuickCreateDraftStore } from "@/data/stores/quick-create-draft-store";
import { useWorkspaceStore } from "@/data/workspace-store";
import { PRIORITY_LABEL } from "@/lib/issue-status";
import { useT, getT } from "@/lib/i18n/use-translation";

type QuickCreatePickerField = "actor" | "priority" | "project" | "due-date";

const QUICK_CREATE_PICKER_PATHNAMES = {
  actor: "/[workspace]/quick-create-picker/actor",
  priority: "/[workspace]/quick-create-picker/priority",
  project: "/[workspace]/quick-create-picker/project",
  "due-date": "/[workspace]/quick-create-picker/due-date",
} as const satisfies Record<QuickCreatePickerField, string>;

export function QuickCreateAttributeRow() {
  const t = useT();
  const wsSlug = useWorkspaceStore((s) => s.currentWorkspaceSlug);
  const actor = useQuickCreateDraftStore((s) => s.actor);
  const priority = useQuickCreateDraftStore((s) => s.priority);
  const dueDate = useQuickCreateDraftStore((s) => s.dueDate);
  const project = useQuickCreateDraftStore((s) => s.project);

  const priorityLabel =
    priority === "none" ? t.issues.priority : PRIORITY_LABEL[priority];

  const open = (field: QuickCreatePickerField) => {
    if (!wsSlug) return;
    router.push({
      pathname: QUICK_CREATE_PICKER_PATHNAMES[field],
      params: { workspace: wsSlug },
    });
  };

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        <AttributeChip
          icon={
            actor ? (
              <ActorAvatar type={actor.type} id={actor.id} size={16} />
            ) : (
              <Ionicons name="sparkles-outline" size={16} color="#a1a1aa" />
            )
          }
          label={actor?.name ?? t.issues.pickAgent}
          variant={actor ? "filled" : "dimmed"}
          onPress={() => open("actor")}
        />
        <AttributeChip
          icon={<PriorityIcon priority={priority} />}
          label={priorityLabel}
          variant={priority === "none" ? "dimmed" : "filled"}
          onPress={() => open("priority")}
        />
        <AttributeChip
          icon={
            <Ionicons
              name="calendar-outline"
              size={14}
              color={dueDate ? undefined : "#a1a1aa"}
            />
          }
          label={dueDate ? formatDueDate(dueDate) : t.projects.dueDateField}
          variant={dueDate ? "filled" : "dimmed"}
          onPress={() => open("due-date")}
        />
        <AttributeChip
          icon={
            project ? (
              <ProjectIcon icon={project.icon} size="sm" />
            ) : (
              <Ionicons name="folder-outline" size={14} color="#a1a1aa" />
            )
          }
          label={project?.title ?? t.projects.projectField}
          variant={project ? "filled" : "dimmed"}
          onPress={() => open("project")}
        />
      </View>
    </View>
  );
}

// due_date is a calendar day — format timezone-safely (no offset day shift).
function formatDueDate(iso: string): string {
  return (
    formatDateOnly(iso, { month: "short", day: "numeric" }) ||
    getT().projects.dueDateField
  );
}
