import axios from "axios";
import { logError, logInfo, logWarn } from "../utils/logger.js";

const RAW_URL = process.env.NODE_ENV === "production"
  ? process.env.AI_SERVICE_URL
  : process.env.AI_SERVICE_LOCAL_URL || process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const AI_SERVICE_URL = String(RAW_URL || "").replace(/\/+$/, "");
const AI_PREDICT_ENDPOINT = "/api/predict";

const AI_SOURCE = process.env.NODE_ENV === "production" ? "render-ai" : "local-ai";
const REQUEST_TIMEOUT_MS = 15000;
const MAX_INPUT_LENGTH = Number(process.env.AI_PREDICT_TEXT_MAX_CHARS || 10000);

const classifyError = (error) => {
  if (error.code === "ECONNABORTED") {
    return { type: "TIMEOUT", message: "AI service timeout", retryable: true };
  }

  if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
    return { type: "UNAVAILABLE", message: "AI service unavailable", retryable: true };
  }

  if (error.code === "ECONNREFUSED") {
    return { type: "OFFLINE", message: "AI service offline", retryable: false };
  }

  if (error.type === "MALFORMED") {
    return { type: "MALFORMED", message: "Malformed AI response", retryable: false };
  }

  if (error.type === "UPSTREAM_CLIENT_ERROR") {
    return { type: "UPSTREAM_CLIENT_ERROR", message: error.message, retryable: false };
  }

  return { type: "UNKNOWN", message: error.message || "AI service failed", retryable: false };
};

const callPrimaryAI = async (text) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}${AI_PREDICT_ENDPOINT}`,
    { text },
    {
      timeout: REQUEST_TIMEOUT_MS,
      maxContentLength: 1024 * 1024,
      headers: { "Content-Type": "application/json" },
      validateStatus: (status) => status >= 200 && status < 500,
    }
  );

  if (response.status >= 400) {
    const error = new Error(response.data?.message || `AI service returned ${response.status}`);
    error.type = "UPSTREAM_CLIENT_ERROR";
    error.status = response.status;
    throw error;
  }

  return response.data;
};

const callFallbackAI = async () => null;

const normalizeResponse = (rawData, source, latencyMs) => {
  if (!rawData || typeof rawData !== "object" || typeof rawData.label !== "string") {
    const malformed = new Error("Malformed AI response");
    malformed.type = "MALFORMED";
    throw malformed;
  }

  return Object.freeze({
    label: rawData.label,
    confidence: rawData.confidence ?? null,
    source,
    latencyMs,
  });
};

export const analyzeText = async (rawText) => {
  if (typeof rawText !== "string" || !rawText.trim()) {
    const error = new Error("Invalid AI input: text must be a non-empty string");
    error.type = "INVALID_INPUT";
    error.retryable = false;
    throw error;
  }

  const text = rawText.trim();

  if (text.length > MAX_INPUT_LENGTH) {
    const error = new Error(`AI input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
    error.type = "INPUT_TOO_LARGE";
    error.retryable = false;
    throw error;
  }

  const startedAt = Date.now();
  let source = AI_SOURCE;

  try {
    let rawData;

    try {
      rawData = await callPrimaryAI(text);
    } catch (primaryError) {
      const classified = classifyError(primaryError);

      if (!classified.retryable) {
        throw primaryError;
      }

      logWarn("AI", `Primary call failed (${primaryError.code || primaryError.message}). Attempting fallback.`);
      source = "fallback-ai";
      rawData = await callFallbackAI(text);

      if (!rawData) {
        throw primaryError;
      }
    }

    const latencyMs = Date.now() - startedAt;
    logInfo("AI", `classify completed in ${latencyMs}ms via ${source}`);
    return normalizeResponse(rawData, source, latencyMs);
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const classified = classifyError(error);

    logError("AI", `classify failed after ${latencyMs}ms`, {
      type: classified.type,
      retryable: classified.retryable,
      source,
      status: error.status || undefined,
    });

    const enrichedError = new Error(classified.message);
    enrichedError.type = classified.type;
    enrichedError.retryable = classified.retryable;
    enrichedError.latencyMs = latencyMs;
    enrichedError.source = source;
    enrichedError.status = error.status || 500;

    throw enrichedError;
  }
};
