import User from "../models/User.js";
import Report from "../models/Report.js";
import Article from "../models/Article.js";
import { decrypt, encrypt } from "../utils/encryption.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { getMetricsSnapshot, incrementMetric, METRIC_KEYS } from "../utils/metrics.js";
import { filterAndSortReports, getListPagination, paginateReports } from "../utils/reportList.js";

const REPORT_PENDING_STATES = ["SUBMITTED", "UNDER_REVIEW", "INVESTIGATING", "NEED_MORE_INFO", "PENDING", "REVIEWED"];

const ADMIN_REPORTS_PAGE_LIMIT_MAX = Number(process.env.ADMIN_REPORTS_PAGE_LIMIT_MAX) || 50;

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const activeWindow = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastActive: { $gte: activeWindow } });
    const totalReports = await Report.countDocuments();
    const totalArticles = await Article.countDocuments();

    const pendingReports = await Report.countDocuments({ status: { $in: REPORT_PENDING_STATES } });

    const metrics = await getMetricsSnapshot();

    return sendSuccess(res, {
      totalUsers,
      activeUsers,
      totalReports,
      totalArticles,
      pendingReports,
      metrics
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return sendSuccess(res, users);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    await user.deleteOne();
    await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

    return sendSuccess(res, { deletedUserId: req.params.id }, 200, "User removed");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Get all reports (admin view with user details)
export const getAllReportsAdmin = async (req, res) => {
  try {
    const { page, limit } = getListPagination(req.query, ADMIN_REPORTS_PAGE_LIMIT_MAX);

    const reports = await Report.find()
      .populate("user", "name alias email")
      .sort({ createdAt: -1 });

    const filteredReports = filterAndSortReports(reports, { ...req.query, includeContactEmail: "true" });
    const { items, pagination } = paginateReports(filteredReports, page, limit);

    const safeReports = items.map((report) => {
      const item = report.toObject();
      if (item.isSensitive) {
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
      }
      return item;
    });

    return sendSuccess(res, {
      items: safeReports,
      pagination
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return sendError(res, 404, "Article not found");
    }

    await article.deleteOne();
    await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

    return sendSuccess(res, { deletedArticleId: req.params.id }, 200, "Article deleted");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Promote user to admin (Admin or Super Admin)
export const promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.role === "SUPER_ADMIN") {
      return sendError(res, 400, "Cannot modify Super Admin role");
    }

    user.role = "ADMIN";
    await user.save();
    await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

    return sendSuccess(res, { userId: user._id, role: user.role }, 200, "User promoted to admin");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Suspend user (Admin or Super Admin)
export const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.role === "SUPER_ADMIN") {
      return sendError(res, 400, "Cannot suspend Super Admin");
    }

    user.isSuspended = true;
    await user.save();
    await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

    return sendSuccess(res, { userId: user._id, isSuspended: user.isSuspended }, 200, "User suspended");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Unsuspend user (Admin or Super Admin)
export const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.role === "SUPER_ADMIN") {
      return sendError(res, 400, "Cannot modify SUPER_ADMIN");
    }

    if (String(req.user?._id) === String(user._id)) {
      return sendError(res, 400, "Cannot modify own suspension state");
    }

    user.isSuspended = false;
    await user.save();
    await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

    console.log(`[ADMIN] admin=${req.user?._id} action=UNSUSPEND_USER target=${user._id}`);

    return sendSuccess(res, { userId: user._id, isSuspended: user.isSuspended }, 200, "User unsuspended");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Remove admin role (Super Admin only)
export const removeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.role !== "ADMIN") {
      return sendError(res, 400, "Not an admin");
    }

    user.role = "USER";
    await user.save();
    await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

    return sendSuccess(res, { userId: user._id, role: user.role }, 200, "Admin removed");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
