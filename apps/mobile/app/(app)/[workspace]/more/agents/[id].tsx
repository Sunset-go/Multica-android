/**
 * Agent edit page — full config editor mirroring the web/desktop surface.
 *
 * Five SectionGroups (ScrollView, same pattern as more/settings.tsx):
 *   1. Profile — name, description, avatar_url, instructions
 *   2. Runtime Config — runtime/model/thinking_level/service_tier pickers
 *      (cascading: runtime switch clears model/thinking/tier; model switch
 *      clears thinking/tier) + max_concurrent_tasks stepper
 *   3. Permissions — editable scope picker (private / workspace / specific
 *      members) with a member checkbox modal; owner-only gate preserved
 *   4. Skills — searchable checkbox list; saved via setAgentSkills
 *   5. Environment Variables — key/value editor; owner/admin gated
 *
 * Save flow: updateAgent (base fields) → setAgentSkills (skill_ids) →
 * updateAgentEnv (custom_env). Serial; aborts on first error.
 *
 * System agents (system_key present): instructions field is read-only with
 * a note "System agent instructions cannot be modified".
 */
import { useMemo, useState, useEffect } from "react";
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
  AgentPermissionMode,
  MemberWithUser,
  RuntimeDevice,
  RuntimeModel,
} from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n/use-translation";
import { useWorkspaceStore } from "@/data/workspace-store";
import { useAuthStore } from "@/data/auth-store";
import { THEME } from "@/lib/theme";
import { useColorScheme } from "@/lib/use-color-scheme";
import { agentDetailOptions, agentSkillsOptions, agentEnvOptions, workspaceSkillsOptions } from "@/data/queries/agents";
import { runtimeListOptions, runtimeModelsOptions } from "@/data/queries/runtimes";
import { memberListOptions } from "@/data/queries/members";
import { useUpdateAgent, useUpdateAgentEnv, useSetAgentSkills } from "@/data/mutations/agents";
import { cn } from "@/lib/utils";

