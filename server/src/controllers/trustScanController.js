import { sendError, sendSuccess } from "../utils/response.js";
import { validationResult } from "express-validator";
import TrustScanJob from "../models/TrustScanJob.js";
import TrustScanReport from "../models/TrustScanReport.js";
import {
  checkDomainSignals,
  checkReputationSignals,
  checkSecurityHeaders,
  runSslTlsCheck
} from "../services/trustScanSignals.js";
import { MOCK_SCAN_DURATION_MS } from "../services/trustscan/constants.js";
import { getTrustScanConfidence } from "../services/trustscan/confidenceService.js";
import {
  buildDomainFactor,
  buildHeadersFactor,
  buildReputationFactor,
  buildSslFactor,
  createPlaceholderFactors
} from "../services/trustscan/factorBuilders.js";
import { calculateScoreAndVerdict } from "../services/trustscan/scoringService.js";
import { buildTrustScanSummary } from "../services/trustscan/summaryService.js";
import asyncHandler from "../utils/asyncHandler.js";

const TRUSTSCAN_CACHE_TTL_MS = 10 * 60 * 1000;
const trustScanReportCache = new Map();

const getTrustScanCacheKey = (url) => url.toLowerCase();

const getCachedTrustScanReport = (url) => {
  const cacheKey = getTrustScanCacheKey(url);
  const cachedEntry = trustScanReportCache.get(cacheKey);

  if (!cachedEntry) {
    return null;
  }

  if (Date.now() - cachedEntry.cachedAt > TRUSTSCAN_CACHE_TTL_MS) {
    trustScanReportCache.delete(cacheKey);
    return null;
  }

  return cachedEntry.report;
};

const setCachedTrustScanReport = (url, report) => {
  trustScanReportCache.set(getTrustScanCacheKey(url), {
    cachedAt: Date.now(),
    report
  });
};

const cloneTrustScanReportForJob = (job, report) => ({
  jobId: job._id,
  userId: job.userId,
  url: job.url,
  normalizedDomain: job.normalizedDomain,
  score: report.score,
  verdict: report.verdict,
  confidence: report.confidence,
  factors: report.factors,
  summary: report.summary,
  scanDurationMs: report.scanDurationMs,
  scanEvidence: report.scanEvidence,
  scanMetadata: report.scanMetadata
});

const getNormalizedDomain = (rawUrl) => {
  try {
    const hasProtocol = /^https?:\/\//i.test(rawUrl);
    const parsed = new URL(hasProtocol ? rawUrl : `https://${rawUrl}`);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return {
      url: parsed.toString(),
      normalizedDomain: parsed.hostname.toLowerCase()
    };
  } catch {
    return null;
  }
};

const buildEvidenceEvent = ({ key, label, result, startedAtMs, endedAtMs }) => {
  let message = `${label} completed`;

  if (key === "ssl") {
    message = result.reason === "success" ? "TLS handshake passed" : "TLS handshake failed";
  } else if (key === "headers") {
    message = result.reason === "success" ? "Headers analyzed" : "Headers analysis failed";
  } else if (key === "dns") {
    message = result.reason === "success" ? "DNS resolved" : "DNS lookup failed";
  } else if (key === "reputation") {
    if (result.reason === "service_unavailable") {
      message = "Reputation source unavailable";
    } else if (result.reason === "api_error") {
      message = "Reputation lookup returned an API error";
    } else if (result.reason === "network_error") {
      message = "Reputation lookup encountered a network error";
    } else if (result.listed) {
      message = "Reputation flagged by public feeds";
    } else {
      message = "Reputation checked";
    }
  }

  return {
    key,
    label,
    message,
    reason: result.reason || "success",
    status: result.grade || result.status || "success",
    durationMs: endedAtMs - startedAtMs,
    occurredAt: new Date(endedAtMs).toISOString()
  };
};

const runTimedSignal = async (key, label, signalRunner, scanStartTimeMs) => {
  const startedAtMs = Date.now();
  const result = await signalRunner();
  const endedAtMs = Date.now();

  return {
    result,
    evidence: buildEvidenceEvent({
      key,
      label,
      result,
      startedAtMs: scanStartTimeMs + (startedAtMs - scanStartTimeMs),
      endedAtMs: scanStartTimeMs + (endedAtMs - scanStartTimeMs)
    })
  };
};

const getSafeSslResult = (result) => ({
  valid: Boolean(result?.valid),
  issuer: typeof result?.issuer === "string" ? result.issuer : "unknown",
  expiresAt: result?.expiresAt || null,
  daysRemaining: typeof result?.daysRemaining === "number" ? result.daysRemaining : null,
  reason: typeof result?.reason === "string" ? result.reason : "network_error",
  error: typeof result?.error === "string" ? result.error : null
});

