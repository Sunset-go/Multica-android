/**
 * Priority picker route for the in-progress Quick Create (agent-mode) draft.
 * See ./actor.tsx.
 */
import { router } from "expo-router";
import { PriorityPickerBody } from "@/components/issue/pickers/priority-picker-body";
import { useQuickCreateDraftStore } from "@/data/stores/quick-create-draft-store";

export default function QuickCreatePriorityPickerRoute() {
  const priority = useQuickCreateDraftStore((s) => s.priority);
  const setPriority = useQuickCreateDraftStore((s) => s.setPriority);

  return (
    <PriorityPickerBody
      value={priority}
      onChange={(next) => {
        setPriority(next);
        router.back();
      }}
    />
  );
}
