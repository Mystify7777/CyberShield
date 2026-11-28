import { beforeEach, describe, expect, it, vi } from "vitest";

const createResponse = () => ({
  cookie: vi.fn(),
  clearCookie: vi.fn()
});

describe("refresh token cookies", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NODE_ENV;
  });

  it("uses the canonical cookie name and secure production attributes", async () => {
    process.env.NODE_ENV = "production";
    const {
      setRefreshTokenCookie,
      clearRefreshTokenCookie,
      getRefreshTokenFromRequest
    } = await import("../../src/utils/cookies.js");

    const res = createResponse();
    setRefreshTokenCookie(res, "refresh-token-value");

    expect(res.cookie).toHaveBeenCalledWith(
      "cybershield_refresh_token",
      "refresh-token-value",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/api/auth",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
    );

    const req = {
      cookies: {
        cybershield_refresh_token: "refresh-token-value"
      }
    };

    expect(getRefreshTokenFromRequest(req)).toBe("refresh-token-value");

    clearRefreshTokenCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      "cybershield_refresh_token",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/api/auth"
      })
    );
  });

  it("uses lax same-site cookies for local development", async () => {
    process.env.NODE_ENV = "development";
    const { setRefreshTokenCookie } = await import("../../src/utils/cookies.js");

    const res = createResponse();
    setRefreshTokenCookie(res, "refresh-token-value");

    expect(res.cookie).toHaveBeenCalledWith(
      "cybershield_refresh_token",
      "refresh-token-value",
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/api/auth"
      })
    );
  });
});
