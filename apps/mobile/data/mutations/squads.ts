/**
 * Squad mutations — create/update/delete squad + add/remove squad member.
 *
 * Cache strategy mirrors apps/mobile/data/mutations/agents.ts:
 *   - create: seed detail cache then invalidate list
 *   - update: write returned squad into detail cache then invalidate list
 *   - delete: invalidate detail (remove) + list
 *   - add/remove member: invalidate members cache + squad detail
 *     (so member_count / member_preview refresh without a full refetch)
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Squad,
  SquadMember,
  CreateSquadRequest,
  UpdateSquadRequest,
  AddSquadMemberRequest,
  RemoveSquadMemberRequest,
  UpdateSquadMemberRoleRequest,
} from "@multica/core/types";
import { api } from "@/data/api";
import { squadKeys } from "@/data/queries/squads";
import { useWorkspaceStore } from "@/data/workspace-store";

export function useCreateSquad() {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: CreateSquadRequest) => api.createSquad(data),
    onSuccess: (created: Squad) => {
      qc.setQueryData(squadKeys.detail(wsId, created.id), created);
      qc.invalidateQueries({ queryKey: squadKeys.list(wsId) });
    },
  });
}

export function useUpdateSquad(squadId: string) {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: UpdateSquadRequest) => api.updateSquad(squadId, data),
    onSuccess: (updated: Squad) => {
      qc.setQueryData(squadKeys.detail(wsId, squadId), updated);
      qc.invalidateQueries({ queryKey: squadKeys.list(wsId) });
      // Leader change cascades to members (role = leader on the new leader,
      // role = member on the previous leader). Invalidate so the edit page's
      // members section reflects the fresh roster without a full refetch.
      qc.invalidateQueries({
        queryKey: squadKeys.members(wsId, squadId),
      });
    },
  });
}

export function useDeleteSquad() {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (id: string) => api.deleteSquad(id),
    onSuccess: (_void, id) => {
      qc.removeQueries({ queryKey: squadKeys.detail(wsId, id) });
      qc.removeQueries({ queryKey: squadKeys.members(wsId, id) });
      qc.invalidateQueries({ queryKey: squadKeys.list(wsId) });
    },
  });
}

export function useAddSquadMember(squadId: string) {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: AddSquadMemberRequest) =>
      api.addSquadMember(squadId, data),
    onSuccess: (_member: SquadMember) => {
      qc.invalidateQueries({
        queryKey: squadKeys.members(wsId, squadId),
      });
      qc.invalidateQueries({
        queryKey: squadKeys.detail(wsId, squadId),
      });
    },
  });
}

export function useRemoveSquadMember(squadId: string) {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: RemoveSquadMemberRequest) =>
      api.removeSquadMember(squadId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: squadKeys.members(wsId, squadId),
      });
      qc.invalidateQueries({
        queryKey: squadKeys.detail(wsId, squadId),
      });
    },
  });
}

export function useUpdateSquadMemberRole(squadId: string) {
  const qc = useQueryClient();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (data: UpdateSquadMemberRoleRequest) =>
      api.updateSquadMemberRole(squadId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: squadKeys.members(wsId, squadId),
      });
      qc.invalidateQueries({
        queryKey: squadKeys.detail(wsId, squadId),
      });
    },
  });
}
