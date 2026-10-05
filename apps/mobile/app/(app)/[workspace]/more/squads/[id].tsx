/**
 * Squad (团队) edit page — full config editor mirroring the web/desktop
 * squad surface.
 *
 * Three SectionGroups (ScrollView, same pattern as more/agents/[id].tsx):
 *   1. Profile — name, description, avatar_url, instructions
 *   2. Leader — current leader display + "Change leader" picker (uses
 *      updateSquad({ leader_id }) — server derives member.role = "leader"
 *      from the squad's leader_id, so we don't need to touch member
 *      roles directly for a leader change)
 *   3. Members — add agent / add human / remove. Each row shows the
 *      member's avatar, name, and a role pill (leader/member).
 *
 * Save flow: updateSquad (base fields) only. Members are mutated
 * immediately via addSquadMember / removeSquadMember (no save button
 * for them — the server treats membership as a set operation, not a
 * draft).
 */
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import type {
  Agent,
  MemberWithUser,
  SquadMember,
} from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useT } from "@/lib/i18n/use-translation";
import { useWorkspaceStore } from "@/data/workspace-store";
import { useColorScheme } from "@/lib/use-color-scheme";
import { THEME } from "@/lib/theme";
import { squadDetailOptions, squadMembersOptions } from "@/data/queries/squads";
import { agentListOptions } from "@/data/queries/agents";
import { memberListOptions } from "@/data/queries/members";
import {
  useUpdateSquad,
  useAddSquadMember,
  useRemoveSquadMember,
} from "@/data/mutations/squads";

