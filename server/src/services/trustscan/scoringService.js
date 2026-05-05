import { BASE_SCORE, VERDICT_BANDS } from "./constants.js";

const clampScore = (score) => Math.max(0, Math.min(100, score));

const CONFIDENCE_SCORE_CAPS = {
  High: 100,
  Medium: 89,
  Low: 75
};

const deriveConfidenceFromFactors = (factors) => {
  const sources = (factors || []).filter(Boolean);
  const degradedSources = sources.filter((signal) => signal.reason && signal.reason !== "success").length;

  if (sources.length >= 4 && degradedSources === 0) {
    return "High";
  }

  if (degradedSources <= 1 && sources.length >= 3) {
    return "Medium";
  }

  return "Low";
};

const applyConfidenceCap = (score, confidence) => {
  const cap = CONFIDENCE_SCORE_CAPS[confidence] ?? CONFIDENCE_SCORE_CAPS.Low;
  return Math.min(score, cap);
};

const getVerdictBand = (score) => VERDICT_BANDS.find((band) => score <= band.max)?.verdict || "CAUTION";

export const calculateScoreAndVerdict = (factors) => {
  const totalImpact = (factors || []).reduce((sum, item) => sum + (item?.impact || 0), 0);
  const confidence = deriveConfidenceFromFactors(factors);
  const score = clampScore(applyConfidenceCap(BASE_SCORE + totalImpact, confidence));

  return {
    score,
    verdict: getVerdictBand(score)
  };
};
