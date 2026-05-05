import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  lookup: vi.fn(),
  resolveMx: vi.fn(),
  resolveNs: vi.fn(),
  withTimeout: vi.fn(),
  lookupDomainAgeDays: vi.fn(),
  normalizeTarget: vi.fn(),
  getRegistrableDomain: vi.fn()
}));

vi.mock("dns", () => ({
  promises: {
    lookup: mocks.lookup,
    resolveMx: mocks.resolveMx,
    resolveNs: mocks.resolveNs
  }
}));

vi.mock("../../src/services/trustscan/networkUtils.js", () => ({
  withTimeout: mocks.withTimeout
}));

vi.mock("../../src/services/trustscan/rdapService.js", () => ({
  lookupDomainAgeDays: mocks.lookupDomainAgeDays
}));

vi.mock("../../src/services/trustscan/urlUtils.js", () => ({
  normalizeTarget: mocks.normalizeTarget,
  getRegistrableDomain: mocks.getRegistrableDomain
}));

import { checkDomainSignals } from "../../src/services/trustscan/domainSignal.js";

describe("checkDomainSignals", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.normalizeTarget.mockReturnValue({ hostname: "www.example.com" });
    mocks.getRegistrableDomain.mockReturnValue("example.com");
    mocks.withTimeout.mockImplementation(async (promise) => promise);

    mocks.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
    mocks.resolveMx.mockResolvedValue([]);
    mocks.resolveNs.mockResolvedValue([]);
    mocks.lookupDomainAgeDays.mockResolvedValue(null);
  });

  it("marks domain resolved when dns.lookup succeeds", async () => {
    mocks.lookup.mockResolvedValue([{ address: "1.2.3.4", family: 4 }]);
    mocks.resolveMx.mockResolvedValue([{ exchange: "mail.example.com", priority: 10 }]);
    mocks.resolveNs.mockResolvedValue(["ns1.example.com", "ns2.example.com"]);
    mocks.lookupDomainAgeDays.mockResolvedValue(1000);

    const result = await checkDomainSignals("https://www.example.com");

    expect(result.resolves).toBe(true);
    expect(result.mx).toBe(true);
    expect(result.scoreDelta).toBe(15);
    expect(result.grade).toBe("Strong");
    expect(result.checkedDomain).toBe("example.com");
    expect(result.reason).toBe("success");
  });

  it("returns neutral when local resolver is unavailable", async () => {
    const resolverError = Object.assign(new Error("Operation timed out"), { code: "EAI_AGAIN" });
    mocks.lookup.mockRejectedValue(resolverError);
    mocks.withTimeout.mockImplementation(async (promise) => {
      try {
        return await promise;
      } catch (error) {
        throw error;
      }
    });

    const result = await checkDomainSignals("https://www.example.com");

    expect(result.resolves).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.grade).toBe("Neutral");
    expect(result.reason).toBe("environment_dns_unavailable");
  });

  it("returns broken when lookup indicates NXDOMAIN", async () => {
    const nxDomainError = Object.assign(new Error("getaddrinfo ENOTFOUND"), { code: "ENOTFOUND" });
    mocks.lookup.mockRejectedValue(nxDomainError);
    mocks.withTimeout.mockImplementation(async (promise) => {
      try {
        return await promise;
      } catch (error) {
        throw error;
      }
    });

    const result = await checkDomainSignals("https://www.example.com");

    expect(result.resolves).toBe(false);
    expect(result.scoreDelta).toBe(-40);
    expect(result.grade).toBe("Broken");
    expect(result.reason).toBe("nxdomain");
  });

  it("keeps MX/NS optional when lookup succeeds", async () => {
    mocks.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
    mocks.resolveMx.mockResolvedValue([]);
    mocks.resolveNs.mockResolvedValue([]);
    mocks.lookupDomainAgeDays.mockResolvedValue(400);

    const result = await checkDomainSignals("https://www.example.com");

    expect(result.resolves).toBe(true);
    expect(result.mx).toBe(false);
    expect(result.nameservers).toBe(0);
    expect(result.scoreDelta).toBe(5);
    expect(result.grade).toBe("Fair");
    expect(result.reason).toBe("success");
  });
});
