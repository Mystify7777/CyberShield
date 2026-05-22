import User from "../models/User.js";
import Report from "../models/Report.js";
import Article from "../models/Article.js";
import { decrypt, encrypt } from "../utils/encryption.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { getMetricsSnapshot, incrementMetric, METRIC_KEYS } from "../utils/metrics.js";
import { filterAndSortReports, getListPagination, paginateReports } from "../utils/reportList.js";
import asyncHandler from "../utils/asyncHandler.js";

const REPORT_PENDING_STATES = ["SUBMITTED", "UNDER_REVIEW", "INVESTIGATING", "NEED_MORE_INFO", "PENDING", "REVIEWED"];

const ADMIN_REPORTS_PAGE_LIMIT_MAX = Number(process.env.ADMIN_REPORTS_PAGE_LIMIT_MAX) || 50;

// Dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const activeWindow = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    totalUsers,
    activeUsers,
    totalReports,
    totalArticles,
    pendingReports,
    metrics
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      lastActive: { $gte: activeWindow }
    }),
    Report.countDocuments(),
    Article.countDocuments(),
    Report.countDocuments({
      status: { $in: REPORT_PENDING_STATES }
    }),
    getMetricsSnapshot()
  ]);

  return sendSuccess(res, {
    totalUsers,
    activeUsers,
    totalReports,
    totalArticles,
    pendingReports,
    metrics
  });
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  return sendSuccess(res, users);
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  if (user.role === "SUPER_ADMIN") {
    return sendError(res, 400, "Cannot modify SUPER_ADMIN", undefined, "SUPER_ADMIN_PROTECTED");
  }

  if (String(req.user?._id) === String(user._id)) {
    return sendError(res, 400, "Cannot delete own account", undefined, "SELF_DELETE_BLOCKED");
  }

  if (user.role === "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
    return sendError(res, 403, "Insufficient privileges", undefined, "ADMIN_MODIFICATION_FORBIDDEN");
  }

  await user.deleteOne();

  incrementMetric(METRIC_KEYS.MODERATION_ACTIONS).catch((error) => {
    console.error("[ADMIN_METRIC_ERROR]", error.message);
  });

  return sendSuccess(res, { deletedUserId: req.params.id }, 200, "User removed");
});

// Get all reports (admin view with user details)
export const getAllReportsAdmin = asyncHandler(async (req, res) => {
  const { page, limit } = getListPagination(req.query, ADMIN_REPORTS_PAGE_LIMIT_MAX);

  const reports = await Report.find()
    .populate("user", "name alias email")
    .sort({ createdAt: -1 });

  const filteredReports = filterAndSortReports(reports, { ...req.query, includeContactEmail: "true" });
  const { items, pagination } = paginateReports(filteredReports, page, limit);

  const safeReports = items.map((report) => {
    const item = report.toObject();
    if (item.isSensitive) {
      try {
        const { data, usedLegacy } = decrypt(item.description, {
          source: "adminController.getAllReportsAdmin",
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
      } catch (error) {
        item.description = "[DECRYPTION_FAILED]";
        item.decryptionError = true;

        console.error(`[DECRYPTION_ERROR] Failed to decrypt report=${report._id}:`, error.message);
      }
    }
    return item;
  });

  return sendSuccess(res, {
    items: safeReports,
    pagination
  });
});

// Delete article
export const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return sendError(res, 404, "Article not found");
  }

  await article.deleteOne();

  incrementMetric(METRIC_KEYS.MODERATION_ACTIONS).catch((error) => {
    console.error("[ADMIN_METRIC_ERROR]", error.message);
  });

  return sendSuccess(res, { deletedArticleId: req.params.id }, 200, "Article deleted");
});

