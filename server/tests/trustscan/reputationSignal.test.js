import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  normalizeTarget: vi.fn()
}));

vi.mock("../../src/services/trustscan/urlUtils.js", () => ({
  normalizeTarget: mocks.normalizeTarget
}));

import { checkReputationSignals } from "../../src/services/trustscan/reputationSignal.js";

describe("checkReputationSignals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.normalizeTarget.mockReturnValue({ url: "https://example.com/" });
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = "test-api-key";
  });

  it("returns clean result when no matches are found", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    const result = await checkReputationSignals("https://example.com");

    expect(result.listed).toBe(false);
    expect(result.grade).toBe("Clean");
    expect(result.scoreDelta).toBe(0);
  });

  it("returns flagged result when matches are present", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [{ threatType: "SOCIAL_ENGINEERING" }] })
    });

    const result = await checkReputationSignals("https://example.com");

    expect(result.listed).toBe(true);
    expect(result.grade).toBe("Flagged");
    expect(result.scoreDelta).toBe(-60);
  });

  it("handles API failure as unknown", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({})
    });

    const result = await checkReputationSignals("https://example.com");

    expect(result.listed).toBe(false);
    expect(result.grade).toBe("Unknown");
    expect(result.scoreDelta).toBe(0);
  });

  it("returns unknown when API key is missing", async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = "";

    const result = await checkReputationSignals("https://example.com");

    expect(result.listed).toBe(false);
    expect(result.grade).toBe("Unknown");
    expect(result.detail).toContain("not configured");
  });
});
