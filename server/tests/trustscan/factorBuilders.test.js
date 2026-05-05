import { describe, expect, it } from "vitest";
import {
  buildDomainFactor,
  buildHeadersFactor,
  buildReputationFactor,
  buildSslFactor
} from "../../src/services/trustscan/factorBuilders.js";

describe("factor builders", () => {
  it("builds positive SSL factor for valid cert", () => {
    const result = buildSslFactor({
      valid: true,
      issuer: "Lets Encrypt",
      expiresAt: "2030-01-01T00:00:00.000Z",
      daysRemaining: 90
    });

    expect(result.impact).toBe(15);
    expect(result.status).toBe("pass");
    expect(result.detail).toContain("Valid certificate from Lets Encrypt");
  });

  it("builds negative SSL factor for invalid cert", () => {
    const result = buildSslFactor({
      valid: false,
      issuer: "Unknown",
      error: "expired"
    });

    expect(result.impact).toBe(-35);
    expect(result.status).toBe("fail");
    expect(result.detail).toContain("Certificate check failed: expired");
  });

  it("builds negative header factor when controls are missing", () => {
    const result = buildHeadersFactor({
      grade: "Poor",
      scoreDelta: -24,
      present: [],
      missing: ["CSP", "HSTS", "XFO", "XCTO"]
    });

    expect(result.impact).toBe(-14);
    expect(result.status).toBe("warn");
    expect(result.detail).toContain("Poor browser protection posture");
  });

  it("builds failed domain factor when DNS is broken", () => {
    const result = buildDomainFactor({
      resolves: false,
      mx: false,
      ageDays: null,
      nameservers: 0,
      scoreDelta: -40,
      grade: "Broken",
      checkedDomain: null
    });

    expect(result.status).toBe("fail");
    expect(result.impact).toBe(-40);
    expect(result.detail).toContain("DNS resolution failed");
  });

  it("builds warning domain factor for transient DNS issues", () => {
    const result = buildDomainFactor({
      resolves: false,
      mx: false,
      ageDays: null,
      nameservers: 0,
      scoreDelta: 0,
      grade: "Neutral",
      reason: "network_error",
      checkedDomain: "example.com"
    });

    expect(result.status).toBe("warn");
    expect(result.detail).toContain("timed out or was unavailable");
  });

  it("builds warning domain factor for suspicious new domains", () => {
    const result = buildDomainFactor({
      resolves: true,
      mx: false,
      ageDays: 19,
      nameservers: 2,
      scoreDelta: -22,
      grade: "Suspicious",
      checkedDomain: "example.com"
    });

    expect(result.status).toBe("warn");
    expect(result.impact).toBe(-22);
    expect(result.detail).toContain("19 days old");
  });

  it("builds failed reputation factor when target is flagged", () => {
    const result = buildReputationFactor({
      listed: true,
      source: "Google Safe Browsing",
      scoreDelta: -60,
      grade: "Flagged",
      checkedUrl: "https://example.com"
    });

    expect(result.status).toBe("fail");
    expect(result.impact).toBe(-60);
    expect(result.detail).toContain("flagged");
  });

  it("builds pass reputation factor when source is clean", () => {
    const result = buildReputationFactor({
      listed: false,
      source: "Google Safe Browsing",
      scoreDelta: 0,
      grade: "Clean",
      checkedUrl: "https://example.com"
    });

    expect(result.status).toBe("pass");
    expect(result.impact).toBe(0);
    expect(result.detail).toContain("no public threat feed matches");
  });
});
