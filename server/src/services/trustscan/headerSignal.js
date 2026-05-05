import http from "http";
import https from "https";
import { normalizeTarget } from "./urlUtils.js";

const HEADER_TIMEOUT_MS = 7000;

const headerWeights = {
  "content-security-policy": { key: "CSP", impact: -10, label: "Content-Security-Policy" },
  "strict-transport-security": { key: "HSTS", impact: -8, label: "Strict-Transport-Security" },
  "x-frame-options": { key: "XFO", impact: -6, label: "X-Frame-Options" },
  "referrer-policy": { key: "Referrer-Policy", impact: -3, label: "Referrer-Policy" },
  "x-content-type-options": { key: "XCTO", impact: -5, label: "X-Content-Type-Options" },
  "permissions-policy": { key: "Permissions-Policy", impact: 0, label: "Permissions-Policy" }
};

const requestHeaders = async (method, url) => {
  const { hostname, protocol, port, pathname, search } = normalizeTarget(url);
  const client = protocol === "http:" ? http : https;

  return await new Promise((resolve, reject) => {
    const request = client.request(
      {
        method,
        hostname,
        port,
        path: `${pathname}${search}`,
        rejectUnauthorized: false,
        servername: hostname,
        timeout: HEADER_TIMEOUT_MS
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const location = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location) {
          response.resume();

          const nextUrl = new URL(location, url).toString();

          if (nextUrl !== url) {
            requestHeaders(method, nextUrl).then(resolve).catch(reject);
            return;
          }
        }

        if (method !== "HEAD") {
          response.resume();
        }

        resolve(response);
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("Header request timed out"));
    });

    request.on("error", reject);
    request.end();
  });
};

const extractHeaderReport = (responseHeaders) => {
  const present = [];
  const missing = [];

  const hasHeader = (headerName) => {
    if (!responseHeaders) return false;

    if (typeof responseHeaders.get === "function") {
      return Boolean(responseHeaders.get(headerName));
    }

    const value = responseHeaders[headerName] || responseHeaders[headerName.toLowerCase()];
    return Boolean(value);
  };

  Object.entries(headerWeights).forEach(([headerName, meta]) => {
    if (hasHeader(headerName)) {
      present.push(meta.key);
    } else if (meta.impact < 0) {
      missing.push(meta.key);
    }
  });

  const scoreDelta = present.reduce((sum, headerKey) => {
    if (headerKey === "CSP") return sum + 4;
    if (headerKey === "HSTS") return sum + 3;
    if (headerKey === "XFO") return sum + 2;
    if (headerKey === "XCTO") return sum + 2;
    if (headerKey === "Referrer-Policy") return sum + 1;
    return sum;
  }, 0) + missing.reduce((sum, headerKey) => {
    if (headerKey === "CSP") return sum - 10;
    if (headerKey === "HSTS") return sum - 8;
    if (headerKey === "XFO") return sum - 6;
    if (headerKey === "XCTO") return sum - 5;
    if (headerKey === "Referrer-Policy") return sum - 3;
    return sum;
  }, 0);

  const majorPresent = ["CSP", "HSTS", "XFO"].every((headerKey) => present.includes(headerKey));

  let grade = "Weak";
  if (missing.length === 0 && majorPresent) {
    grade = "Strong";
  } else if (missing.length <= 1) {
    grade = "Good";
  } else if (missing.length <= 3) {
    grade = "Weak";
  } else {
    grade = "Poor";
  }

  return {
    present,
    missing,
    scoreDelta: Math.max(-30, Math.min(10, scoreDelta)),
    grade
  };
};

export const checkSecurityHeaders = async (rawUrl) => {
  try {
    const { url } = normalizeTarget(rawUrl);

    let response = null;

    try {
      response = await requestHeaders("HEAD", url);
    } catch {
      response = null;
    }

    if (!response || (response.statusCode ?? response.status) === 405) {
      response = await requestHeaders("GET", url);
    }

    const report = extractHeaderReport(response.headers);

    return {
      ...report,
      statusCode: response.statusCode ?? response.status ?? null,
      checkedUrl: url,
      reason: "success"
    };
  } catch (error) {
    return {
      present: [],
      missing: ["CSP", "HSTS", "XFO", "Referrer-Policy", "XCTO"],
      scoreDelta: -25,
      grade: "Poor",
      statusCode: null,
      checkedUrl: null,
      error: error.message || "Header check failed",
      reason: "network_error"
    };
  }
};
