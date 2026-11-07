/**
 * Pure list-shaping helpers for the Quick Create (agent-mode) actor picker
 * (`components/issue/pickers/actor-picker-body.tsx`).
 *
 * These mirror the web/desktop gates in
 * `packages/views/issues/components/pickers/assignee-picker.tsx` and
 * `packages/views/editor/extensions/mention-suggestion.tsx`:
 *
 *   - Agents: drop archived, drop non-runtime-bound, drop agents the current
 *     user cannot invoke (the invocation-permission predicate is injected so
 *     this module stays free of a `@multica/core/permissions` runtime import,
 *     whose auth hook chain pulls posthog-js and is not Node-safe for the
 *     mobile vitest lane). The component passes `canAssignAgentToIssue(...)`
 *     from `@multica/core/permissions` — the same runtime import precedent as
 *     `components/issue/mention-suggestion-bar.tsx`.
 *   - Squads: drop archived, drop squads whose leader agent is not runnable
 *     (a squad dispatch resolves to its leader's runtime, so a squad whose
 *     leader is archived / runtime-unbound cannot actually run).
 *
 * Mobile previously listed every agent + squad here, which leaked archived
 * and non-runtime-bound actors and private agents the user could never
 * dispatch to. These helpers close that parity gap.
 */
import type { Agent, Squad } from "@multica/core/types";
import { isAgentRuntimeBound } from "./is-agent-runtime-bound";

/** Invocation-permission predicate injected by the component. */
export type CanAssignAgentFn = (agent: Agent) => boolean;

/**
 * Agent rows shown in the Quick Create actor picker.
 *
 * @param canAssign Invocation check for the current user+role — the caller
 *   wires `canAssignAgentToIssue(agent, { userId, role }).allowed`.
 */
export function filterQuickCreateAgents(
  agents: readonly Agent[],
  canAssign: CanAssignAgentFn,
): Agent[] {
  return agents.filter(
    (a) => !a.archived_at && isAgentRuntimeBound(a) && canAssign(a),
  );
}

/**
 * Squad rows shown in the Quick Create actor picker. A squad is selectable
 * only when its leader has a runnable agent, matching
 * `assignee-picker-body.tsx` / `mention-suggestion-bar.tsx`.
 */
export function filterQuickCreateSquads(
  squads: readonly Squad[],
  runnableAgentIds: ReadonlySet<string>,
): Squad[] {
  return squads.filter(
    (s) => !s.archived_at && runnableAgentIds.has(s.leader_id),
  );
}

/** Set of agent ids that are archived-free AND runtime-bound. */
export function runnableAgentIdSet(agents: readonly Agent[]): Set<string> {
  return new Set(
    agents
      .filter((a) => !a.archived_at && isAgentRuntimeBound(a))
      .map((a) => a.id),
  );
}
