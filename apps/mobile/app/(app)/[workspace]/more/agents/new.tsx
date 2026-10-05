/**
 * New-agent form — pushed from more/agents (`+` button / empty-state CTA).
 *
 * Four inputs, deliberately minimal (PC's agent-builder flow is the full
 * wizard; this is the quick-create path):
 *   - name (required — the only hard client-side validation)
 *   - description
 *   - runtime (optional — unselected = create unbound; the agent shows up
 *     with the "Needs runtime" badge and can be bound later on the edit
 *     page. Model / thinking / tier use server defaults.)
 *   - instructions (optional)
 *
 * Submit: useCreateAgent writes the returned agent into the detail cache
 * and invalidates the list (see data/mutations/agents.ts), then onSuccess
 * pushes to the new agent's edit page (more/agents/[id]) — the cached
 * detail renders immediately without a spinner.
 */
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n/use-translation";
import { useWorkspaceStore } from "@/data/workspace-store";
import { runtimeListOptions } from "@/data/queries/runtimes";
import { useCreateAgent } from "@/data/mutations/agents";
import { THEME } from "@/lib/theme";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function NewAgentPage() {
  const t = useT();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const slug = useWorkspaceStore((s) => s.currentWorkspaceSlug);
  const { colorScheme } = useColorScheme();
  const mutedFg = THEME[colorScheme].mutedForeground;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [runtimeId, setRuntimeId] = useState("");
  const [instructions, setInstructions] = useState("");

  const runtimesQ = useQuery(runtimeListOptions(wsId));
  const runtimes = runtimesQ.data ?? [];
  const create = useCreateAgent();

  const canCreate = name.trim().length > 0 && !create.isPending;

  const handleCreate = () => {
    if (!canCreate) return;
    create.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        // `""` = unbound (Needs-runtime state); see api.createAgent.
        runtime_id: runtimeId,
        instructions: instructions.trim() || undefined,
      },
      {
        onSuccess: (created: Agent) => {
          // Jump straight to the new agent's edit page (acceptance
          // criterion: "创建成功后自动跳转编辑页"). The detail cache was
          // seeded by the mutation's onSuccess, so it renders instantly.
          if (slug) {
            router.push(`/${slug}/more/agents/${created.id}`);
          } else {
            router.back();
          }
        },
        onError: (err) =>
          Alert.alert(
            t.agentNew.createFailed,
            err instanceof Error ? err.message : t.common.unknownError,
          ),
      },
    );
  };

  const openRuntimePicker = () => {
    if (runtimesQ.isError) {
      Alert.alert(t.agentNew.selectRuntime, t.agentNew.runtimeLoadFailed, [
        {
          text: t.common.retry,
          onPress: () => {
            runtimesQ.refetch();
          },
        },
        { text: t.common.cancel, style: "cancel" as const },
      ]);
      return;
    }
    if (runtimesQ.isLoading) {
      Alert.alert(t.agentNew.selectRuntime, t.agentNew.runtimeLoadFailed);
      return;
    }
    if (runtimes.length === 0) {
      Alert.alert(t.agentNew.selectRuntime, t.agentNew.runtimeEmpty);
      return;
    }
    const buttons = runtimes.map((r) => ({
      text: r.name || r.id,
      onPress: () => setRuntimeId(r.id),
    }));
    Alert.alert(t.agentNew.selectRuntime, undefined, [
      ...buttons,
      { text: t.common.cancel, style: "cancel" as const },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 py-4 gap-6"
      keyboardShouldPersistTaps="handled"
    >
      {/* Section 1: Profile — name (required) + description + instructions */}
      <SectionGroup title={t.agentNew.profile}>
        <FieldRow label={t.agentNew.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t.agentNew.namePlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            maxLength={100}
            autoFocus
          />
        </FieldRow>
        <Separator />
        <FieldRow label={t.agentNew.description}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t.agentNew.descriptionPlaceholder}
            placeholderTextColor={mutedFg}
            className="flex-1 text-base text-foreground text-right"
            maxLength={255}
            multiline
            numberOfLines={2}
          />
        </FieldRow>
        <Separator />
        <View className="px-4 py-3 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium text-foreground">
              {t.agentNew.instructions}
            </Text>
            <View className="rounded-full bg-secondary px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">
                {t.agentNew.optional}
              </Text>
            </View>
          </View>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder={t.agentNew.instructionsPlaceholder}
            placeholderTextColor={mutedFg}
            className="text-base text-foreground min-h-[120px] rounded-md border border-border bg-background px-3 py-2"
            multiline
            textAlignVertical="top"
          />
        </View>
      </SectionGroup>

      {/* Section 2: Runtime — optional; unselected creates an unbound agent */}
      <SectionGroup title={t.agentNew.runtime}>
        <PickerRow
          label={t.agentNew.runtime}
          value={
            runtimes.find((r) => r.id === runtimeId)?.name ||
            t.agentNew.noRuntimeSelected
          }
          selected={runtimeId !== ""}
          onPress={openRuntimePicker}
          mutedFg={mutedFg}
          loading={runtimesQ.isLoading}
        />
        <Separator />
        <View className="px-4 py-3">
          <Text className="text-xs text-muted-foreground">
            {t.agentNew.runtimeHint}
          </Text>
        </View>
      </SectionGroup>

      {/* Submit bar */}
      <View className="flex-row gap-3 pt-2">
        <View className="flex-1">
          <Button
            variant="outline"
            onPress={() => router.back()}
            disabled={create.isPending}
          >
            <Text>{t.common.cancel}</Text>
          </Button>
        </View>
        <View className="flex-1">
          <Button onPress={handleCreate} disabled={!canCreate}>
            <Text>{create.isPending ? t.agentNew.creating : t.agentNew.title}</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

// --- Local presentational helpers (same shape as more/agents/[id].tsx) ---

function SectionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
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
  children: ReactNode;
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
  selected,
  onPress,
  mutedFg,
  loading,
}: {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
  mutedFg: string;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="flex-row items-center justify-between px-4 py-3.5 gap-3"
    >
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text
          className={
            selected
              ? "text-sm text-foreground"
              : "text-sm text-muted-foreground"
          }
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
    </Pressable>
  );
}
