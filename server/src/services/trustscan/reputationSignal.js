import { normalizeTarget } from "./urlUtils.js";

const GOOGLE_SAFE_BROWSING_SOURCE = "Google Safe Browsing";
const GOOGLE_SAFE_BROWSING_ENDPOINT = "https://safebrowsing.googleapis.com/v4/threatMatches:find";

const buildRequestBody = (url) => ({
  client: {
    clientId: "cybershield",
    clientVersion: "1.0.0"
  },
  threatInfo: {
    threatTypes: [
      "MALWARE",
      "SOCIAL_ENGINEERING",
      "UNWANTED_SOFTWARE",
      "POTENTIALLY_HARMFUL_APPLICATION"
    ],
    platformTypes: ["ANY_PLATFORM"],
    threatEntryTypes: ["URL"],
    threatEntries: [{ url }]
  }
});

export const checkReputationSignals = async (rawUrl) => {
  try {
    const { url } = normalizeTarget(rawUrl);
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

    if (!apiKey || typeof fetch !== "function") {
      return {
        listed: false,
        source: GOOGLE_SAFE_BROWSING_SOURCE,
        scoreDelta: 0,
        grade: "Unknown",
        checkedUrl: url,
        detail: "Google Safe Browsing API key is not configured.",
        reason: "service_unavailable"
      };
    }

    const response = await fetch(`${GOOGLE_SAFE_BROWSING_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(buildRequestBody(url))
    });

    if (!response.ok) {
      return {
        listed: false,
        source: GOOGLE_SAFE_BROWSING_SOURCE,
        scoreDelta: 0,
        grade: "Unknown",
        checkedUrl: url,
        detail: `Google Safe Browsing lookup failed with status ${response.status}.`,
        reason: "api_error"
      };
    }

    const payload = await response.json();
    const matches = Array.isArray(payload?.matches) ? payload.matches : [];

    if (matches.length > 0) {
      return {
        listed: true,
        source: GOOGLE_SAFE_BROWSING_SOURCE,
        scoreDelta: -60,
        grade: "Flagged",
        checkedUrl: url,
        detail: `${matches.length} threat match(es) reported by Google Safe Browsing.`,
        reason: "success"
      };
    }

    return {
      listed: false,
      source: GOOGLE_SAFE_BROWSING_SOURCE,
      scoreDelta: 0,
      grade: "Clean",
      checkedUrl: url,
      detail: "No Google Safe Browsing matches found.",
      reason: "success"
    };
  } catch (error) {
    return {
      listed: false,
      source: GOOGLE_SAFE_BROWSING_SOURCE,
      scoreDelta: 0,
      grade: "Unknown",
      checkedUrl: null,
      detail: "Reputation lookup failed.",
      reason: "network_error",
      error: error.message || "Reputation lookup failed"
    };
  }
};
