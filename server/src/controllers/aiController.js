import { analyzeText } from "../services/aiService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { addXP } from "../utils/gamification.js";
import { incrementMetric, METRIC_KEYS } from "../utils/metrics.js";
import { logError } from "../utils/logger.js";

// ─────────────────────────────────────────────
// CONTROLLER
// ─────────────────────────────────────────────
export const detectScam = asyncHandler(async (req, res) => {
  const text = req.body?.text;

  // 1. Execute core business logic
  const result = await analyzeText(text);

  // 2. Execute non-blocking side effects
  // Core path must not fail if +5 XP cannot be awarded.
  await incrementMetric(METRIC_KEYS.AI_SCANS_RUN).catch((sideEffectError) => {
    logError("AI_CONTROLLER_SIDE_EFFECT", "Metric increment failed", sideEffectError);
  });

  const label = String(result?.label || "").toUpperCase();

  if (label === "SUSPICIOUS" || label === "MALICIOUS") {
    await incrementMetric(METRIC_KEYS.THREATS_FLAGGED).catch((sideEffectError) => {
      logError("AI_CONTROLLER_SIDE_EFFECT", "Threat metric increment failed", sideEffectError);
    });
  }

  if (req.user?._id) {
    await addXP(req.user._id, "AI_USED").catch((sideEffectError) => {
      logError("AI_CONTROLLER_SIDE_EFFECT", "XP award failed", sideEffectError);
    });
  }

  // 3. Return success
  return sendSuccess(res, result);
});
