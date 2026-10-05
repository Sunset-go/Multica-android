/**
 * Agent queries — workspace-wide list, single-agent detail, assigned skills,
 * and custom env. Mobile-owned; mirrors a subset of packages/core/agents/.
 *
 * Query keys follow the same three-segment pattern as issues:
 * `["agents", wsId, ...]` so WS handlers can invalidate the whole subtree.
 *
 * Env and skills queries set `retry: false` — the server returns 403 for
 * non-owner/non-admin callers, and retrying would spam the network without
 * changing the result.
 */
import { queryOptions } from "@tanstack/react-query";
import { api } from "@/data/api";

export const agentKeys = {
  all: (wsId: string | null) => ["agents", wsId] as const,
  list: (wsId: string | null) => ["agents", wsId, "list"] as const,
  detail: (wsId: string | null, id: string) =>
    ["agents", wsId, "detail", id] as const,
  skills: (wsId: string | null, id: string) =>
    ["agents", wsId, "skills", id] as const,
  env: (wsId: string | null, id: string) =>
    ["agents", wsId, "env", id] as const,
  workspaceSkills: (wsId: string | null) =>
    ["agents", wsId, "workspace-skills"] as const,
};

/** Workspace-wide agent list. Backend filters by X-Workspace-Slug header. */
export const agentListOptions = (wsId: string | null) =>
  queryOptions({
    queryKey: agentKeys.list(wsId),
    queryFn: ({ signal }) => api.listAgents({ signal }),
    enabled: !!wsId,
  });

/** Single-agent detail. refetchOnMount: "always" so the edit page always
 *  catches up to server state after navigation. */
export const agentDetailOptions = (wsId: string | null, id: string) =>
  queryOptions({
    queryKey: agentKeys.detail(wsId, id),
    queryFn: ({ signal }) => api.getAgent(id, { signal }),
    enabled: !!wsId && !!id,
    refetchOnMount: "always",
    placeholderData: (prev) => prev,
  });

/** Skills assigned to an agent (GET /api/agents/{id}/skills). */
export const agentSkillsOptions = (wsId: string | null, id: string) =>
  queryOptions({
    queryKey: agentKeys.skills(wsId, id),
    queryFn: ({ signal }) => api.listAgentSkills(id, { signal }),
    enabled: !!wsId && !!id,
    retry: false,
  });

/** Agent custom env (GET /api/agents/{id}/env). Owner/admin gated — 403
 *  for non-owners, so retry: false prevents retry storms. */
export const agentEnvOptions = (wsId: string | null, id: string) =>
  queryOptions({
    queryKey: agentKeys.env(wsId, id),
    queryFn: ({ signal }) => api.getAgentEnv(id, { signal }),
    enabled: !!wsId && !!id,
    retry: false,
  });

/** All workspace skills for the assignment picker. */
export const workspaceSkillsOptions = (wsId: string | null) =>
  queryOptions({
    queryKey: agentKeys.workspaceSkills(wsId),
    queryFn: ({ signal }) => api.listSkills({ signal }),
    enabled: !!wsId,
  });
