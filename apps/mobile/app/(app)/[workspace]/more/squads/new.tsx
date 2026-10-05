/**
 * Create a new Squad (团队). Mirrors more/agents/new.tsx shape — a
 * simple form with Profile (name, description, avatar_url) + Leader
 * (required — the squad's owner agent).
 *
 * On submit, POST /api/squads with the current form state, then navigate
 * to the new squad's edit page so the user can add members immediately.
 */
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import type { Agent } from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n/use-translation";
import { useWorkspaceStore } from "@/data/workspace-store";
import { useColorScheme } from "@/lib/use-color-scheme";
import { THEME } from "@/lib/theme";
import { agentListOptions } from "@/data/queries/agents";
import { useCreateSquad } from "@/data/mutations/squads";

export default function SquadNewPage() {
  const t = useT();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const slug = useWorkspaceStore((s) => s.currentWorkspaceSlug);
  const { colorScheme } = useColorScheme();
  const mutedFg = THEME[colorScheme].mutedForeground;
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [leaderId, setLeaderId] = useState("");

  const agentsQ = useQuery(agentListOptions(wsId));
  const agents = useMemo(
    () => (agentsQ.data ?? []).filter((a) => !a.archived_at),
    [agentsQ.data],
  );

  const createSquad = useCreateSquad();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("", t.squadNew.namePlaceholder);
      return;
    }
    if (!leaderId) {
      Alert.alert("", t.squadNew.noLeaderSelected);
      return;
    }
    try {
      const squad = await createSquad.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        leader_id: leaderId,
      });
      if (slug) router.replace(`/${slug}/more/squads/${squad.id}`);
    } catch (e) {
      Alert.alert(
        t.squadNew.createFailed,
        e instanceof Error ? e.message : undefined,
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 py-4 gap-4"
      keyboardShouldPersistTaps="handled"
    >
      {/* Section 1: Profile */}
      <SectionGroup title={t.squadNew.profile}>
        <FieldRow label={t.squadNew.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t.squadNew.namePlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            maxLength={100}
          />
        </FieldRow>
        <Separator />
        <FieldRow label={t.squadNew.description}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t.squadNew.descriptionPlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            maxLength={255}
            multiline
            numberOfLines={2}
          />
        </FieldRow>
        <Separator />
        <FieldRow label={t.squadNew.avatarUrl}>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder={t.squadNew.avatarUrlPlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </FieldRow>
      </SectionGroup>

      {/* Section 2: Leader */}
      <SectionGroup title={t.squadNew.leader}>
        <Pressable
          onPress={() => showLeaderPicker(agents, setLeaderId, t)}
          className="flex-row items-center px-4 py-3.5 active:bg-secondary gap-3"
        >
          <View className="flex-1">
            <Text className="text-base font-medium text-foreground">
              {t.squadNew.selectLeader}
            </Text>
          </View>
          <Text
            className="text-sm text-muted-foreground mr-2"
            numberOfLines={1}
          >
            {agents.find((a) => a.id === leaderId)?.name ??
              t.squadNew.noLeaderSelected}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={mutedFg} />
        </Pressable>
      </SectionGroup>

      {/* Submit button */}
      <View className="pt-2">
        <Button
          onPress={handleCreate}
          disabled={createSquad.isPending || !name.trim() || !leaderId}
        >
          <Text>
            {createSquad.isPending ? t.squadNew.creating : t.squadNew.title}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}

function SectionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs uppercase tracking-wider text-muted-foreground px-1">
        {title}
      </Text>
      <View className="rounded-md border border-border bg-card overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5 gap-3">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      {children}
    </View>
  );
}

function showLeaderPicker(
  agents: Agent[],
  onChange: (id: string) => void,
  t: ReturnType<typeof useT>,
) {
  if (agents.length === 0) {
    Alert.alert("", t.squadNew.noAgents);
    return;
  }
  const buttons = agents.map((a) => ({
    text: a.name,
    onPress: () => onChange(a.id),
  }));
  Alert.alert(t.squadNew.selectLeader, undefined, [
    ...buttons,
    { text: t.squadNew.cancel, style: "cancel" as const },
  ]);
}
