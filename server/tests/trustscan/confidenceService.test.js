import { describe, expect, it } from "vitest";
import { getTrustScanConfidence } from "../../src/services/trustscan/confidenceService.js";

describe("getTrustScanConfidence", () => {
  it("returns High when all signals including age are present", () => {
    const result = getTrustScanConfidence({
      ssl: { reason: "success" },
      headers: { reason: "success" },
      domain: { reason: "success" },
      reputation: { reason: "success" }
    });

    expect(result).toBe("High");
  });

  it("returns Medium for partial signal coverage", () => {
    const result = getTrustScanConfidence({
      ssl: { reason: "success" },
      headers: { reason: "network_error" },
      domain: { reason: "success" },
      reputation: { reason: "success" }
    });

    expect(result).toBe("Medium");
  });

  it("returns Low for minimal usable signals", () => {
    const result = getTrustScanConfidence({
      ssl: { reason: "network_error" },
      headers: { reason: "network_error" },
      domain: { reason: "success" },
      reputation: { reason: "network_error" }
    });

    expect(result).toBe("Low");
  });
});
