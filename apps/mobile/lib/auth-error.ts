/**
 * Map backend auth errors to user-facing strings. Known shapes get friendly
 * copy; anything unrecognised surfaces the CONCRETE server message + HTTP
 * status instead of a generic fallback, so the user (and support) can always
 * see what actually went wrong — e.g. a misconfigured mail service returning
 * "failed to send verification code" is no longer hidden.
 */
export function mapAuthError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  // 401 → treated by the platform as "session expired"; surface it clearly.
  if (isApiError(err) && err.status === 401) {
    return "会话已过期。请重新登录。";
  }

  const msg = err.message.toLowerCase();
  if (/invalid|incorrect|wrong/.test(msg)) {
    return "验证码不匹配。请检查后重试。";
  }
  if (/expired/.test(msg)) {
    return "验证码已过期。点击重发获取新码。";
  }
  if (/rate.?limit|too many|throttle|please wait|before requesting another/.test(msg)) {
    return "尝试次数过多。请稍候再试。";
  }
  if (/network|fetch|timeout|unreachable/.test(msg)) {
    return "无法连接 Multica。请检查网络后重试。";
  }

  // Unrecognised → show the real server message (with its status) so an
  // error is never silently swallowed behind a vague default.
  if (isApiError(err)) {
    return `Something went wrong (${err.status}): ${err.message}`;
  }
  return err.message || fallback;
}

function isApiError(err: Error): err is Error & { status: number } {
  return typeof (err as { status?: unknown }).status === "number";
}
