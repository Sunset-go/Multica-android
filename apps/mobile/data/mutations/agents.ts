/**
 * Agent mutations — updateAgent, updateAgentEnv, setAgentSkills.
 *
 * Cache strategy mirrors issues/inbox mutations:
 *   - On success: write the returned entity directly into the detail cache
 *     (no refetch needed), then invalidate the list so the row stays fresh.
 *   - On error: the global query error handler surfaces the toast; no
 *     optimistic rollback needed because we don't patch the cache pre-flight.
 *
 * Three-step save in the edit page:
 *   1. updateAgent (base fields: name, description, instructions, avatar, etc.)
 *   2. setAgentSkills (skill_ids wholesale replace)
 *   3. updateAgentEnv (custom_env wholesale replace)
 * Each step calls its own mutation; the edit page aborts on first error.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Agent,
  AgentEnvResponse,
  CreateAgentRequest,
  UpdateAgentEnvRequest,
  UpdateAgentRequest,
} from "@multica/core/types";
import { api } from "@/data/api";
import { agentKeys } from "@/data/queries/agents";
import { useWorkspaceStore } from "@/data/workspace-store";

export function useCreateAgent() {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: CreateAgentRequest) => api.createAgent(data),
    onSuccess: (created: Agent) => {
      // Seed the detail cache so a list → detail hand-off can render
      // immediately; then invalidate the list so the new row shows up
      // without a full refetch.
      qc.setQueryData(agentKeys.detail(wsId, created.id), created);
      qc.invalidateQueries({ queryKey: agentKeys.list(wsId) });
    },
  });
}

export function useUpdateAgent(agentId: string) {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: UpdateAgentRequest) => api.updateAgent(agentId, data),
    onSuccess: (updated: Agent) => {
      // Write the returned agent directly into the detail cache — the
      // server's response is authoritative and already includes all
      // fields the edit page needs.
      qc.setQueryData(agentKeys.detail(wsId, agentId), updated);
      // Invalidate the list so the row's name/description/status stays fresh.
      qc.invalidateQueries({ queryKey: agentKeys.list(wsId) });
    },
  });
}

export function useUpdateAgentEnv(agentId: string) {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: UpdateAgentEnvRequest) =>
      api.updateAgentEnv(agentId, data),
    onSuccess: (updated: AgentEnvResponse) => {
      qc.setQueryData(agentKeys.env(wsId, agentId), updated);
      // Invalidate detail so has_custom_env / custom_env_key_count refresh.
      qc.invalidateQueries({
        queryKey: agentKeys.detail(wsId, agentId),
      });
    },
  });
}

export function useSetAgentSkills(agentId: string) {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (skillIds: string[]) =>
      api.setAgentSkills(agentId, { skill_ids: skillIds }),
    onSuccess: () => {
      // Server returns void — invalidate both the skills list and the
      // agent detail (skills array is embedded in the agent payload).
      qc.invalidateQueries({
        queryKey: agentKeys.skills(wsId, agentId),
      });
      qc.invalidateQueries({
        queryKey: agentKeys.detail(wsId, agentId),
      });
    },
  });
}
