/**
 * Target-actor picker route for the Quick Create (agent-mode) draft —
 * selects the agent or squad the prompt is dispatched to. See
 * components/issue/pickers/actor-picker-body.tsx.
 */
import { router } from "expo-router";
import { ActorPickerBody } from "@/components/issue/pickers/actor-picker-body";
import { useQuickCreateDraftStore } from "@/data/stores/quick-create-draft-store";

export default function QuickCreateActorPickerRoute() {
  const actor = useQuickCreateDraftStore((s) => s.actor);
  const setActor = useQuickCreateDraftStore((s) => s.setActor);

  return (
    <ActorPickerBody
      value={actor}
      onChange={(next) => {
        setActor(next);
        router.back();
      }}
    />
  );
}