export default function SquadEditPage() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { colorScheme } = useColorScheme();
  const mutedFg = THEME[colorScheme].mutedForeground;

  const detailQ = useQuery(squadDetailOptions(wsId, id));
  const squad = detailQ.data;

  // Local form state for the "draft" fields (profile). Synced from
  // server data on first load; saved via updateSquad at the bottom.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (squad && !loaded) {
      setName(squad.name);
      setDescription(squad.description);
      setAvatarUrl(squad.avatar_url ?? "");
      setInstructions(squad.instructions);
      setLeaderId(squad.leader_id);
      setLoaded(true);
    }
  }, [squad, loaded]);

  // Membership roster — mutated live (no save button).
  const membersQ = useQuery(squadMembersOptions(wsId, id));
  const addMember = useAddSquadMember(id);
  const removeMember = useRemoveSquadMember(id);
  const updateSquad = useUpdateSquad(id);

  // Workspace-wide agent + member lists for the leader / add-picker.
  const agentsQ = useQuery(agentListOptions(wsId));
  const membersQ_workspace = useQuery(memberListOptions(wsId));

  const agents = useMemo(
    () => (agentsQ.data ?? []).filter((a) => !a.archived_at),
    [agentsQ.data],
  );
  const workspaceMembers = membersQ_workspace.data ?? [];

  const [agentPickerOpen, setAgentPickerOpen] = useState(false);
  const [humanPickerOpen, setHumanPickerOpen] = useState(false);

  const leaderAgent = agents.find((a) => a.id === leaderId);

  const handleLeaderChange = (newLeaderId: string) => {
    setLeaderId(newLeaderId);
    // Persist immediately — leader is a single-field change with no
    // draft state. Rollback would require re-fetching, so we surface
    // errors inline.
    updateSquad.mutate(
      { leader_id: newLeaderId },
      {
        onError: (e) => {
          Alert.alert(
            t.squadEdit.saveError,
            e instanceof Error ? e.message : undefined,
          );
        },
      },
    );
  };

  const handleAddAgent = async (agent: Agent) => {
    try {
      await addMember.mutateAsync({
        member_type: "agent",
        member_id: agent.id,
      });
    } catch (e) {
      Alert.alert(
        t.squadEdit.addMemberFailed,
        e instanceof Error ? e.message : undefined,
      );
    }
  };

  const handleAddHuman = async (member: MemberWithUser) => {
    try {
      await addMember.mutateAsync({
        member_type: "member",
        member_id: member.user_id,
      });
    } catch (e) {
      Alert.alert(
        t.squadEdit.addMemberFailed,
        e instanceof Error ? e.message : undefined,
      );
    }
  };

  const handleRemoveMember = (member: SquadMember) => {
    Alert.alert(
      t.squadEdit.removeMember,
      undefined,
      [
        {
          text: t.squadEdit.removeMember,
          style: "destructive" as const,
          onPress: async () => {
            try {
              await removeMember.mutateAsync({
                member_type: member.member_type,
                member_id: member.member_id,
              });
            } catch (e) {
              Alert.alert(
                t.squadEdit.removeMemberFailed,
                e instanceof Error ? e.message : undefined,
              );
            }
          },
        },
        { text: t.common.cancel, style: "cancel" as const },
      ],
    );
  };

  const handleSave = async () => {
    if (!squad) return;
    const patch: Record<string, unknown> = {};
    if (name !== squad.name) patch.name = name;
    if (description !== squad.description) patch.description = description;
    if (avatarUrl !== (squad.avatar_url ?? "")) patch.avatar_url = avatarUrl;
    if (instructions !== squad.instructions) patch.instructions = instructions;
    if (leaderId !== squad.leader_id) patch.leader_id = leaderId;
    if (Object.keys(patch).length === 0) return;
    try {
      await updateSquad.mutateAsync(patch as never);
      Alert.alert("", t.squadEdit.saveSuccess, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        t.squadEdit.saveError,
        e instanceof Error ? e.message : undefined,
      );
    }
  };

  const saving = updateSquad.isPending;

  if (detailQ.isLoading && !squad) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!squad || squad.id === "") {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-muted-foreground text-center">
          {t.squadEdit.squadNotFound}
        </Text>
      </View>
    );
  }

  const currentMembers = membersQ.data ?? [];
  const memberKeys = new Set(
    currentMembers.map((m) => `${m.member_type}:${m.member_id}`),
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 py-4 gap-6"
      keyboardShouldPersistTaps="handled"
    >
      {/* Section 1: Profile */}
      <SectionGroup title={t.squadEdit.profile}>
        <FieldRow label={t.squadEdit.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t.squadEdit.namePlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            maxLength={100}
          />
        </FieldRow>
        <Separator />
        <FieldRow label={t.squadEdit.description}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t.squadEdit.descriptionPlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            maxLength={255}
            multiline
            numberOfLines={2}
          />
        </FieldRow>
        <Separator />
        <FieldRow label={t.squadEdit.avatarUrl}>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder={t.squadEdit.avatarUrlPlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </FieldRow>
        <Separator />
        <View className="px-4 py-3 gap-2">
          <Text className="text-sm font-medium text-foreground">
            {t.squadEdit.instructions}
          </Text>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder={t.squadEdit.instructionsPlaceholder}
            placeholderTextColor={mutedFg}
            className="text-base text-foreground min-h-[120px] rounded-md border border-border bg-background px-3 py-2"
            multiline
            textAlignVertical="top"
          />
        </View>
      </SectionGroup>

      {/* Section 2: Leader */}
      <SectionGroup title={t.squadEdit.leader}>
        <Pressable
          onPress={() => showLeaderPicker(agents, handleLeaderChange, t)}
          className="flex-row items-center px-4 py-3.5 active:bg-secondary gap-3"
        >
          <Avatar alt={leaderAgent?.name ?? "?"} className="size-8">
            {leaderAgent?.avatar_url ? (
              <AvatarImage source={{ uri: leaderAgent.avatar_url }} />
            ) : null}
            <AvatarFallback>
              <Text className="text-xs font-semibold text-muted-foreground">
                {(leaderAgent?.name ?? "?").charAt(0).toUpperCase()}
              </Text>
            </AvatarFallback>
          </Avatar>
          <Text className="text-base font-medium text-foreground flex-1" numberOfLines={1}>
            {leaderAgent?.name ?? t.squadEdit.noLeaderSelected}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={mutedFg} />
        </Pressable>
      </SectionGroup>

      {/* Section 3: Members */}
      <SectionGroup title={t.squadEdit.members}>
        {membersQ.isLoading ? (
          <View className="py-4 items-center">
            <ActivityIndicator />
          </View>
        ) : currentMembers.length === 0 ? (
          <View className="px-4 py-3.5">
            <Text className="text-sm text-muted-foreground">
              {t.squadEdit.noMembers}
            </Text>
          </View>
        ) : (
          currentMembers.map((member, idx) => (
            <View key={member.id}>
              <MemberRow
                member={member}
                isLeader={member.member_id === squad.leader_id}
                agent={agents.find((a) => a.id === member.member_id)}
                human={workspaceMembers.find((m) => m.user_id === member.member_id)}
                mutedFg={mutedFg}
                onRemove={() => handleRemoveMember(member)}
              />
              {idx < currentMembers.length - 1 ? <Separator /> : null}
            </View>
          ))
        )}
        <Separator />
        <View className="flex-row gap-2 p-3">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => setAgentPickerOpen(true)}
            disabled={addMember.isPending}
          >
            <Text className="text-sm">{t.squadEdit.addAgent}</Text>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => setHumanPickerOpen(true)}
            disabled={addMember.isPending}
          >
            <Text className="text-sm">{t.squadEdit.addHuman}</Text>
          </Button>
        </View>
      </SectionGroup>

      {/* Save button */}
      <View className="pt-2">
        <Button onPress={handleSave} disabled={saving}>
          <Text>{saving ? t.squadEdit.saving : t.squadEdit.save}</Text>
        </Button>
      </View>

      {/* Agent picker modal */}
      <PickerModal
        visible={agentPickerOpen}
        title={t.squadEdit.addAgent}
        items={agents.filter((a) => !memberKeys.has(`agent:${a.id}`))}
        loading={agentsQ.isLoading}
        emptyText={t.squadEdit.noAgentsAvailable}
        searchPlaceholder={t.squadEdit.agentSearchPlaceholder}
        searchKey={(a) => `${a.name} ${a.description}`.toLowerCase()}
        renderItem={(agent) => (
          <AgentPickerRow
            agent={agent}
            mutedFg={mutedFg}
            onPress={() => {
              handleAddAgent(agent);
              setAgentPickerOpen(false);
            }}
          />
        )}
        keyOf={(a) => a.id}
        onClose={() => setAgentPickerOpen(false)}
        mutedFg={mutedFg}
      />

      {/* Human member picker modal */}
      <PickerModal
        visible={humanPickerOpen}
        title={t.squadEdit.addHuman}
        items={workspaceMembers.filter((m) => !memberKeys.has(`member:${m.user_id}`))}
        loading={membersQ_workspace.isLoading}
        emptyText={t.squadEdit.noMembersAvailable}
        searchPlaceholder={t.squadEdit.memberSearchPlaceholder}
        searchKey={(m) => `${m.name} ${m.email}`.toLowerCase()}
        renderItem={(member) => (
          <HumanPickerRow
            member={member}
            mutedFg={mutedFg}
            onPress={() => {
              handleAddHuman(member);
              setHumanPickerOpen(false);
            }}
          />
        )}
        keyOf={(m) => m.id}
        onClose={() => setHumanPickerOpen(false)}
        mutedFg={mutedFg}
      />
    </ScrollView>
  );
}