// Promote user to admin (Super Admin only)
export const promoteToAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  if (req.user?.role !== "SUPER_ADMIN") {
    return sendError(res, 403, "Insufficient privileges", undefined, "ADMIN_MODIFICATION_FORBIDDEN");
  }

  if (user.role === "SUPER_ADMIN") {
    return sendError(res, 400, "Cannot modify Super Admin role");
  }

  // Idempotency check
  if (user.role === "ADMIN") {
    return sendError(res, 400, "User is already an admin", undefined, "ALREADY_ADMIN");
  }

  user.role = "ADMIN";
  await user.save();

  incrementMetric(METRIC_KEYS.MODERATION_ACTIONS).catch((error) => {
    console.error("[ADMIN_METRIC_ERROR]", error.message);
  });

  return sendSuccess(res, { userId: user._id, role: user.role }, 200, "User promoted to admin");
});

// Suspend user (Admin or Super Admin)
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  if (user.role === "SUPER_ADMIN") {
    return sendError(res, 400, "Cannot suspend Super Admin");
  }

  if (String(req.user?._id) === String(user._id)) {
    return sendError(res, 400, "Cannot modify own suspension state", undefined, "SELF_SUSPEND_BLOCKED");
  }

  if (user.role === "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
    return sendError(res, 403, "Insufficient privileges", undefined, "ADMIN_MODIFICATION_FORBIDDEN");
  }

  // Idempotency check
  if (user.isSuspended) {
    return sendError(res, 400, "User already suspended", undefined, "ALREADY_SUSPENDED");
  }

  user.isSuspended = true;
  await user.save();

  incrementMetric(METRIC_KEYS.MODERATION_ACTIONS).catch((error) => {
    console.error("[ADMIN_METRIC_ERROR]", error.message);
  });

  return sendSuccess(res, { userId: user._id, isSuspended: user.isSuspended }, 200, "User suspended");
});

// Unsuspend user (Admin or Super Admin)
export const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  if (user.role === "SUPER_ADMIN") {
    return sendError(res, 400, "Cannot modify SUPER_ADMIN");
  }

  if (String(req.user?._id) === String(user._id)) {
    return sendError(res, 400, "Cannot modify own suspension state", undefined, "SELF_SUSPEND_BLOCKED");
  }

  if (user.role === "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
    return sendError(res, 403, "Insufficient privileges", undefined, "ADMIN_MODIFICATION_FORBIDDEN");
  }

  // Idempotency check
  if (!user.isSuspended) {
    return sendError(res, 400, "User is not suspended", undefined, "NOT_SUSPENDED");
  }

  user.isSuspended = false;
  await user.save();

  incrementMetric(METRIC_KEYS.MODERATION_ACTIONS).catch((error) => {
    console.error("[ADMIN_METRIC_ERROR]", error.message);
  });

  console.info(`[ADMIN] admin=${req.user?._id} action=UNSUSPEND_USER target=${user._id}`);

  return sendSuccess(res, { userId: user._id, isSuspended: user.isSuspended }, 200, "User unsuspended");
});

// Remove admin role (Super Admin only)
export const removeAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  // Explicit SUPER_ADMIN protection
  if (user.role === "SUPER_ADMIN") {
    return sendError(res, 400, "Cannot modify SUPER_ADMIN", undefined, "SUPER_ADMIN_PROTECTED");
  }

  if (user.role !== "ADMIN") {
    return sendError(res, 400, "Not an admin");
  }

  // Self-harm protection
  if (String(req.user?._id) === String(user._id)) {
    return sendError(res, 400, "Cannot remove your own admin role", undefined, "SELF_ROLE_MODIFICATION_BLOCKED");
  }

  // Authorization check
  if (req.user?.role !== "SUPER_ADMIN") {
    return sendError(res, 403, "Insufficient privileges", undefined, "ADMIN_MODIFICATION_FORBIDDEN");
  }

  user.role = "USER";
  await user.save();

  incrementMetric(METRIC_KEYS.MODERATION_ACTIONS).catch((error) => {
    console.error("[ADMIN_METRIC_ERROR]", error.message);
  });

  return sendSuccess(res, { userId: user._id, role: user.role }, 200, "Admin removed");
});
