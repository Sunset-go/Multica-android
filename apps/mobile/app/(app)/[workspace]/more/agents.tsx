/**
 * Agent list page — workspace-wide list of agents, tap to edit.
 *
 * Filters:
 *   - archived_at: null (hide archived agents)
 *   - runtime_bound: show a "Needs runtime" badge for unbound agents
 *
 * Pull-to-refresh + FlatList. Tapping a row pushes more/agents/[id].
 */
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@multica/core/types";
import { isAgentRuntimeBound } from "@multica/core/agents";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n/use-translation";
import { useWorkspaceStore } from "@/data/workspace-store";
import { agentListOptions } from "@/data/queries/agents";
import { THEME } from "@/lib/theme";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ionicons } from "@expo/vector-icons";

export default function AgentsPage() {
  const t = useT();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const slug = useWorkspaceStore((s) => s.currentWorkspaceSlug);
  const { colorScheme } = useColorScheme();
  const mutedFg = THEME[colorScheme].mutedForeground;

  const { data, isLoading, error, refetch, isRefetching } = useQuery(
    agentListOptions(wsId),
  );

  // Refetch on focus — agent list can change from other surfaces.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const agents = data?.filter((a) => !a.archived_at) ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-destructive text-center">
          {t.agentEdit.loadError}
        </Text>
      </View>
    );
  }

  if (agents.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-muted-foreground text-center">
          {t.chat.noAgents}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={agents}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ItemSeparatorComponent={() => <Separator />}
      renderItem={({ item }) => (
        <AgentRow
          agent={item}
          mutedFg={mutedFg}
          onPress={() =>
            router.push(`/${slug}/more/agents/${item.id}`)
          }
        />
      )}
    />
  );
}

function AgentRow({
  agent,
  mutedFg,
  onPress,
}: {
  agent: Agent;
  mutedFg: string;
  onPress: () => void;
}) {
  const bound = isAgentRuntimeBound(agent);
  const initial = agent.name.charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:bg-secondary gap-3"
    >
      <Avatar alt={agent.name} className="size-10">
        {agent.avatar_url ? (
          <AvatarImage source={{ uri: agent.avatar_url }} />
        ) : null}
        <AvatarFallback>
          <Text className="text-sm font-semibold text-muted-foreground">
            {initial}
          </Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-base font-medium text-foreground"
            numberOfLines={1}
          >
            {agent.name}
          </Text>
          {!bound ? (
            <View className="rounded-full bg-secondary px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">
                Needs runtime
              </Text>
            </View>
          ) : null}
        </View>
        {agent.description ? (
          <Text
            className="text-sm text-muted-foreground mt-0.5"
            numberOfLines={2}
          >
            {agent.description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={mutedFg} />
    </Pressable>
  );
}
