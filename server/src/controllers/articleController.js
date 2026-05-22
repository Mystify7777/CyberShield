import Article from "../models/Article.js";
import { validationResult } from "express-validator";
import Notification from "../models/Notification.js";
import { addXP } from "../utils/gamification.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { incrementMetric, METRIC_KEYS } from "../utils/metrics.js";
import asyncHandler from "../utils/asyncHandler.js";

const ARTICLE_PAGE_LIMIT_MAX = 50;

const getArticlePagination = (query) => {
  const rawPage = Number.parseInt(query.page, 10);
  const rawLimit = Number.parseInt(query.limit, 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, ARTICLE_PAGE_LIMIT_MAX)
    : 10;

  return { page, limit };
};

// Create Article (Any authenticated user)
export const createArticle = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const { title, content, category, tags } = req.body;

  const normalizedTags = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];

  const cleanedTags = [...new Set(
    normalizedTags
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  )];

  const article = await Article.create({
    title,
    content,
    category,
    tags: cleanedTags,
    createdBy: req.user._id,
    status: "PENDING"
  });

  await Notification.create({
    message: "New article submitted for review",
    type: "ARTICLE"
  });

  await addXP(req.user._id, "ARTICLE_CREATED");

  return sendSuccess(res, article, 201);
});

// Get All Approved Articles (Public)
export const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({ status: "APPROVED" })
    .populate("createdBy", "name alias")
    .sort({ createdAt: -1 });

  return sendSuccess(res, articles);
});

// Get current user's own articles
export const getMyArticles = asyncHandler(async (req, res) => {
  const { page, limit } = getArticlePagination(req.query);
  const match = { createdBy: req.user._id };
  const total = await Article.countDocuments(match);

  const articles = await Article.find(match)
    .select("title category tags status createdAt updatedAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return sendSuccess(res, {
    items: articles,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page * limit < total
    }
  });
});

// Get Single Article
export const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id)
    .populate("createdBy", "name alias");

  if (!article || (article.status !== "APPROVED")) {
    return sendError(res, 404, "Article not found");
  }

  await incrementMetric(METRIC_KEYS.ARTICLE_VIEWS);

  return sendSuccess(res, article);
});

// Get Pending Articles (Admin only)
export const getPendingArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({ status: "PENDING" })
    .populate("createdBy", "name alias email")
    .sort({ createdAt: -1 });

  return sendSuccess(res, articles);
});

// Update Article Status (Admin only)
export const updateArticleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return sendError(res, 400, "Invalid status");
  }

  const article = await Article.findById(req.params.id);

  if (!article) {
    return sendError(res, 404, "Article not found");
  }

  article.status = status;
  await article.save();

  await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

  return sendSuccess(res, article);
});

// Vote Article (Any authenticated user)
export const voteArticle = asyncHandler(async (req, res) => {
  const { type } = req.body;

  if (!['up', 'down'].includes(type)) {
    return sendError(res, 400, "Vote type must be 'up' or 'down'");
  }

  const article = await Article.findById(req.params.id);

  if (!article || article.status !== "APPROVED") {
    return sendError(res, 404, "Article not found");
  }

  const userId = req.user._id.toString();
  if (article.createdBy?.toString() === userId) {
    return sendError(res, 403, "You cannot vote on your own article");
  }

  const hasUpvoted = article.upvotes.some((id) => id.toString() === userId);
  const hasDownvoted = article.downvotes.some((id) => id.toString() === userId);

  article.upvotes = article.upvotes.filter((id) => id.toString() !== userId);
  article.downvotes = article.downvotes.filter((id) => id.toString() !== userId);

  // Clicking the same vote again removes the vote, otherwise it switches vote.
  if ((type === "up" && !hasUpvoted) || (type === "down" && !hasDownvoted)) {
    if (type === "up") article.upvotes.push(req.user._id);
    if (type === "down") article.downvotes.push(req.user._id);
  }

  await article.save();

  const payload = {
    _id: article._id,
    upvoteCount: article.upvotes.length,
    downvoteCount: article.downvotes.length,
    userVote:
      article.upvotes.some((id) => id.toString() === userId)
        ? "up"
        : article.downvotes.some((id) => id.toString() === userId)
          ? "down"
          : null
  };

  return sendSuccess(res, payload, 200, "Vote updated");
});
