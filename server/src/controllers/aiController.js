import { analyzeText } from "../services/aiService.js";
import { validationResult } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { addXP } from "../utils/gamification.js";
import { incrementMetric, METRIC_KEYS } from "../utils/metrics.js";

export const detectScam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const text = String(req.body?.text || "").trim();

    const result = await analyzeText(text);
    await incrementMetric(METRIC_KEYS.AI_SCANS_RUN);

    const label = String(result?.label || "").toUpperCase();
    if (label === "SUSPICIOUS" || label === "MALICIOUS") {
      await incrementMetric(METRIC_KEYS.THREATS_FLAGGED);
    }

    if (req.user?._id) {
      await addXP(req.user._id, "AI_USED");
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
