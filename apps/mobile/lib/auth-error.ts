/**
 * Map backend auth errors to user-facing strings. Known shapes get friendly
 * copy; anything unrecognised surfaces the CONCRETE server message + HTTP
 * status instead of a generic fallback, so the user (and support) can always
 * see what actually went wrong — e.g. a misconfigured mail service returning
 * "failed to send verification code" is no longer hidden.
 *
 * Locale-aware via getT().
 */
import { getT } from "@/lib/i18n/use-translation";

export function mapAuthError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const t = getT();

  // 401 → treated by the platform as "session expired"; surface it clearly.
  if (isApiError(err) && err.status === 401) {
    return t.auth.sessionExpired;
  }

  const msg = err.message.toLowerCase();
  if (/invalid|incorrect|wrong/.test(msg)) {
    return t.auth.codeMismatch;
  }
  if (/expired/.test(msg)) {
    return t.auth.codeExpired;
  }
  if (/rate.?limit|too many|throttle|please wait|before requesting another/.test(msg)) {
    return t.auth.tooManyAttempts;
  }
  if (/network|fetch|timeout|unreachable/.test(msg)) {
    return t.auth.connectionError;
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