export default function AgentEditPage() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { colorScheme } = useColorScheme();
  const mutedFg = THEME[colorScheme].mutedForeground;

  const detailQ = useQuery(agentDetailOptions(wsId, id));
  const agent = detailQ.data;

  // Local form state — synced from server data when it arrives.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxConcurrentTasks, setMaxConcurrentTasks] = useState(1);
  const [runtimeId, setRuntimeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [thinkingLevel, setThinkingLevel] = useState("");
  const [serviceTier, setServiceTier] = useState("");
  const [skillIds, setSkillIds] = useState<Set<string>>(new Set());
  const [envMap, setEnvMap] = useState<Record<string, string>>({});
  // Permission scope — "private" = owner only, "public_to" = shared.
  // When "public_to" + selectedMemberIds empty → workspace-wide (no restriction).
  // When "public_to" + selectedMemberIds non-empty → specific members.
  const [permissionMode, setPermissionMode] = useState<AgentPermissionMode>("private");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (agent && !loaded) {
      setName(agent.name);
      setDescription(agent.description);
      setAvatarUrl(agent.avatar_url ?? "");
      setInstructions(agent.instructions);
      setMaxConcurrentTasks(agent.max_concurrent_tasks);
      setRuntimeId(agent.runtime_id);
      setModelId(agent.model);
      setThinkingLevel(agent.thinking_level ?? "");
      setServiceTier(agent.service_tier ?? "");
      // Initialize permission state from agent data
      setPermissionMode(agent.permission_mode);
      if (agent.permission_mode === "public_to") {
        const memberTargets = (agent.invocation_targets ?? []).filter(
          (t) => t.target_type === "member",
        );
        setSelectedMemberIds(new Set(memberTargets.map((t) => t.target_id!)));
      } else {
        setSelectedMemberIds(new Set());
      }
      setLoaded(true);
    }
  }, [agent, loaded]);

  // Skills — sync from agent's skill list
  const skillsQ = useQuery(agentSkillsOptions(wsId, id));
  useEffect(() => {
    if (skillsQ.data) {
      setSkillIds(new Set(skillsQ.data.map((s) => s.id)));
    }
  }, [skillsQ.data]);

  // Env — owner/admin gated; 403 for non-owners is expected
  const envQ = useQuery(agentEnvOptions(wsId, id));
  const envHidden = envQ.isError;
  useEffect(() => {
    if (envQ.data) {
      setEnvMap({ ...envQ.data.custom_env });
    }
  }, [envQ.data]);

  // Runtime list + model discovery for cascading picker
  const runtimesQ = useQuery(runtimeListOptions(wsId));
  const modelsQ = useQuery(runtimeModelsOptions(runtimeId || null));

  // Members for the permission scope picker
  const membersQ = useQuery(memberListOptions(wsId));
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const updateAgent = useUpdateAgent(id);
  const updateEnv = useUpdateAgentEnv(id);
  const setSkills = useSetAgentSkills(id);

  const isSystemAgent = !!agent?.system_key;

  // Cascading picker helpers
  const runtimes = runtimesQ.data ?? [];
  const models: RuntimeModel[] = modelsQ.data?.models ?? [];
  const selectedModel = models.find((m) => m.id === modelId);
  const thinkingLevels = selectedModel?.thinking?.supported_levels ?? [];
  const serviceTiers = selectedModel?.service_tiers ?? [];

  // When runtime changes, clear model/thinking/tier
  const onRuntimeChange = (newRuntimeId: string) => {
    setRuntimeId(newRuntimeId);
    setModelId("");
    setThinkingLevel("");
    setServiceTier("");
  };
  // When model changes, clear thinking/tier
  const onModelChange = (newModelId: string) => {
    setModelId(newModelId);
    setThinkingLevel("");
    setServiceTier("");
  };

  // Permission scope helpers
  const isAgentOwner = agent ? agent.owner_id === currentUserId : false;
  const canEditPermissions = !isSystemAgent && isAgentOwner;

  // Display label for the current permission scope
  const permissionScopeLabel = (() => {
    if (permissionMode === "private") return t.agentEdit.scopePrivate;
    if (selectedMemberIds.size === 0) return t.agentEdit.scopeWorkspace;
    return `${t.agentEdit.scopeMembers} (${selectedMemberIds.size})`;
  })();

  const onPermissionModeChange = (mode: AgentPermissionMode) => {
    setPermissionMode(mode);
    if (mode === "private") {
      setSelectedMemberIds(new Set());
    } else if (mode === "public_to") {
      // "public_to" with no members selected = workspace-wide
      // Keep existing selectedMemberIds if any, otherwise empty = workspace
    }
  };

  const openMemberPicker = () => {
    setPermissionMode("public_to");
    setMemberPickerOpen(true);
  };

  const handlePermissionPicker = () => {
    if (!canEditPermissions) return;
    Alert.alert(t.agentEdit.selectPermissionScope, undefined, [
      { text: t.agentEdit.scopePrivate, onPress: () => onPermissionModeChange("private") },
      { text: t.agentEdit.scopeWorkspace, onPress: () => { onPermissionModeChange("public_to"); setSelectedMemberIds(new Set()); } },
      { text: t.agentEdit.scopeMembers, onPress: openMemberPicker },
      { text: t.common.cancel, style: "cancel" as const },
    ]);
  };

  const handleSave = async () => {
    if (!agent) return;
    let step = "updateAgent";
    try {
      // 1. Base fields — diff against original
      const patch: Record<string, unknown> = {};
      if (name !== agent.name) patch.name = name;
      if (description !== agent.description) patch.description = description;
      if (avatarUrl !== (agent.avatar_url ?? "")) patch.avatar_url = avatarUrl;
      if (!isSystemAgent && instructions !== agent.instructions) {
        patch.instructions = instructions;
      }
      if (maxConcurrentTasks !== agent.max_concurrent_tasks) {
        patch.max_concurrent_tasks = maxConcurrentTasks;
      }
      if (runtimeId !== agent.runtime_id) patch.runtime_id = runtimeId;
      if (modelId !== agent.model) patch.model = modelId;
      if (thinkingLevel !== (agent.thinking_level ?? "")) {
        patch.thinking_level = thinkingLevel;
      }
      if (serviceTier !== (agent.service_tier ?? "")) {
        patch.service_tier = serviceTier;
      }
      // Permission scope — diff against original
      const origTargets = agent.invocation_targets ?? [];
      const origMemberIds = new Set(
        origTargets.filter((t) => t.target_type === "member").map((t) => t.target_id!),
      );
      const permissionChanged =
        permissionMode !== agent.permission_mode ||
        (permissionMode === "public_to" &&
          selectedMemberIds.size !== origMemberIds.size &&
          [...selectedMemberIds].some((m) => !origMemberIds.has(m)));
      if (permissionChanged && canEditPermissions) {
        patch.permission_mode = permissionMode;
        if (permissionMode === "private") {
          patch.invocation_targets = [];
        } else if (selectedMemberIds.size === 0) {
          patch.invocation_targets = [{ target_type: "workspace", target_id: null }];
        } else {
          patch.invocation_targets = [...selectedMemberIds].map((mid) => ({
            target_type: "member" as const,
            target_id: mid,
          }));
        }
      }
      if (Object.keys(patch).length > 0) {
        await updateAgent.mutateAsync(patch as never);
      }

      // 2. Skills — diff set
      const originalSkillIds = new Set((skillsQ.data ?? []).map((s) => s.id));
      const skillDiff =
        skillIds.size !== originalSkillIds.size ||
        [...skillIds].some((s) => !originalSkillIds.has(s));
      if (skillDiff) {
        step = "setAgentSkills";
        await setSkills.mutateAsync([...skillIds]);
      }

      // 3. Env — diff map (only if we had read access)
      if (envQ.data) {
        const origEnv = envQ.data.custom_env;
        const envDiff =
          Object.keys(envMap).length !== Object.keys(origEnv).length ||
          Object.entries(envMap).some(
            ([k, v]) => origEnv[k] !== v,
          ) ||
          Object.keys(origEnv).some((k) => !(k in envMap));
        if (envDiff) {
          step = "updateAgentEnv";
          await updateEnv.mutateAsync({ custom_env: envMap });
        }
      }

      Alert.alert("", t.agentEdit.saveSuccess, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(t.agentEdit.saveError, `${step}: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const saving =
    updateAgent.isPending || setSkills.isPending || updateEnv.isPending;

  if (detailQ.isLoading && !agent) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!agent || agent.id === "") {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-muted-foreground text-center">
          {t.agentEdit.agentNotFound}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 py-4 gap-6"
    >
      {/* Section 1: Profile */}
      <SectionGroup title={t.agentEdit.profile}>
        <FieldRow label={t.agentEdit.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t.agentEdit.namePlaceholder}
            maxLength={100}
            className="flex-1 text-base text-foreground text-right"
            placeholderTextColor={mutedFg}
          />
        </FieldRow>
        <Separator />
        <FieldRow label={t.agentEdit.description}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t.agentEdit.descriptionPlaceholder}
            maxLength={255}
            className="flex-1 text-base text-foreground text-right"
            placeholderTextColor={mutedFg}
            multiline
            numberOfLines={2}
          />
        </FieldRow>
        <Separator />
        <FieldRow label={t.agentEdit.avatarUrl}>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder={t.agentEdit.avatarUrlPlaceholder}
            className="flex-1 text-base text-foreground text-right"
            placeholderTextColor={mutedFg}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </FieldRow>
        <Separator />
        <View className="px-4 py-3 gap-2">
          <Text className="text-sm font-medium text-foreground">
            {t.agentEdit.instructions}
          </Text>
          {isSystemAgent ? (
            <Text className="text-xs text-muted-foreground">
              {t.agentEdit.instructionsSystemNote}
            </Text>
          ) : null}
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder={t.agentEdit.instructionsPlaceholder}
            placeholderTextColor={mutedFg}
            className="text-base text-foreground min-h-[120px] rounded-md border border-border bg-background px-3 py-2"
            multiline
            textAlignVertical="top"
            editable={!isSystemAgent}
          />
        </View>
      </SectionGroup>

      {/* Section 2: Runtime Config */}
      <SectionGroup title={t.agentEdit.runtimeConfig}>
        {/* Runtime picker */}
        <PickerRow
          label={t.agentEdit.runtime}
          value={
            runtimes.find((r) => r.id === runtimeId)?.name ||
            t.agentEdit.noRuntimeSelected
          }
          onPress={() => showRuntimePicker(runtimes, onRuntimeChange, t)}
          mutedFg={mutedFg}
        />
        <Separator />
        {/* Model picker — only if a runtime is selected */}
        {runtimeId ? (
          <>
            <PickerRow
              label={t.agentEdit.model}
              value={
                models.find((m) => m.id === modelId)?.label ||
                t.agentEdit.noModelSelected
              }
              onPress={() =>
                showModelPicker(models, onModelChange, modelsQ.isLoading, t)
              }
              mutedFg={mutedFg}
              loading={modelsQ.isLoading}
            />
            <Separator />
          </>
        ) : null}
        {/* Thinking level picker — only if the selected model has levels */}
        {modelId && thinkingLevels.length > 0 ? (
          <>
            <PickerRow
              label={t.agentEdit.thinkingLevel}
              value={
                thinkingLevels.find((l) => l.value === thinkingLevel)?.label ||
                t.agentEdit.noThinkingLevel
              }
              onPress={() =>
                showThinkingPicker(thinkingLevels, setThinkingLevel, t)
              }
              mutedFg={mutedFg}
            />
            <Separator />
          </>
        ) : null}
        {/* Service tier picker — only if the selected model has tiers */}
        {modelId && serviceTiers.length > 0 ? (
          <>
            <PickerRow
              label={t.agentEdit.serviceTier}
              value={
                serviceTiers.find((s) => s.id === serviceTier)?.name ||
                t.agentEdit.noServiceTier
              }
              onPress={() =>
                showServiceTierPicker(serviceTiers, setServiceTier, t)
              }
              mutedFg={mutedFg}
            />
            <Separator />
          </>
        ) : null}
        {/* Max concurrent tasks stepper */}
        <View className="flex-row items-center justify-between px-4 py-3.5">
          <Text className="text-base font-medium text-foreground">
            {t.agentEdit.maxConcurrentTasks}
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() =>
                setMaxConcurrentTasks((n) => Math.max(1, n - 1))
              }
              className="size-8 items-center justify-center rounded-md border border-border"
            >
              <Ionicons name="remove" size={18} color={mutedFg} />
            </Pressable>
            <Text className="text-base font-semibold text-foreground w-6 text-center">
              {maxConcurrentTasks}
            </Text>
            <Pressable
              onPress={() =>
                setMaxConcurrentTasks((n) => Math.min(20, n + 1))
              }
              className="size-8 items-center justify-center rounded-md border border-border"
            >
              <Ionicons name="add" size={18} color={mutedFg} />
            </Pressable>
          </View>
        </View>
      </SectionGroup>

      {/* Section 3: Permissions */}
      <SectionGroup title={t.agentEdit.permissions}>
        {canEditPermissions ? (
          <>
            <PickerRow
              label={t.agentEdit.permissionScope}
              value={permissionScopeLabel}
              onPress={handlePermissionPicker}
              mutedFg={mutedFg}
            />
            <Separator />
            <View className="px-4 py-3">
              <Text className="text-xs text-muted-foreground">
                {permissionMode === "public_to" && selectedMemberIds.size > 0
                  ? t.agentEdit.selectedCount(selectedMemberIds.size)
                  : permissionMode === "public_to"
                    ? t.agentEdit.scopeWorkspace
                    : t.agentEdit.scopePrivate}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View className="px-4 py-3.5 gap-1">
              <Text className="text-base font-medium text-foreground">
                {t.agentEdit.permissionScope}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {agent.permission_mode === "private"
                  ? t.agentEdit.scopePrivate
                  : t.agentEdit.scopeWorkspace}
              </Text>
            </View>
            <Separator />
            <View className="px-4 py-3">
              <Text className="text-xs text-muted-foreground">
                {isSystemAgent
                  ? t.agentEdit.instructionsSystemNote
                  : t.agentEdit.permissionOwnerOnly}
              </Text>
            </View>
          </>
        )}
      </SectionGroup>

      {/* Member picker modal — for specific members mode */}
      <MemberPickerModal
        visible={memberPickerOpen}
        members={membersQ.data ?? []}
        loading={membersQ.isLoading}
        selectedIds={selectedMemberIds}
        onSelect={(ids) => {
          setSelectedMemberIds(ids);
          setPermissionMode("public_to");
        }}
        onClear={() => {
          setSelectedMemberIds(new Set());
          setPermissionMode("public_to");
        }}
        onClose={() => setMemberPickerOpen(false)}
        mutedFg={mutedFg}
        t={t}
      />

      {/* Section 4: Skills */}
      <SkillsSection
        agentId={id}
        wsId={wsId}
        skillIds={skillIds}
        setSkillIds={setSkillIds}
        mutedFg={mutedFg}
        t={t}
      />

      {/* Section 5: Environment Variables */}
      <SectionGroup title={t.agentEdit.envVars}>
        {envHidden ? (
          <View className="px-4 py-3.5">
            <Text className="text-sm text-muted-foreground">
              {t.agentEdit.envHidden}
            </Text>
          </View>
        ) : (
          <EnvEditor envMap={envMap} setEnvMap={setEnvMap} mutedFg={mutedFg} t={t} />
        )}
      </SectionGroup>

      {/* Save button */}
      <View className="pt-2">
        <Button onPress={handleSave} disabled={saving}>
          <Text>{saving ? t.agentEdit.saving : t.agentEdit.save}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

// --- Helper components ---

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

function PickerRow({
  label,
  value,
  onPress,
  mutedFg,
  loading,
}: {
  label: string;
  value: string;
  onPress: () => void;
  mutedFg: string;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:bg-secondary"
    >
      <Text className="text-base font-medium text-foreground flex-1">
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text className="text-sm text-muted-foreground mr-2" numberOfLines={1}>
          {value}
        </Text>
      )}
      <Ionicons name="chevron-forward" size={18} color={mutedFg} />
    </Pressable>
  );
}

// --- Skills section ---

function SkillsSection({
  agentId,
  wsId,
  skillIds,
  setSkillIds,
  mutedFg,
  t,
}: {
  agentId: string;
  wsId: string | null;
  skillIds: Set<string>;
  setSkillIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  mutedFg: string;
  t: ReturnType<typeof useT>;
}) {
  const skillsQ = useQuery(workspaceSkillsOptions(wsId));
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = skillsQ.data ?? [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [skillsQ.data, search]);

  const toggle = (skillId: string) => {
    setSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  return (
    <SectionGroup title={t.agentEdit.skills}>
      <View className="px-4 py-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t.agentEdit.skillsSearchPlaceholder}
          placeholderTextColor={mutedFg}
          className="text-base text-foreground rounded-md border border-border bg-background px-3 py-2"
        />
      </View>
      {skillsQ.isLoading ? (
        <View className="py-4 items-center">
          <ActivityIndicator />
        </View>
      ) : filtered.length === 0 ? (
        <View className="px-4 py-3.5">
          <Text className="text-sm text-muted-foreground">
            {t.agentEdit.noSkills}
          </Text>
        </View>
      ) : (
        filtered.map((skill, idx) => (
          <View key={skill.id}>
            <Pressable
              onPress={() => toggle(skill.id)}
              className="flex-row items-center px-4 py-3.5 active:bg-secondary gap-3"
            >
              <View
                className={cn(
                  "size-5 rounded border-2 items-center justify-center",
                  skillIds.has(skill.id)
                    ? "bg-primary border-primary"
                    : "border-border",
                )}
              >
                {skillIds.has(skill.id) ? (
                  <Ionicons name="checkmark" size={14} color="white" />
                ) : null}
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-base text-foreground" numberOfLines={1}>
                  {skill.name}
                </Text>
                {skill.description ? (
                  <Text
                    className="text-xs text-muted-foreground"
                    numberOfLines={1}
                  >
                    {skill.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
            {idx < filtered.length - 1 ? <Separator /> : null}
          </View>
        ))
      )}
    </SectionGroup>
  );
}

// --- Env editor ---

function EnvEditor({
  envMap,
  setEnvMap,
  mutedFg,
  t,
}: {
  envMap: Record<string, string>;
  setEnvMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mutedFg: string;
  t: ReturnType<typeof useT>;
}) {
  const entries = Object.entries(envMap);

  const updateKey = (oldKey: string, newKey: string) => {
    setEnvMap((prev) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (k === oldKey) next[newKey] = v;
        else next[k] = v;
      }
      return next;
    });
  };

  const updateValue = (key: string, value: string) => {
    setEnvMap((prev) => ({ ...prev, [key]: value }));
  };

  const removeEntry = (key: string) => {
    setEnvMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const addEntry = () => {
    const baseKey = "NEW_VAR";
    let key = baseKey;
    let i = 1;
    while (key in envMap) {
      key = `${baseKey}_${i++}`;
    }
    setEnvMap((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <View className="px-4 py-3 gap-2">
      {entries.length === 0 ? (
        <Text className="text-sm text-muted-foreground py-2">
          {t.agentEdit.noSkillsAssigned}
        </Text>
      ) : null}
      {entries.map(([key, value]) => (
        <View key={key} className="flex-row gap-2 items-center">
          <TextInput
            value={key}
            onChangeText={(newKey) => updateKey(key, newKey)}
            placeholder={t.agentEdit.envKey}
            placeholderTextColor={mutedFg}
            className="flex-1 text-sm text-foreground rounded-md border border-border bg-background px-2 py-1.5"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            value={value}
            onChangeText={(v) => updateValue(key, v)}
            placeholder={t.agentEdit.envValue}
            placeholderTextColor={mutedFg}
            className="flex-1 text-sm text-foreground rounded-md border border-border bg-background px-2 py-1.5"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => removeEntry(key)}
            className="size-8 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={18} color={mutedFg} />
          </Pressable>
        </View>
      ))}
      <Pressable
        onPress={addEntry}
        className="flex-row items-center gap-2 py-2"
      >
        <Ionicons name="add-circle-outline" size={20} color={mutedFg} />
        <Text className="text-sm text-primary">{t.agentEdit.envAdd}</Text>
      </Pressable>
    </View>
  );
}

// --- Inline picker helpers (ActionSheet-style Alert) ---
// Mobile formSheet pickers would be ideal, but for this first iteration
// we use Alert.alert with buttons — simpler and avoids route plumbing.
// The formSheet pattern can be promoted later for better UX.

type T = ReturnType<typeof useT>;

function showRuntimePicker(
  runtimes: RuntimeDevice[],
  onChange: (id: string) => void,
  t: T,
) {
  const buttons = runtimes.map((r) => ({
    text: r.name || r.id,
    onPress: () => onChange(r.id),
  }));
  Alert.alert(t.agentEdit.pickRuntime, undefined, [
    ...buttons,
    { text: t.common.cancel, style: "cancel" as const },
  ]);
}

function showModelPicker(
  models: RuntimeModel[],
  onChange: (id: string) => void,
  loading: boolean,
  t: T,
) {
  if (loading || models.length === 0) {
    Alert.alert("", t.agentEdit.modelsUnavailable);
    return;
  }
  const buttons = models.map((m) => ({
    text: m.label || m.id,
    onPress: () => onChange(m.id),
  }));
  Alert.alert(t.agentEdit.pickModel, undefined, [
    ...buttons,
    { text: t.common.cancel, style: "cancel" as const },
  ]);
}

function showThinkingPicker(
  levels: { value: string; label: string }[],
  onChange: (value: string) => void,
  t: T,
) {
  const buttons = levels.map((l) => ({
    text: l.label,
    onPress: () => onChange(l.value),
  }));
  Alert.alert(t.agentEdit.pickThinkingLevel, undefined, [
    ...buttons,
    { text: t.common.cancel, style: "cancel" as const },
  ]);
}

function showServiceTierPicker(
  tiers: { id: string; name: string }[],
  onChange: (id: string) => void,
  t: T,
) {
  const buttons = tiers.map((s) => ({
    text: s.name,
    onPress: () => onChange(s.id),
  }));
  Alert.alert(t.agentEdit.pickServiceTier, undefined, [
    ...buttons,
    { text: t.common.cancel, style: "cancel" as const },
  ]);
}

// --- Member picker modal — for selecting specific members in permission scope ---

function MemberPickerModal({
  visible,
  members,
  loading,
  selectedIds,
  onSelect,
  onClear,
  onClose,
  mutedFg,
  t,
}: {
  visible: boolean;
  members: MemberWithUser[];
  loading: boolean;
  selectedIds: Set<string>;
  onSelect: (ids: Set<string>) => void;
  onClear: () => void;
  onClose: () => void;
  mutedFg: string;
  t: ReturnType<typeof useT>;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  const toggle = (memberId: string) => {
    const next = new Set(selectedIds);
    if (next.has(memberId)) next.delete(memberId);
    else next.add(memberId);
    onSelect(next);
  };

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
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-base font-semibold text-foreground">
            {t.agentEdit.scopeMembers}
          </Text>
          <Pressable onPress={onClose} className="size-8 items-center justify-center">
            <Ionicons name="close" size={20} color={mutedFg} />
          </Pressable>
        </View>
        <Separator />

        {/* Search */}
        <View className="px-4 py-2">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t.agentEdit.membersSearchPlaceholder}
            placeholderTextColor={mutedFg}
            className="text-base text-foreground rounded-md border border-border bg-background px-3 py-2"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Member list */}
        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator />
          </View>
        ) : filtered.length === 0 ? (
          <View className="px-4 py-6 items-center">
            <Text className="text-sm text-muted-foreground">
              {t.agentEdit.noMembers}
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1" style={{ maxHeight: 320 }}>
            {filtered.map((member, idx) => (
              <View key={member.id}>
                <Pressable
                  onPress={() => toggle(member.id)}
                  className="flex-row items-center px-4 py-3 active:bg-secondary gap-3"
                >
                  <View
                    className={cn(
                      "size-5 rounded border-2 items-center justify-center shrink-0",
                      selectedIds.has(member.id)
                        ? "bg-primary border-primary"
                        : "border-border",
                    )}
                  >
                    {selectedIds.has(member.id) ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : null}
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-base text-foreground" numberOfLines={1}>
                      {member.name}
                    </Text>
                    {member.email ? (
                      <Text
                        className="text-xs text-muted-foreground"
                        numberOfLines={1}
                      >
                        {member.email}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
                {idx < filtered.length - 1 ? <Separator /> : null}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between px-4 py-3 border-t border-border">
          <Pressable
            onPress={onClear}
            className="flex-row items-center gap-1 py-1"
            disabled={selectedIds.size === 0}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={selectedIds.size > 0 ? mutedFg : "#ccc"}
            />
            <Text
              className={
                selectedIds.size > 0
                  ? "text-sm text-muted-foreground"
                  : "text-sm text-muted-foreground opacity-40"
              }
            >
              {t.common.clear}
            </Text>
          </Pressable>
          <Text className="text-sm text-muted-foreground">
            {selectedIds.size > 0
              ? t.agentEdit.selectedCount(selectedIds.size)
              : t.agentEdit.scopeWorkspace}
          </Text>
          <Button onPress={onClose}>
            <Text className="text-sm text-primary">{t.common.confirm}</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
