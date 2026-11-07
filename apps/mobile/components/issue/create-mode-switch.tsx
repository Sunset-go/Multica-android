/**
 * Segmented mode switch at the top of the create-issue forms. Mirrors the PC
 * "create mode" preference (packages/core/issues/stores/create-mode-store.ts)
 * as a plain in-form toggle: "手动" opens the manual new-issue modal,
 * "智能体" opens the agent-mode quick-create modal. Tapping the inactive
 * segment swaps the modal via router.replace, so the switch works from
 * either modal and the user can flip modes without dismissing.
 *
 * State loss across the swap is accepted in v1 (the prompt/title is not
 * carried between modals) — matches the "keep-open/last-actor memory is
 * v1-minimal" scope in the mobile quick-create plan.
 */
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { useWorkspaceStore } from "@/data/workspace-store";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/use-translation";

type Mode = "manual" | "agent";

interface Props {
  /** The mode this form is currently in — rendered as the active segment. */
  current: Mode;
}

export function CreateModeSwitch({ current }: Props) {
  const t = useT();
  const slug = useWorkspaceStore((s) => s.currentWorkspaceSlug);

  const switchTo = (next: Mode) => {
    if (!slug || next === current) return;
    router.replace(`/${slug}/${next === "agent" ? "quick-create" : "new-issue"}`);
  };

  const segment = (mode: Mode, label: string) => {
    const active = current === mode;
    return (
      <Pressable
        onPress={() => switchTo(mode)}
        className={cn(
          "flex-1 items-center rounded-lg py-1.5",
          active && "bg-background",
        )}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        <Text
          className={cn(
            "text-sm font-medium",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-row rounded-xl bg-secondary/60 p-0.5">
      {segment("manual", t.issues.manualMode)}
      {segment("agent", t.issues.agentMode)}
    </View>
  );
}
