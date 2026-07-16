import Report from "../models/Report.js";
import { validationResult } from "express-validator";
import Notification from "../models/Notification.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { addXP } from "../utils/gamification.js";
import { addCoins } from "../utils/economy.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { incrementMetric, METRIC_KEYS } from "../utils/metrics.js";
import { REPORT_STATUS_VALUES } from "../constants/reportTaxonomy.js";
import { filterAndSortReports, getListPagination, paginateReports } from "../utils/reportList.js";
import { deleteUploadedFile, persistUploadedFile, validateFile } from "../middlewares/uploadMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const PUBLIC_PAGE_LIMIT_MAX = 20;
const PRIVATE_PAGE_LIMIT_MAX = 50;

const serializePublicReport = (report) => {
  const safeDescription = report.isSensitive
    ? "Sensitive report details are hidden"
    : report.description;

  return {
    _id: report._id,
    title: report.title,
    description: safeDescription,
    category: report.category,
    subcategory: report.subcategory,
    severity: report.severity,
    sourceChannel: report.sourceChannel,
    status: report.status,
    isAnonymous: Boolean(report.isAnonymous),
    isSensitive: Boolean(report.isSensitive),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt
  };
};

// Create Report
export const createReport = asyncHandler(async (req, res) => {
  let evidenceFilename = null;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array(), "VALIDATION_FAILED");
    }

    const {
      title,
      description,
      category,
      subcategory,
      severity,
      sourceChannel,
      contactEmail,
      isAnonymous,
      isSensitive
    } = req.body;
    const evidencePath = req.file ? `/uploads/${req.file.filename}` : null;
    const anonymousFlag = isAnonymous === true || isAnonymous === "true";
    const sensitiveFlag = isSensitive === true || isSensitive === "true";
    const safeDescription = sensitiveFlag ? encrypt(description) : description;

    let evidencePath = null;

    if (req.file) {
      await validateFile(req.file);
      const savedEvidence = await persistUploadedFile(req.file);
      evidenceFilename = savedEvidence.filename;
      evidencePath = savedEvidence.path;
    }

    const report = await Report.create({
      user: anonymousFlag ? null : req.user?._id,
      title,
      description: safeDescription,
      category,
      subcategory,
      severity: severity || "LOW",
      sourceChannel,
      contactEmail,
      evidence: evidencePath,
      isAnonymous: anonymousFlag,
      isSensitive: sensitiveFlag,
      status: "SUBMITTED",
      history: [{ status: "SUBMITTED" }]
    });

    if (report.isAnonymous) {
      report.user = null;
    }

    const sideEffectResults = await Promise.allSettled([
      Notification.create({
        message: "New report submitted",
        type: "REPORT"
      }),
      req.user?._id ? addXP(req.user._id, "REPORT_CREATED") : Promise.resolve(),
      req.user?._id ? addCoins(req.user._id, "REPORT_CREATED") : Promise.resolve(),
      incrementMetric(METRIC_KEYS.REPORTS_SUBMITTED)
    ]);

    sideEffectResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error(
          "[REPORT_SIDE_EFFECT_ERROR]",
          result.reason?.message || result.reason
        );
      }
    });

    return sendSuccess(res, report, 201);
  } catch (error) {
    if (typeof evidenceFilename === "string" && evidenceFilename) {
      await deleteUploadedFile(evidenceFilename).catch((cleanupError) => {
        console.error("[FILE_CLEANUP_ERROR]", cleanupError.message);
      });
    }

    throw error;
  }
});

// Get public report feed (safe, non-sensitive projection)
export const getReports = asyncHandler(async (req, res) => {
  const { page, limit } = getListPagination(req.query, PUBLIC_PAGE_LIMIT_MAX);
  const reports = await Report.find()
    .select("title description category subcategory severity sourceChannel status isAnonymous isSensitive createdAt updatedAt")
    .sort({ createdAt: -1 });

  const filteredReports = filterAndSortReports(reports, req.query);
  const { items, pagination } = paginateReports(filteredReports, page, limit);
  const safeReports = items.map((report) => serializePublicReport(report));

  return sendSuccess(res, {
    items: safeReports,
    pagination
  });
});

// Get current user's own reports (detailed view)
export const getMyReports = asyncHandler(async (req, res) => {
  const { page, limit } = getListPagination(req.query, PRIVATE_PAGE_LIMIT_MAX);
  const match = { user: req.user._id };

  const reports = await Report.find(match)
    .select("title description category subcategory severity sourceChannel status contactEmail evidence isAnonymous isSensitive history createdAt updatedAt")
    .sort({ createdAt: -1 });

  const filteredReports = filterAndSortReports(reports, req.query);
  const { items, pagination } = paginateReports(filteredReports, page, limit);

  const safeReports = items.map((report) => {
    const item = report.toObject();
    if (item.isSensitive) {
      const { data, usedLegacy } = decrypt(item.description, {
        source: "reportController.getMyReports",
        recordId: String(report._id)
      });

      item.description = data;

      if (usedLegacy) {
        const reEncrypted = encrypt(data);

        if (report.description !== reEncrypted) {
          report.description = reEncrypted;
          report.save().catch((error) => {
            console.error(`[ENCRYPTION] Lazy migration failed for report=${report._id}:`, error.message);
          });
        }
      }
    }
    return item;
  });

  return sendSuccess(res, {
    items: safeReports,
    pagination
  });
});

// Update Status (Admin only)
export const updateReportStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array(), "VALIDATION_FAILED");
  }

  const { status: newStatus } = req.body;

  if (!REPORT_STATUS_VALUES.includes(newStatus)) {
    return sendError(res, 400, "Invalid status", undefined, "INVALID_REPORT_STATUS");
  }

  const report = await Report.findById(req.params.id);

  if (!report) {
    return sendError(res, 404, "Report not found", undefined, "REPORT_NOT_FOUND");
  }

  report.status = newStatus;
  report.history.push({
    status: newStatus,
    date: new Date()
  });
  await report.save();

  const sideEffectResults = await Promise.allSettled([
    Notification.create({
      message: `Report marked as ${newStatus}`,
      type: "REPORT"
    }),
    incrementMetric(METRIC_KEYS.MODERATION_ACTIONS)
  ]);

  sideEffectResults.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        "[REPORT_SIDE_EFFECT_ERROR]",
        result.reason?.message || result.reason
      );
    }
  });

  return sendSuccess(res, report);
});
