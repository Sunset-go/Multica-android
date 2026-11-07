import { describe, expect, it } from "vitest";
import type { Agent, Squad } from "@multica/core/types";
import {
  filterQuickCreateAgents,
  filterQuickCreateSquads,
  runnableAgentIdSet,
} from "./quick-create-actor-filter";

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    workspace_id: "ws-1",
    name: "Agent 1",
    description: "",
    instructions: "",
    runtime_id: "runtime-1",
    runtime_bound: true,
    runtime_mode: "local",
    runtime_config: {},
    custom_args: [],
    avatar_url: null,
    owner_id: "owner-1",
    visibility: "workspace",
    permission_mode: "public_to",
    invocation_targets: [{ target_type: "workspace", target_id: null }],
    status: "idle",
    max_concurrent_tasks: 1,
    model: "model-x",
    skills: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    archived_at: null,
    archived_by: null,
    ...overrides,
  };
}

function makeSquad(overrides: Partial<Squad> = {}): Squad {
  return {
    id: "squad-1",
    workspace_id: "ws-1",
    name: "Squad 1",
    description: "",
    instructions: "",
    avatar_url: null,
    leader_id: "agent-1",
    creator_id: "owner-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    archived_at: null,
    archived_by: null,
    ...overrides,
  };
}

describe("runnableAgentIdSet", () => {
  it("keeps only archived-free, runtime-bound agents", () => {
    const agents = [
      makeAgent({ id: "a" }),
      makeAgent({ id: "b", archived_at: "2026-01-01T00:00:00Z" }),
      makeAgent({ id: "c", runtime_id: "", runtime_bound: false }),
      makeAgent({ id: "d", runtime_id: "", runtime_bound: undefined }),
    ];
    expect([...runnableAgentIdSet(agents)]).toEqual(["a"]);
  });
});

describe("filterQuickCreateAgents", () => {
  it("drops archived agents", () => {
    const agents = [
      makeAgent({ id: "ok" }),
      makeAgent({ id: "archived", archived_at: "2026-01-01T00:00:00Z" }),
    ];
    const out = filterQuickCreateAgents(agents, () => true);
    expect(out.map((a) => a.id)).toEqual(["ok"]);
  });

  it("drops non-runtime-bound agents", () => {
    const agents = [
      makeAgent({ id: "ok" }),
      makeAgent({ id: "unbound", runtime_id: "", runtime_bound: false }),
      makeAgent({ id: "legacy", runtime_id: "", runtime_bound: undefined }),
    ];
    const out = filterQuickCreateAgents(agents, () => true);
    expect(out.map((a) => a.id)).toEqual(["ok"]);
  });

  it("drops agents the user cannot invoke", () => {
    const agents = [
      makeAgent({ id: "invokable" }),
      makeAgent({ id: "restricted" }),
      makeAgent({ id: "private" }),
    ];
    const canAssign = (a: Agent) => a.id === "invokable";
    const out = filterQuickCreateAgents(agents, canAssign);
    expect(out.map((a) => a.id)).toEqual(["invokable"]);
  });

  it("drops archived even when invokable", () => {
    const agents = [
      makeAgent({ id: "archived", archived_at: "2026-01-01T00:00:00Z" }),
    ];
    const out = filterQuickCreateAgents(agents, () => true);
    expect(out).toEqual([]);
  });
});

describe("filterQuickCreateSquads", () => {
  it("drops archived squads", () => {
    const squads = [
      makeSquad({ id: "ok" }),
      makeSquad({ id: "archived", archived_at: "2026-01-01T00:00:00Z" }),
    ];
    const out = filterQuickCreateSquads(squads, new Set(["agent-1"]));
    expect(out.map((s) => s.id)).toEqual(["ok"]);
  });

  it("drops squads whose leader is not runnable", () => {
    const squads = [
      makeSquad({ id: "ok", leader_id: "agent-1" }),
      makeSquad({ id: "leader-unbound", leader_id: "agent-x" }),
    ];
    const out = filterQuickCreateSquads(squads, new Set(["agent-1"]));
    expect(out.map((s) => s.id)).toEqual(["ok"]);
  });

  it("keeps non-archived squads with a runnable leader", () => {
    const squads = [makeSquad({ id: "ok", leader_id: "agent-1" })];
    const out = filterQuickCreateSquads(squads, new Set(["agent-1"]));
    expect(out.map((s) => s.id)).toEqual(["ok"]);
  });
});
