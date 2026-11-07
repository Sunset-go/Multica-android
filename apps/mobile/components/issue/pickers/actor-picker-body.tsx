/**
 * Pure picker body for the Quick Create (agent-mode) target actor — the
 * agent or squad the prompt will be dispatched to. Presents a segmented
 * Agent / Squad toggle and the matching list; single-select with a
 * checkmark, mirroring `priority-picker-body.tsx`'s row shape.
 *
 * The route wires the selected type into the store via `onChange`, so the
 * chip on the quick-create form rehydrates when the sheet dismisses.
 */
import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import type { Agent, Squad } from "@multica/core/types";
import { canAssignAgentToIssue } from "@multica/core/permissions";
import { Text } from "@/components/ui/text";
import { ActorAvatar } from "@/components/ui/actor-avatar";
import { agentListOptions } from "@/data/queries/agents";
import { squadListOptions } from "@/data/queries/squads";
import { memberListOptions } from "@/data/queries/members";
import { useAuthStore } from "@/data/auth-store";
import { useWorkspaceStore } from "@/data/workspace-store";
import {
  filterQuickCreateAgents,
  filterQuickCreateSquads,
  runnableAgentIdSet,
} from "@/lib/quick-create-actor-filter";
import { THEME } from "@/lib/theme";
import { useT } from "@/lib/i18n/use-translation";
import type { QuickCreateActor, QuickCreateActorType } from "@/data/stores/quick-create-draft-store";

interface Props {
  value: QuickCreateActor | null;
  onChange: (next: QuickCreateActor | null) => void;
}

type Row = {
  type: QuickCreateActorType;
  id: string;
  name: string;
  avatarType: "agent" | "squad";
};

export function ActorPickerBody({ value, onChange }: Props) {
  const t = useT();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { colorScheme } = useColorScheme();
  const checkColor =
    colorScheme === "dark" ? THEME.dark.primary : THEME.light.primary;

  // Default the segment to whatever type the current selection has, so the
  // picker re-opens on the group the user last chose from.
  const [type, setType] = useState<QuickCreateActorType>(
    value?.type ?? "agent",
  );

  const { data: agents = [] } = useQuery(agentListOptions(wsId));
  const { data: squads = [] } = useQuery(squadListOptions(wsId));
  const { data: members = [] } = useQuery(memberListOptions(wsId));
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const rows = useMemo<Row[]>(() => {
    if (type === "agent") {
      // Mirror web/desktop: drop archived + runtime-unbound agents and any
      // agent the current user cannot invoke (private / restricted).
      const myRole = members.find((m) => m.user_id === userId)?.role ?? null;
      const assignable = filterQuickCreateAgents(agents, (a) =>
        canAssignAgentToIssue(a, { userId, role: myRole }).allowed,
      );
      return assignable.map((a: Agent) => ({
        type: "agent" as const,
        id: a.id,
        name: a.name,
        avatarType: "agent" as const,
      }));
    }
    // Squads: drop archived and any whose leader agent isn't runnable.
    const runnable = runnableAgentIdSet(agents);
    return filterQuickCreateSquads(squads, runnable).map((s: Squad) => ({
      type: "squad" as const,
      id: s.id,
      name: s.name,
      avatarType: "squad" as const,
    }));
  }, [type, agents, squads, members, userId]);

  const segment = (value2: QuickCreateActorType, label: string) => {
    const selected = type === value2;
    return (
      <Pressable
        onPress={() => setType(value2)}
        className="flex-1 items-center rounded-lg py-2 active:opacity-70"
        style={
          selected
            ? { backgroundColor: colorScheme === "dark" ? THEME.dark.secondary : THEME.light.secondary }
            : undefined
        }
      >
        <Text
          className={
            selected ? "text-sm font-semibold text-foreground" : "text-sm text-muted-foreground"
          }
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1">
      <View className="px-4 pt-3 pb-2">
        <Text className="text-lg font-semibold text-foreground">
          {t.issues.pickAgent}
        </Text>
      </View>
      <View className="mx-4 mb-2 flex-row rounded-lg bg-secondary/60 p-0.5">
        {segment("agent", t.issues.agentMode)}
        {segment("squad", t.issues.squadMode)}
      </View>
      <FlatList
        data={rows}
        keyExtractor={(row) => `${row.type}-${row.id}`}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-2 pb-6"
        ListEmptyComponent={
          <Text className="px-4 py-6 text-center text-muted-foreground">
            {type === "agent" ? t.issues.noAgents : t.issues.noSquads}
          </Text>
        }
        renderItem={({ item }) => {
          const selected =
            value?.type === item.type && value.id === item.id;
          return (
            <Pressable
              onPress={() => onChange({ type: item.type, id: item.id, name: item.name })}
              className="flex-row items-center gap-3 rounded-lg px-3 py-3 active:bg-secondary"
            >
              <ActorAvatar type={item.avatarType} id={item.id} size={24} />
              <Text className="flex-1 text-base text-foreground" numberOfLines={1}>
                {item.name}
              </Text>
              {selected ? (
                <Ionicons name="checkmark" size={20} color={checkColor} />
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
