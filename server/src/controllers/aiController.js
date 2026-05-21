import { analyzeText } from "../services/aiService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { addXP } from "../utils/gamification.js";
import { incrementMetric, METRIC_KEYS } from "../utils/metrics.js";

// ─────────────────────────────────────────────
// STATUS CODE MAPPING
// ─────────────────────────────────────────────
const ERROR_STATUS_MAP = {
  INVALID_INPUT: 400,
  INPUT_TOO_LARGE: 413,
  TIMEOUT: 504,
  OFFLINE: 503,
  UNAVAILABLE: 503,
  MALFORMED: 502,
  UPSTREAM_CLIENT_ERROR: 502,
  UNKNOWN: 500,
};

// ─────────────────────────────────────────────
// CONTROLLER
// ─────────────────────────────────────────────
export const detectScam = async (req, res) => {
  try {
    const text = req.body?.text;

    // 1. Execute core business logic
    const result = await analyzeText(text);

    // 2. Execute non-blocking side effects
    // Core path must not fail if +5 XP cannot be awarded.
    try {
      await incrementMetric(METRIC_KEYS.AI_SCANS_RUN);

      const label = String(result?.label || "").toUpperCase();

      if (label === "SUSPICIOUS" || label === "MALICIOUS") {
        await incrementMetric(METRIC_KEYS.THREATS_FLAGGED);
      }

      if (req.user?._id) {
        await addXP(req.user._id, "AI_USED");
      }
    } catch (sideEffectError) {
      console.error("[AI_CONTROLLER_SIDE_EFFECT]", {
        message: sideEffectError.message,
        stack:
          process.env.NODE_ENV !== "production"
            ? sideEffectError.stack
            : undefined,
      });
    }

    // 3. Return success
    return sendSuccess(res, result);

  } catch (error) {
    // 4. Safe observability log
    console.error("[AI_CONTROLLER]", {
      type: error.type || "UNKNOWN",
      status: error.status || 500,
      message: error.message,
      retryable: error.retryable || false,
      latencyMs: error.latencyMs || null,
      source: error.source || "unknown",
    });

    // 5. Resolve proper HTTP status
    const httpStatus =
      ERROR_STATUS_MAP[error.type] ||
      error.status ||
      500;

    // 6. Return standardized error contract
    return sendError(
      res,
      httpStatus,
      error.message || "AI scan failed"
    );
  }
};