const getSafeHeadersResult = (result) => ({
  present: Array.isArray(result?.present) ? result.present : [],
  missing: Array.isArray(result?.missing)
    ? result.missing
    : ["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options", "Referrer-Policy", "X-Content-Type-Options"],
  scoreDelta: typeof result?.scoreDelta === "number" ? result.scoreDelta : -25,
  grade: typeof result?.grade === "string" ? result.grade : "Poor",
  reason: typeof result?.reason === "string" ? result.reason : "network_error"
});

const getSafeDomainResult = (result) => ({
  resolves: Boolean(result?.resolves),
  mx: Boolean(result?.mx),
  ageDays: typeof result?.ageDays === "number" ? result.ageDays : null,
  nameservers: typeof result?.nameservers === "number" ? result.nameservers : 0,
  scoreDelta: typeof result?.scoreDelta === "number" ? result.scoreDelta : -15,
  grade: typeof result?.grade === "string" ? result.grade : "Suspicious",
  reason: typeof result?.reason === "string" ? result.reason : "network_error",
  checkedDomain: typeof result?.checkedDomain === "string" ? result.checkedDomain : null
});

const getSafeReputationResult = (result, url) => ({
  listed: Boolean(result?.listed),
  scoreDelta: typeof result?.scoreDelta === "number" ? result.scoreDelta : 0,
  source: typeof result?.source === "string" ? result.source : "Google Safe Browsing",
  grade: typeof result?.grade === "string" ? result.grade : "Unknown",
  reason: typeof result?.reason === "string" ? result.reason : "service_unavailable",
  detail: typeof result?.detail === "string" ? result.detail : "Reputation lookup unavailable.",
  checkedUrl: typeof result?.checkedUrl === "string" ? result.checkedUrl : url,
  error: typeof result?.error === "string" ? result.error : null
});

const buildMockReportPayload = async (job) => {
  const scanStartTime = Date.now();

  const [sslResult, headersResult, domainResult, reputationResult] = await Promise.all([
    runTimedSignal("ssl", "TLS handshake", () => runSslTlsCheck(job.url), scanStartTime),
    runTimedSignal("headers", "Headers analyzed", () => checkSecurityHeaders(job.url), scanStartTime),
    runTimedSignal("dns", "DNS resolved", () => checkDomainSignals(job.url), scanStartTime),
    runTimedSignal("reputation", "Reputation source", () => checkReputationSignals(job.url), scanStartTime)
  ]);

  const ssl = getSafeSslResult(sslResult?.result);
  const headers = getSafeHeadersResult(headersResult?.result);
  const domain = getSafeDomainResult(domainResult?.result);
  const reputation = getSafeReputationResult(reputationResult?.result, job.url);
  const scanEvidence = [sslResult.evidence, headersResult.evidence, domainResult.evidence, reputationResult.evidence]
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime());

  const scanEndTime = Date.now();
  const scanDurationMs = scanEndTime - scanStartTime;

  const factors = [
    buildSslFactor(ssl),
    buildHeadersFactor(headers),
    buildDomainFactor(domain),
    buildReputationFactor(reputation),
    ...createPlaceholderFactors()
  ];
  const { score, verdict } = calculateScoreAndVerdict(factors);

  return {
    jobId: job._id,
    userId: job.userId,
    url: job.url,
    normalizedDomain: job.normalizedDomain,
    score,
    verdict,
    confidence: getTrustScanConfidence({ ssl, headers, domain, reputation }),
    factors,
    summary: buildTrustScanSummary({ ssl, headers, domain, reputation }),
    scanDurationMs,
    scanEvidence,
    scanMetadata: {
      ssl: { reason: ssl?.reason || "success" },
      headers: { reason: headers?.reason || "success" },
      domain: { reason: domain?.reason || "success" },
      reputation: { reason: reputation?.reason || "success" }
    }
  };
};

const maybeAdvanceJobState = async (job) => {
  if (!job) return job;
  if (job.status === "completed" || job.status === "failed") return job;

  if (getCachedTrustScanReport(job.url)) {
    job.status = "completed";
    job.completedAt = new Date();
    await job.save();
    return job;
  }

  const startedAtMs = job.startedAt ? new Date(job.startedAt).getTime() : Date.now();
  const elapsedMs = Date.now() - startedAtMs;

  if (elapsedMs >= MOCK_SCAN_DURATION_MS) {
    job.status = "completed";
    job.completedAt = new Date();
    await job.save();
    return job;
  }

  if (job.status === "queued") {
    job.status = "running";
    job.startedAt = new Date();
    await job.save();
  }

  return job;
};

