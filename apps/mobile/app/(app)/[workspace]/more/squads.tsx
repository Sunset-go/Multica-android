/**
 * Squad (团队) list page — workspace-wide list of squads, tap to edit,
 * `+` to create. Mirrors more/agents.tsx shape.
 *
 * Filters:
 *   - archived_at: null (hide archived squads)
 *
 * Row displays the squad's name, description (truncated), and a small
 * "N 成员" badge so the user can see team size at a glance. Tapping a
 * row pushes more/squads/[id]; the `+` button / empty-state CTA push
 * more/squads/new.
 */
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { Squad } from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n/use-translation";
import { useWorkspaceStore } from "@/data/workspace-store";
import { squadListOptions } from "@/data/queries/squads";
import { THEME } from "@/lib/theme";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SquadsPage() {
  const t = useT();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const slug = useWorkspaceStore((s) => s.currentWorkspaceSlug);
  const { colorScheme } = useColorScheme();
  const mutedFg = THEME[colorScheme].mutedForeground;

  const { data, isLoading, error, refetch, isRefetching } = useQuery(
    squadListOptions(wsId),
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const goCreate = useCallback(() => {
    if (slug) router.push(`/${slug}/more/squads/new`);
  }, [slug]);

  const headerRight = useCallback(() => {
    return <PlusButton onPress={goCreate} />;
  }, [goCreate]);

  const squads = (data ?? []).filter((s) => !s.archived_at);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <Stack.Screen options={{ headerRight }} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error && !data ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-destructive text-center">
            {t.agentEdit.loadError}
          </Text>
        </View>
      ) : squads.length === 0 ? (
        <EmptyState onCreate={goCreate} />
      ) : (
        <FlatList
          className="flex-1 bg-background"
          data={squads}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ItemSeparatorComponent={() => <Separator />}
          renderItem={({ item }) => (
            <SquadRow
              squad={item}
              mutedFg={mutedFg}
              onPress={() =>
                slug ? router.push(`/${slug}/more/squads/${item.id}`) : null
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function PlusButton({ onPress }: { onPress: () => void }) {
  const t = useT();
  return (
    <IconButton
      name="add"
      onPress={onPress}
      accessibilityLabel={t.squadNew.title}
    />
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const t = useT();
  return (
    <View className="flex-1 items-center justify-center px-6 gap-4">
      <Text className="text-base font-medium text-foreground">
        {t.squadEdit.noSquads}
      </Text>
      <Button variant="default" onPress={onCreate}>
        <Text>{t.squadNew.title}</Text>
      </Button>
    </View>
  );
}

function SquadRow({
  squad,
  mutedFg,
  onPress,
}: {
  squad: Squad;
  mutedFg: string;
  onPress: () => void;
}) {
  const initial = squad.name.charAt(0).toUpperCase();
  const memberCount = squad.member_count ?? squad.member_preview?.length ?? 0;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:bg-secondary gap-3"
    >
      <Avatar alt={squad.name} className="size-10">
        {squad.avatar_url ? (
          <AvatarImage source={{ uri: squad.avatar_url }} />
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
            {squad.name}
          </Text>
          {memberCount > 0 ? (
            <View className="rounded-full bg-secondary px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">
                {memberCount}
              </Text>
            </View>
          ) : null}
        </View>
        {squad.description ? (
          <Text
            className="text-sm text-muted-foreground mt-0.5"
            numberOfLines={2}
          >
            {squad.description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={mutedFg} />
    </Pressable>
  );
}