// --- Generic picker modal (used for both agent + human pickers) ---

function PickerModal<T>({
  visible,
  title,
  items,
  loading,
  emptyText,
  searchPlaceholder,
  searchKey,
  renderItem,
  keyOf,
  onClose,
  mutedFg,
}: {
  visible: boolean;
  title: string;
  items: T[];
  loading: boolean;
  emptyText: string;
  searchPlaceholder: string;
  searchKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  keyOf: (item: T) => string;
  onClose: () => void;
  mutedFg: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i) => searchKey(i).includes(q));
  }, [items, search, searchKey]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40" />
      <View className="flex-1" />
      <View className="bg-background rounded-t-2xl max-h-[70%] flex flex-col">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
          <Pressable onPress={onClose} className="size-8 items-center justify-center">
            <Ionicons name="close" size={20} color={mutedFg} />
          </Pressable>
        </View>
        <Separator />
        <View className="px-4 py-2">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            placeholderTextColor={mutedFg}
            className="text-base text-foreground rounded-md border border-border bg-background px-3 py-2"
            clearButtonMode="while-editing"
          />
        </View>
        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator />
          </View>
        ) : filtered.length === 0 ? (
          <View className="px-4 py-6 items-center">
            <Text className="text-sm text-muted-foreground">{emptyText}</Text>
          </View>
        ) : (
          <ScrollView className="flex-1" style={{ maxHeight: 320 }}>
            {filtered.map((item) => renderItem(item))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function AgentPickerRow({
  agent,
  mutedFg,
  onPress,
}: {
  agent: Agent;
  mutedFg: string;
  onPress: () => void;
}) {
  const initial = agent.name.charAt(0).toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:bg-secondary gap-3"
    >
      <Avatar alt={agent.name} className="size-9">
        {agent.avatar_url ? (
          <AvatarImage source={{ uri: agent.avatar_url }} />
        ) : null}
        <AvatarFallback>
          <Text className="text-sm font-semibold text-muted-foreground">{initial}</Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1 min-w-0">
        <Text className="text-base text-foreground" numberOfLines={1}>
          {agent.name}
        </Text>
        {agent.description ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {agent.description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="add-circle-outline" size={20} color={mutedFg} />
    </Pressable>
  );
}

function HumanPickerRow({
  member,
  mutedFg,
  onPress,
}: {
  member: MemberWithUser;
  mutedFg: string;
  onPress: () => void;
}) {
  const initial = member.name.charAt(0).toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:bg-secondary gap-3"
    >
      <Avatar alt={member.name} className="size-9">
        {member.avatar_url ? (
          <AvatarImage source={{ uri: member.avatar_url }} />
        ) : null}
        <AvatarFallback>
          <Text className="text-sm font-semibold text-muted-foreground">{initial}</Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1 min-w-0">
        <Text className="text-base text-foreground" numberOfLines={1}>
          {member.name}
        </Text>
        {member.email ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {member.email}
          </Text>
        ) : null}
      </View>
      <Ionicons name="add-circle-outline" size={20} color={mutedFg} />
    </Pressable>
  );
}

function MemberRow({
  member,
  isLeader,
  agent,
  human,
  mutedFg,
  onRemove,
}: {
  member: SquadMember;
  isLeader: boolean;
  agent: Agent | undefined;
  human: MemberWithUser | undefined;
  mutedFg: string;
  onRemove: () => void;
}) {
  const t = useT();
  const displayName = isLeader
    ? (agent?.name ?? human?.name ?? member.member_id.slice(0, 8))
    : (agent?.name ?? human?.name ?? member.member_id.slice(0, 8));
  const avatarUrl = agent?.avatar_url ?? human?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();
  const subtitle = agent ? undefined : human?.email;

  return (
    <Pressable
      onPress={onRemove}
      className="flex-row items-center px-4 py-3 active:bg-secondary gap-3"
    >
      <Avatar alt={displayName} className="size-9">
        {avatarUrl ? (
          <AvatarImage source={{ uri: avatarUrl }} />
        ) : null}
        <AvatarFallback>
          <Text className="text-sm font-semibold text-muted-foreground">{initial}</Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-2">
          <Text className="text-base text-foreground" numberOfLines={1}>
            {displayName}
          </Text>
          {isLeader ? (
            <View className="rounded-full bg-primary px-2 py-0.5">
              <Text className="text-xs text-primary-foreground">
                {t.squadEdit.roleLeader}
              </Text>
            </View>
          ) : (
            <View className="rounded-full bg-secondary px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">
                {t.squadEdit.roleMember}
              </Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="trash-outline" size={18} color={mutedFg} />
    </Pressable>
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
    Alert.alert("", t.squadEdit.noAgents);
    return;
  }
  const buttons = agents.map((a) => ({
    text: a.name,
    onPress: () => onChange(a.id),
  }));
  Alert.alert(t.squadEdit.pickLeader, undefined, [
    ...buttons,
    { text: t.common.cancel, style: "cancel" as const },
  ]);
}