const ensureReportForCompletedJob = async (job) => {
  if (!job || job.status !== "completed") {
    return null;
  }

  const existing = await TrustScanReport.findOne({
    jobId: job._id,
    userId: job.userId
  });

  if (existing) {
    return existing;
  }

  const cachedReport = getCachedTrustScanReport(job.url);
  if (cachedReport) {
    return TrustScanReport.create(cloneTrustScanReportForJob(job, cachedReport));
  }

  try {
    const payload = await buildMockReportPayload(job);
    setCachedTrustScanReport(job.url, payload);
    return TrustScanReport.create(payload);
  } catch (err) {
    console.error("TRUSTSCAN REPORT BUILD FAILED", err);
    console.error(err.stack);
    throw err;
  }
};

const countRecentTrustScans = async (userId, sinceDate) => {
  if (typeof TrustScanJob.countDocuments === "function") {
    return TrustScanJob.countDocuments({
      userId,
      createdAt: { $gte: sinceDate }
    });
  }

  return 0;
};

const getTrustScanValidationMessage = (errors) => {
  const messages = errors.map((error) => error.msg);

  if (messages.includes("Invalid URL format") && !messages.includes("URL is required")) {
    return "Invalid URL format";
  }

  return "Validation failed";
};

export const createTrustScan = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    return sendError(
      res,
      400,
      getTrustScanValidationMessage(validationErrors),
      validationErrors
    );
  }

  const { url } = req.body;

  if (!url || typeof url !== "string" || !url.trim()) {
    return sendError(res, 400, "Valid URL is required");
  }

  const normalized = getNormalizedDomain(url.trim());
  if (!normalized) {
    return sendError(res, 400, "Invalid URL format");
  }

  // Per-user rate limit: max 5 scans per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentScans = await countRecentTrustScans(req.user._id, oneHourAgo);

  if (recentScans >= 5) {
    return sendError(res, 429, "Rate limit exceeded: maximum 5 scans per hour");
  }

  // Check for duplicate scan (prevent duplicate processing)
  const existingJob = await TrustScanJob.findOne({
    userId: req.user._id,
    normalizedDomain: normalized.normalizedDomain,
    status: "running",
    createdAt: { $gte: new Date(Date.now() - 30 * 1000) } // within last 30 seconds
  });

  if (existingJob) {
    return sendError(res, 409, "A scan for this URL is already in progress");
  }

  const now = new Date();

  const job = await TrustScanJob.create({
    userId: req.user._id,
    url: normalized.url,
    normalizedDomain: normalized.normalizedDomain,
    status: "running",
    startedAt: now
  });

  return sendSuccess(res, {
    jobId: job._id,
    status: job.status,
    url: job.url,
    normalizedDomain: job.normalizedDomain,
    etaSeconds: Math.ceil(MOCK_SCAN_DURATION_MS / 1000)
  }, 201, "TrustScan job created");
});

export const getTrustScanById = asyncHandler(async (req, res) => {
  try {
    const job = await TrustScanJob.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!job) {
      return sendError(res, 404, "TrustScan job not found");
    }

    let updatedJob;
    let report;

    try {
      updatedJob = await maybeAdvanceJobState(job);
      report = await ensureReportForCompletedJob(updatedJob);
    } catch (err) {
      console.error("TRUSTSCAN COMPLETE ERROR:", err);
      console.error(err.stack);
      return sendError(res, 500, "Failed to complete TrustScan job");
    }

    return sendSuccess(res, {
      job: updatedJob.toObject(),
      report: report ? report.toObject() : null
    });
  } catch (error) {
    console.error("TRUSTSCAN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export const getTrustScanHistory = asyncHandler(async (req, res) => {
  const rawPage = Number.parseInt(req.query.page, 10);
  const rawLimit = Number.parseInt(req.query.limit, 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 20) : 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    TrustScanReport.find({ userId: req.user._id })
      .select("jobId url normalizedDomain score verdict summary createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TrustScanReport.countDocuments({ userId: req.user._id })
  ]);

  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return sendSuccess(res, {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page * limit < total
    }
  });
});

export const getPublicTrustScanReport = asyncHandler(async (req, res) => {
  const report = await TrustScanReport.findById(req.params.id);

  if (!report) {
    return sendError(res, 404, "Report not found");
  }

  return sendSuccess(res, {
    report: report.toObject()
  });
});
