import { queryOptions } from "@tanstack/react-query";
import { api } from "@/data/api";
import type { RuntimeModelsResult } from "@multica/core/types";

// Runtime list — workspace-scoped. Feeds the availability dimension of the
// presence dot via @multica/core/agents/derive-presence (status + last_seen_at).
// Invalidated by daemon:register / sweeper-driven status changes; see
// data/realtime/use-presence-realtime.ts.
export const runtimeListOptions = (wsId: string | null) =>
  queryOptions({
    queryKey: ["runtimes", wsId] as const,
    queryFn: ({ signal }) => api.listRuntimes({ signal }),
    enabled: !!wsId,
  });

// --- Runtime model discovery ---
// Mobile-adapted copy of packages/core/runtimes/models.ts resolveRuntimeModels.
// Polls the daemon's list-models job until it completes or times out, then
// returns the model catalog (each RuntimeModel carries thinking.supported_levels
// and service_tiers — the data for the cascading picker).
const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 30_000;
const LIVE_MODELS_STALE_TIME_MS = 5 * 60_000;
const MODELS_GC_TIME_MS = 30 * 60_000;

export async function resolveRuntimeModels(
  runtimeId: string,
): Promise<RuntimeModelsResult> {
  const initial = await api.initiateListModels(runtimeId);
  const start = Date.now();
  let current = initial;
  while (current.status === "pending" || current.status === "running") {
    if (Date.now() - start > POLL_TIMEOUT_MS) {
      throw new Error("model discovery timed out");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    current = await api.getListModelsResult(runtimeId, initial.id);
  }
  if (current.status !== "completed") {
    throw new Error(
      current.error || `model discovery failed (status: ${current.status})`,
    );
  }
  return {
    models: current.models ?? [],
    supported: current.supported !== false,
    cached: current.cached === true,
    cachedAt: current.cached_at,
  };
}

function staleTimeFor(data: RuntimeModelsResult | undefined): number {
  if (!data) return 0;
  return data.cached ? 0 : LIVE_MODELS_STALE_TIME_MS;
}

export function runtimeModelsOptions(runtimeId: string | null | undefined) {
  return queryOptions({
    queryKey: runtimeId
      ? ["runtimes", "models", runtimeId] as const
      : ["runtimes", "models"] as const,
    queryFn: () => resolveRuntimeModels(runtimeId as string),
    enabled: Boolean(runtimeId),
    staleTime: (query) => staleTimeFor(query.state.data),
    gcTime: MODELS_GC_TIME_MS,
    retry: false,
  });
}
