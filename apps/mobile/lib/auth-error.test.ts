import { describe, expect, it } from "vitest";
import { mapAuthError } from "./auth-error";

/** Minimal ApiError-like shape — the real class lives in data/api.ts. */
function apiError(status: number, message: string): Error {
  return Object.assign(new Error(message), { status });
}

describe("mapAuthError", () => {
  it("maps known invalid-code shapes to friendly copy", () => {
    expect(mapAuthError(apiError(400, "invalid or expired code"), "fb")).toBe(
      "验证码不匹配。请检查后重试。",
    );
  });

  it("maps expired codes", () => {
    expect(mapAuthError(apiError(400, "code has expired"), "fb")).toBe(
      "验证码已过期。点击重发获取新码。",
    );
  });

  it("maps rate-limit / throttle to a wait message", () => {
    expect(mapAuthError(apiError(429, "please wait before requesting another code"), "fb")).toBe(
      "尝试次数过多。请稍候再试。",
    );
  });

  it("maps 401 to a session-expired message", () => {
    expect(mapAuthError(apiError(401, "unauthorized"), "fb")).toBe(
      "会话已过期。请重新登录。",
    );
  });

  it("surfaces the concrete server message + status for unrecognised errors", () => {
    expect(mapAuthError(apiError(500, "failed to send verification code"), "fb")).toBe(
      "Something went wrong (500): failed to send verification code",
    );
  });

  it("returns the fallback for non-Error input", () => {
    expect(mapAuthError("nope", "fb")).toBe("fb");
  });

  it("returns the error message for a plain Error (no status)", () => {
    expect(mapAuthError(new Error("boom"), "fb")).toBe("boom");
  });
});
