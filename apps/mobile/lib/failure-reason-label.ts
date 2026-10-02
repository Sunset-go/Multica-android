/**
 * Mirror of `packages/views/agents/components/tabs/task-failure.ts:REASON_LABEL`.
 *
 * Why mirror: mobile cannot import from packages/views per the apps/mobile
 * CLAUDE.md sharing rule. Only the human copy is mobile-owned.
 *
 * Keyed by the raw wire value rather than a closed enum, same as the web map:
 * `failure_reason` is an open string that grows as classifier rules land, and
 * an installed build will meet reasons it predates. Before MUL-5370 this was a
 * `Record<TaskFailureReason, string>` holding only the six pre-MUL-1949 coarse
 * values, so every refined `agent_error.*` the backend has written since
 * missed the lookup and rendered a bare "失败".
 *
 * Divergence from web, deliberate: the web helper falls back to the raw wire
 * value, which is machine-y but searchable — right for an operator reading the
 * execution log. This one backs a chat bubble read by the person who just sent
 * a message, so an unrecognised reason degrades to a plain "失败" instead of
 * leaking an enum string at them.
 */
const LABELS: Record<string, string> = {
  // Platform / scheduler side.
  queued_expired: "队列等待超时",
  runtime_offline: "运行守护进程离线",
  runtime_recovery: "运行守护进程已重启",
  timeout: "任务超时",
  iteration_limit: "达到迭代次数上限",
  agent_blocked: "等待人工输入",
  api_invalid_request: "模型 API 拒绝了请求",
  skill_bundle_unavailable: "无法下载智能体的技能包",

  // Agent process side — provider.
  "agent_error.provider_auth_or_access": "模型供应商认证失败",
  "agent_error.provider_quota_limit": "模型供应商配额已用尽",
  "agent_error.provider_capacity_or_rate_limit": "被供应商限流",
  "agent_error.provider_server_error": "供应商服务器错误",
  "agent_error.provider_network": "访问供应商时网络错误",

  // Agent process side — agent / runner.
  "agent_error.process_failure": "智能体进程崩溃",
  "agent_error.empty_or_unparseable_output": "智能体未返回可用输出",
  "agent_error.agent_timeout": "智能体超时",
  "agent_error.context_overflow": "超出上下文窗口",
  "agent_error.missing_config": "缺少 API 密钥或配置",
  "agent_error.model_not_found_or_unavailable": "模型不可用",
  "agent_error.runtime_version_unsupported": "Runner CLI 版本不受支持",
  "agent_error.runtime_missing_executable": "未安装 Runner CLI",
  "agent_error.unknown": "智能体执行错误",

  // Pre-MUL-1949 coarse values, still present on historical rows.
  agent_error: "智能体执行错误",
  codex_semantic_inactivity: "Codex 语义静默超时",
  manual: "被用户取消",
};

export function failureReasonLabel(reason: string | null | undefined): string {
  if (!reason) return "失败";
  return LABELS[reason] ?? "失败";
}
