/**
 * New-agent form — pushed from more/agents (`+` button / empty-state CTA).
 *
 * Six inputs, mirroring the edit page's runtime config section so users
 * don't have to hop to the detail page to tune thinking/model/tier:
 *   - name (required — the only hard client-side validation)
 *   - description
 *   - runtime (optional — unselected = create unbound; the agent shows up
 *     with the "Needs runtime" badge and can be bound later on the edit
 *     page. When unset, model/thinking/tier rows are hidden because they
 *     depend on a runtime's model catalog.)
 *   - model / thinking_level / service_tier (cascading — each row only
 *     shows when its upstream value is set and the model actually exposes
 *     levels / tiers)
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
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { showAlert } from "@/lib/alert";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { Agent, RuntimeModel } from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetPickerModal } from "@/components/ui/sheet-picker-modal";
import { useT } from "@/lib/i18n/use-translation";
import { useWorkspaceStore } from "@/data/workspace-store";
import { runtimeListOptions, runtimeModelsOptions } from "@/data/queries/runtimes";
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
  const [modelId, setModelId] = useState("");
  const [thinkingLevel, setThinkingLevel] = useState("");
  const [serviceTier, setServiceTier] = useState("");
  const [instructions, setInstructions] = useState("");
  // Which cascading runtime-config picker sheet is currently open.
  // Kept as a single enum so only one sheet can be visible at a time.
  const [picker, setPicker] = useState<
    "runtime" | "model" | "thinking" | "tier" | null
  >(null);

  const runtimesQ = useQuery(runtimeListOptions(wsId));
  const runtimes = runtimesQ.data ?? [];
  const modelsQ = useQuery(runtimeModelsOptions(runtimeId || null));
  const models: RuntimeModel[] = modelsQ.data?.models ?? [];
  const selectedModel = models.find((m) => m.id === modelId);
  const thinkingLevels = selectedModel?.thinking?.supported_levels ?? [];
  const serviceTiers = selectedModel?.service_tiers ?? [];
  const create = useCreateAgent();

  // Cascading clear — same rule as the edit page: switching runtime
  // invalidates model/thinking/tier; switching model invalidates
  // thinking/tier. Values that no longer apply are dropped from the
  // request payload via the `|| undefined` guard below.
  const onRuntimeChange = (newRuntimeId: string) => {
    setRuntimeId(newRuntimeId);
    setModelId("");
    setThinkingLevel("");
    setServiceTier("");
  };
  const onModelChange = (newModelId: string) => {
    setModelId(newModelId);
    setThinkingLevel("");
    setServiceTier("");
  };

  const canCreate = name.trim().length > 0 && !create.isPending;

  const handleCreate = () => {
    if (!canCreate) return;
    create.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        // `""` = unbound (Needs-runtime state); see api.createAgent.
        runtime_id: runtimeId,
        // All three cascade off runtime. Omit when empty so the backend
        // falls back to its default model for the selected runtime.
        model: modelId || undefined,
        thinking_level: thinkingLevel || undefined,
        service_tier: serviceTier || undefined,
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
          showAlert({ title: t.agentNew.createFailed, message: err instanceof Error ? err.message : t.common.unknownError }),
      },
    );
  };

  const openRuntimePicker = () => {
    if (runtimesQ.isError) {
      showAlert({ title: t.agentNew.selectRuntime, message: t.agentNew.runtimeLoadFailed, buttons: [
        {
          text: t.common.retry,
          onPress: () => {
            runtimesQ.refetch();
          },
        },
        { text: t.common.cancel, style: "cancel" as const },
      ] });
      return;
    }
    if (runtimesQ.isLoading) {
      showAlert({ title: t.agentNew.selectRuntime, message: t.agentNew.runtimeLoadFailed });
      return;
    }
    if (runtimes.length === 0) {
      showAlert({ title: t.agentNew.selectRuntime, message: t.agentNew.runtimeEmpty });
      return;
    }
    setPicker("runtime");
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

      {/* Section 2: Runtime Config — runtime → model → thinking → tier
          cascades, mirroring the edit page. Only shows when a runtime is
          selected; when unset the row below already hints that model/
          thinking/tier live on the edit page. */}
      <SectionGroup title={t.agentEdit.runtimeConfig}>
        <PickerRow
          label={t.agentNew.runtime}
          value={
            runtimes.find((r) => r.id === runtimeId)?.name ||
            t.agentNew.noRuntimeSelected
          }
          onPress={openRuntimePicker}
          mutedFg={mutedFg}
          loading={runtimesQ.isLoading}
        />
        {runtimeId ? (
          <>
            <Separator />
            <PickerRow
              label={t.agentEdit.model}
              value={
                models.find((m) => m.id === modelId)?.label ||
                t.agentEdit.noModelSelected
              }
              onPress={() => setPicker("model")}
              mutedFg={mutedFg}
              loading={modelsQ.isLoading}
            />
          </>
        ) : null}
        {modelId && thinkingLevels.length > 0 ? (
          <>
            <Separator />
            <PickerRow
              label={t.agentEdit.thinkingLevel}
              value={
                thinkingLevels.find((l) => l.value === thinkingLevel)?.label ||
                t.agentEdit.noThinkingLevel
              }
              onPress={() => setPicker("thinking")}
              mutedFg={mutedFg}
            />
          </>
        ) : null}
        {modelId && serviceTiers.length > 0 ? (
          <>
            <Separator />
            <PickerRow
              label={t.agentEdit.serviceTier}
              value={
                serviceTiers.find((s) => s.id === serviceTier)?.name ||
                t.agentEdit.noServiceTier
              }
              onPress={() => setPicker("tier")}
              mutedFg={mutedFg}
            />
          </>
        ) : null}
        {runtimeId ? null : (
          <>
            <Separator />
            <View className="px-4 py-3">
              <Text className="text-xs text-muted-foreground">
                {t.agentNew.runtimeHint}
              </Text>
            </View>
          </>
        )}
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

      {/* Cascading bottom sheets — same 4-sheet pattern as [id].tsx. */}
      <SheetPickerModal
        visible={picker === "runtime"}
        title={t.agentNew.selectRuntime}
        items={runtimes.map((r) => ({
          id: r.id,
          label: r.name || r.id,
          description: r.provider,
          trailing: (
            <View
              className="size-2 rounded-full"
              style={{
                backgroundColor: r.status === "online" ? "#22c55e" : mutedFg,
                opacity: r.status === "offline" ? 0.4 : 1,
              }}
            />
          ),
        }))}
        selectedId={runtimeId}
        onSelect={onRuntimeChange}
        onClose={() => setPicker(null)}
        loading={runtimesQ.isLoading}
        emptyMessage={t.agentNew.runtimeEmpty}
        searchPlaceholder={t.agentEdit.runtimeSearchPlaceholder}
      />

      <SheetPickerModal
        visible={picker === "model"}
        title={t.agentEdit.pickModel}
        items={models.map((m) => ({
          id: m.id,
          label: m.label || m.id,
          description: m.provider,
        }))}
        selectedId={modelId}
        onSelect={onModelChange}
        onClose={() => setPicker(null)}
        loading={modelsQ.isLoading}
        emptyMessage={t.agentEdit.noOptions}
        searchPlaceholder={t.agentEdit.modelSearchPlaceholder}
      />

      <SheetPickerModal
        visible={picker === "thinking"}
        title={t.agentEdit.pickThinkingLevel}
        items={thinkingLevels.map((l) => ({ id: l.value, label: l.label }))}
        selectedId={thinkingLevel}
        onSelect={setThinkingLevel}
        onClose={() => setPicker(null)}
        emptyMessage={t.agentEdit.noOptions}
      />

      <SheetPickerModal
        visible={picker === "tier"}
        title={t.agentEdit.pickServiceTier}
        items={serviceTiers.map((s) => ({ id: s.id, label: s.name }))}
        selectedId={serviceTier}
        onSelect={setServiceTier}
        onClose={() => setPicker(null)}
        emptyMessage={t.agentEdit.noOptions}
      />
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
      disabled={loading}
      className="flex-row items-center px-4 py-3.5 gap-3 active:bg-secondary"
    >
      <Text className="text-sm font-medium text-foreground flex-1">
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text
          className="text-sm text-muted-foreground mr-1"
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      <Ionicons name="chevron-forward" size={18} color={mutedFg} />
    </Pressable>
  );
}
