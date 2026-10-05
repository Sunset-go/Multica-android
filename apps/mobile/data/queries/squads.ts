/**
 * Squad queries — mirrors apps/mobile/data/queries/agents.ts key shape so
 * WS handlers can invalidate the whole subtree by prefix. Three-segment
 * shape: ["squads", wsId, "list"|"detail"|..."detail", id, "members"].
 *
 * Retry policy: retry: false on member list / status so a 404 on a just-
 * deleted squad doesn't spam the network.
 */
import { queryOptions } from "@tanstack/react-query";
import { api } from "@/data/api";

export const squadKeys = {
  all: (wsId: string | null) => ["squads", wsId] as const,
  list: (wsId: string | null) => ["squads", wsId, "list"] as const,
  detail: (wsId: string | null, id: string) =>
    ["squads", wsId, "detail", id] as const,
  members: (wsId: string | null, id: string) =>
    ["squads", wsId, "detail", id, "members"] as const,
};

/** Workspace-wide squad list. Backend filters by X-Workspace-Slug header. */
export const squadListOptions = (wsId: string | null) =>
  queryOptions({
    queryKey: squadKeys.list(wsId),
    queryFn: ({ signal }) => api.listSquads({ signal }),
    enabled: !!wsId,
  });

/** Single-squad detail. refetchOnMount: "always" so the edit page always
 *  catches up to server state after navigation. */
export const squadDetailOptions = (wsId: string | null, id: string) =>
  queryOptions({
    queryKey: squadKeys.detail(wsId, id),
    queryFn: ({ signal }) => api.getSquad(id, { signal }),
    enabled: !!wsId && !!id,
    refetchOnMount: "always",
    placeholderData: (prev) => prev,
  });

/** Squad membership roster — used by the edit page's Members section. */
export const squadMembersOptions = (wsId: string | null, id: string) =>
  queryOptions({
    queryKey: squadKeys.members(wsId, id),
    queryFn: ({ signal }) => api.listSquadMembers(id, { signal }),
    enabled: !!wsId && !!id,
    retry: false,
  });
