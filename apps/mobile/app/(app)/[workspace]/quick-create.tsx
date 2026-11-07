/**
 * Quick Create (agent-mode) modal — prompt → agent/squad → task.
 *
 * Mirrors the PC quick-create flow (packages/core/issues/stores/create-mode
 * -store.ts / quick-create-store.ts) as a mobile formSheet: the user types a
 * prompt, picks a target agent or squad, optionally sets priority / due date
 * / project, and submits. The server optimises the prompt and creates the
 * issue + agent run in one shot (`POST /api/issues/quick-create`) — the
 * client does NO local prompt-optimisation logic.
 *
 * Layout follows the manual new-issue modal (apps/mobile/CLAUDE.md): one
 * vertical scrolling form, no sticky bottom toolbar. The mode switch sits at
 * the top so the user can flip between manual and agent mode in place.
 *
 * Tracking: the created task surfaces through the inbox (detail-label.tsx
 * already renders quick_create_done / quick_create_failed /
 * quick_create_unconfirmed), so a successful submit dismisses back to the
 * inbox where the notification appears.
 */
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { showAlert } from "@/lib/alert";
import { Stack, router } from "expo-router";
import { SubmitIssueButton } from "@/components/issue/submit-issue-button";
import { CreateModeSwitch } from "@/components/issue/create-mode-switch";
import { QuickCreateAttributeRow } from "@/components/issue/quick-create-attribute-row";
import { MOBILE_PLACEHOLDER_COLOR } from "@/components/ui/input-tokens";
import { useQuickCreateIssue } from "@/data/mutations/issues";
import { useQuickCreateDraftStore } from "@/data/stores/quick-create-draft-store";
import { useT } from "@/lib/i18n/use-translation";

export default function QuickCreateModal() {
  const t = useT();
  const [prompt, setPrompt] = useState("");
  const actor = useQuickCreateDraftStore((s) => s.actor);
  const priority = useQuickCreateDraftStore((s) => s.priority);
  const dueDate = useQuickCreateDraftStore((s) => s.dueDate);
  const project = useQuickCreateDraftStore((s) => s.project);
  const resetDraft = useQuickCreateDraftStore((s) => s.reset);

  useEffect(() => {
    resetDraft();
    return () => {
      resetDraft();
    };
  }, [resetDraft]);

  const quickCreate = useQuickCreateIssue();
  const isSubmitting = quickCreate.isPending;

  // A prompt and a target actor are both required — the server can't
  // optimise an empty prompt, and without an actor there's nothing to run it.
  const canSubmit =
    !isSubmitting && prompt.trim().length > 0 && actor !== null;

  const onSubmit = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0 || !actor) return;
    try {
      await quickCreate.mutateAsync({
        ...(actor.type === "agent"
          ? { agent_id: actor.id }
          : { squad_id: actor.id }),
        prompt: trimmedPrompt,
        priority,
        ...(dueDate ? { due_date: dueDate } : {}),
        ...(project ? { project_id: project.id } : {}),
      });
      router.back();
    } catch (err) {
      showAlert({
        title: t.issues.createFailed,
        message: err instanceof Error ? err.message : t.common.unknownError,
      });
    }
  }, [prompt, actor, priority, dueDate, project, quickCreate, t]);

  const headerRight = useCallback(
    () => (
      <SubmitIssueButton
        disabled={!canSubmit}
        loading={isSubmitting}
        onPress={onSubmit}
      />
    ),
    [canSubmit, isSubmitting, onSubmit],
  );

  return (
    <>
      <Stack.Screen options={{ headerRight }} />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-4 pb-6 gap-4"
          keyboardShouldPersistTaps="handled"
        >
          <CreateModeSwitch current="agent" />
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder={t.issues.promptPlaceholder}
            placeholderTextColor={MOBILE_PLACEHOLDER_COLOR}
            className="text-2xl font-semibold text-foreground py-2"
            autoFocus
            multiline
            textAlignVertical="top"
            editable={!isSubmitting}
          />
          <QuickCreateAttributeRow />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
