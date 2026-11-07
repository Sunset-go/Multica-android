/**
 * Draft state for the Quick Create (agent-mode) modal
 * (`app/(app)/[workspace]/quick-create.tsx`).
 *
 * Why a store instead of local useState: the formSheet picker routes
 * (`quick-create-picker/actor.tsx`, `quick-create-picker/priority.tsx`,
 * `quick-create-picker/project.tsx`, `quick-create-picker/due-date.tsx`)
 * are separate Stack screens with no React parent-child relationship to the
 * quick-create modal. They need a cross-screen channel to read the current
 * selection and write the new one back — a small Zustand store is the
 * minimum-viable solution, mirroring `useNewIssueDraftStore`.
 *
 * Agent-mode fields are narrower than the manual form: there is no
 * status / human assignee. The server runs the prompt against an agent (or
 * a squad) and only priority / due_date / project are optional extras.
 *
 * Lifecycle: `reset()` runs when the modal is opened and when it is
 * dismissed, so the next open starts clean. Workspace lifecycle mirrors
 * `useNewIssueDraftStore`: the store is reset on workspace-id change via
 * `useQuickCreateDraftResetOnWorkspaceChange` wired in the workspace
 * `_layout.tsx`.
 */
import { useEffect, useRef } from "react";
import { create } from "zustand";
import type { IssuePriority, Project } from "@multica/core/types";

export type QuickCreateActorType = "agent" | "squad";

export interface QuickCreateActor {
  type: QuickCreateActorType;
  id: string;
  name: string;
}

interface QuickCreateDraftState {
  actor: QuickCreateActor | null;
  priority: IssuePriority;
  dueDate: string | null;
  project: Project | null;
  setActor: (actor: QuickCreateActor | null) => void;
  setPriority: (next: IssuePriority) => void;
  setDueDate: (next: string | null) => void;
  setProject: (next: Project | null) => void;
  reset: () => void;
}

const INITIAL: Pick<
  QuickCreateDraftState,
  "actor" | "priority" | "dueDate" | "project"
> = {
  actor: null,
  priority: "none",
  dueDate: null,
  project: null,
};

export const useQuickCreateDraftStore = create<QuickCreateDraftState>(
  (set) => ({
    ...INITIAL,
    setActor: (actor) => set({ actor }),
    setPriority: (priority) => set({ priority }),
    setDueDate: (dueDate) => set({ dueDate }),
    setProject: (project) => set({ project }),
    reset: () => set({ ...INITIAL }),
  }),
);

/**
 * Clears the quick-create draft store whenever the active workspace id
 * changes. Mounted once from the workspace `_layout.tsx`; relies on the
 * workspace store being the source of truth. The `useRef` gate ensures the
 * first mount is a no-op — we only fire `reset()` when the id actually
 * changes from one value to another, so a fresh app launch that resolves the
 * workspace into a non-null id doesn't pointlessly stomp the already-INITIAL
 * store on every cold start. Mirrors `useNewIssueDraftResetOnWorkspaceChange`.
 */
export function useQuickCreateDraftResetOnWorkspaceChange(
  wsId: string | null,
) {
  const prevRef = useRef(wsId);
  useEffect(() => {
    if (prevRef.current !== wsId) {
      useQuickCreateDraftStore.getState().reset();
      prevRef.current = wsId;
    }
  }, [wsId]);
}
