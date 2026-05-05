export const BASE_SCORE = 70;
export const MOCK_SCAN_DURATION_MS = 4500;

export const VERDICT_BANDS = [
  { max: 30, verdict: "DANGEROUS" },
  { max: 55, verdict: "RISKY" },
  { max: 75, verdict: "CAUTION" },
  { max: 89, verdict: "SAFE" },
  { max: Number.POSITIVE_INFINITY, verdict: "STRONG" }
];
