/**
 * Due-date picker route for the in-progress Quick Create (agent-mode) draft.
 * Same Done / Clear pattern as `new-issue-picker/due-date.tsx` —
 * UIDatePicker doesn't auto-commit, so the route renders a tiny header.
 */
import { useRef } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import {
  DueDatePickerBody,
  type DueDatePickerBodyHandle,
} from "@/components/issue/pickers/due-date-picker-body";
import { useQuickCreateDraftStore } from "@/data/stores/quick-create-draft-store";
import { useT } from "@/lib/i18n/use-translation";

export default function QuickCreateDueDatePickerRoute() {
  const t = useT();
  const dueDate = useQuickCreateDraftStore((s) => s.dueDate);
  const setDueDate = useQuickCreateDraftStore((s) => s.setDueDate);
  const ref = useRef<DueDatePickerBodyHandle>(null);

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-base font-semibold text-foreground">
          {t.issues.dueDate}
        </Text>
        <View className="flex-row items-center gap-1">
          {dueDate ? (
            <Pressable
              onPress={() => {
                setDueDate(null);
                router.back();
              }}
              hitSlop={6}
              className="px-2 py-1 rounded-md active:bg-secondary"
            >
              <Text className="text-sm text-destructive">{t.common.clear}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              const iso = ref.current?.getIso();
              if (iso) setDueDate(iso);
              router.back();
            }}
            hitSlop={6}
            className="px-2 py-1 rounded-md active:bg-secondary"
          >
            <Text className="text-sm font-medium text-primary">{t.common.done}</Text>
          </Pressable>
        </View>
      </View>
      <DueDatePickerBody ref={ref} value={dueDate} />
    </View>
  );
}
