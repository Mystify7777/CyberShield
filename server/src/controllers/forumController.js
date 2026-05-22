import ForumPost from "../models/ForumPost.js";
import { addXP } from "../utils/gamification.js";
import { spendCoins } from "../utils/economy.js";
import { sendError, sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const FORUM_PAGE_LIMIT_MAX = 50;

const getForumPagination = (query) => {
  const rawPage = Number.parseInt(query.page, 10);
  const rawLimit = Number.parseInt(query.limit, 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, FORUM_PAGE_LIMIT_MAX)
    : 10;

  return { page, limit };
};

export const createPost = asyncHandler(async (req, res) => {
    try {
      await spendCoins(req.user._id, "FORUM_POST");
    } catch (economyError) {
      return sendError(res, 400, economyError.message);
    }

    const post = await ForumPost.create({
      user: req.user._id,
      title: req.body.title,
      content: req.body.content
    });

    await addXP(req.user._id, "FORUM_POST");

    return sendSuccess(res, post, 201);
});

export const addReply = asyncHandler(async (req, res) => {
    try {
      await spendCoins(req.user._id, "COMMENT");
    } catch (economyError) {
      return sendError(res, 400, economyError.message);
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    post.replies.push({
      user: req.user._id,
      text: req.body.text
    });

    await post.save();
    return sendSuccess(res, post);
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const { page, limit } = getForumPagination(req.query);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    ForumPost.find()
      .populate("user", "name alias")
      .populate("replies.user", "name alias")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ForumPost.countDocuments()
  ]);

  return sendSuccess(res, {
    items: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      hasNextPage: page * limit < total
    }
  });
});

export const getMyPosts = asyncHandler(async (req, res) => {
  const { page, limit } = getForumPagination(req.query);
  const skip = (page - 1) * limit;
  const match = { user: req.user._id };

  const [posts, total] = await Promise.all([
    ForumPost.find(match)
      .populate("user", "name alias")
      .populate("replies.user", "name alias")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ForumPost.countDocuments(match)
  ]);

  return sendSuccess(res, {
    items: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      hasNextPage: page * limit < total
    }
  });
});
