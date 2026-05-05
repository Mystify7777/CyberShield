import { describe, expect, it } from "vitest";
import { calculateScoreAndVerdict } from "../../src/services/trustscan/scoringService.js";

describe("calculateScoreAndVerdict", () => {
  it("clamps score at 0 for very negative impact", () => {
    const result = calculateScoreAndVerdict([{ impact: -200 }]);

    expect(result).toEqual({
      score: 0,
      verdict: "DANGEROUS"
    });
  });

  it("applies additive impact correctly", () => {
    const result = calculateScoreAndVerdict([{ impact: 10 }, { impact: -4 }, { impact: 3 }]);

    expect(result).toEqual({
      score: 79,
      verdict: "SAFE"
    });
  });

  it("maps +5 impact to CAUTION verdict", () => {
    const result = calculateScoreAndVerdict([{ impact: 5 }]);

    expect(result).toEqual({
      score: 75,
      verdict: "CAUTION"
    });
  });

  it("clamps score at 100 and maps to STRONG", () => {
    const result = calculateScoreAndVerdict([
      { impact: 10, reason: "success" },
      { impact: 10, reason: "success" },
      { impact: 10, reason: "success" },
      { impact: 0, reason: "success" }
    ]);

    expect(result).toEqual({
      score: 100,
      verdict: "STRONG"
    });
  });

  it("caps medium-confidence scores below STRONG", () => {
    const factors = [
      { impact: 15, reason: "success" },
      { impact: 15, reason: "success" },
      { impact: 15, reason: "success" },
      { impact: 20, reason: "network_error" }
    ];

    const result = calculateScoreAndVerdict(factors);

    expect(result).toEqual({
      score: 89,
      verdict: "SAFE"
    });
  });

  it("caps low-confidence scores to avoid false STRONG verdicts", () => {
    const factors = [
      { impact: 20, reason: "network_error" },
      { impact: 20, reason: "network_error" },
      { impact: 20, reason: "success" }
    ];

    const result = calculateScoreAndVerdict(factors);

    expect(result).toEqual({
      score: 75,
      verdict: "CAUTION"
    });
  });
});
