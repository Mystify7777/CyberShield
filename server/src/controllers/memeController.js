import { validationResult } from "express-validator";
import Meme from "../models/Meme.js";
import { addXP } from "../utils/gamification.js";
import { addCoins, enforceActionCooldown, spendCoins } from "../utils/economy.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { incrementMetric, METRIC_KEYS } from "../utils/metrics.js";

const FLAG_MIN_TOTAL_VOTES = 20;
const FLAG_DOWNVOTE_RATIO = 1.5;

export const createMeme = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    if (!req.file) {
      return sendError(res, 400, "Meme image is required");
    }

    try {
      await spendCoins(req.user._id, "MEME_UPLOAD");
    } catch (economyError) {
      return sendError(res, 400, economyError.message);
    }

    const meme = await Meme.create({
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption,
      category: req.body.category || "FUN",
      createdBy: req.user._id
    });

    await addXP(req.user._id, "MEME_CREATED");
    await addCoins(req.user._id, "MEME_CREATED");

    return sendSuccess(res, meme, 201, "Meme uploaded");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getMemes = async (req, res) => {
  try {
    const sort = req.query.sort || "latest";

    let query = Meme.find({ status: "VISIBLE" }).populate("createdBy", "name alias");

    if (sort === "trending") {
      query = query.sort({ upvotes: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const memes = await query;
    return sendSuccess(res, memes);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const voteMeme = async (req, res) => {
  try {
    const { type } = req.body;

    if (!["up", "down"].includes(type)) {
      return sendError(res, 400, "Vote type must be 'up' or 'down'");
    }

    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return sendError(res, 404, "Meme not found");
    }

    if (!meme.votingEnabled) {
      return sendError(res, 403, "Voting is disabled for this meme");
    }

    if (meme.status !== "VISIBLE") {
      return sendError(res, 400, "You can only vote on visible memes");
    }

    const userId = req.user._id.toString();
    if (meme.createdBy?.toString() === userId) {
      return sendError(res, 403, "You cannot vote on your own meme");
    }

    const wasUpvoted = meme.upvotes.some((id) => id.toString() === userId);
    const wasDownvoted = meme.downvotes.some((id) => id.toString() === userId);

    const voteUnchanged = (type === "up" && wasUpvoted) || (type === "down" && wasDownvoted);
    if (voteUnchanged) {
      return sendSuccess(res, meme, 200, "Vote unchanged");
    }

    try {
      await enforceActionCooldown(req.user._id, "VOTE");
    } catch (economyError) {
      return sendError(res, 400, economyError.message);
    }

    if (type === "down") {
      try {
        await spendCoins(req.user._id, "DOWNVOTE");
      } catch (economyError) {
        return sendError(res, 400, economyError.message);
      }
    }

    meme.upvotes = meme.upvotes.filter((id) => id.toString() !== userId);
    meme.downvotes = meme.downvotes.filter((id) => id.toString() !== userId);

    if (type === "up") meme.upvotes.push(req.user._id);
    if (type === "down") meme.downvotes.push(req.user._id);

    const up = meme.upvotes.length;
    const down = meme.downvotes.length;
    const total = up + down;

    if (total >= FLAG_MIN_TOTAL_VOTES && down > up * FLAG_DOWNVOTE_RATIO) {
      meme.status = "FLAGGED";
    }

    await meme.save();

    await addXP(req.user._id, "MEME_VOTED");

    if (type === "up" && !wasUpvoted && meme.createdBy?.toString() !== userId) {
      await addXP(meme.createdBy, "MEME_LIKED");
      await addCoins(meme.createdBy, "MEME_LIKED");
    }

    return sendSuccess(res, meme, 200, "Vote recorded");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getFlaggedMemes = async (req, res) => {
  try {
    const memes = await Meme.find({ status: "FLAGGED" })
      .populate("createdBy", "name alias email")
      .sort({ updatedAt: -1 });

    return sendSuccess(res, memes);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const updateMeme = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return sendError(res, 404, "Meme not found");
    }

    const { status, votingEnabled, commentsEnabled } = req.body;

    if (status) meme.status = status;
    if (typeof votingEnabled === "boolean") meme.votingEnabled = votingEnabled;
    if (typeof commentsEnabled === "boolean") meme.commentsEnabled = commentsEnabled;

    await meme.save();
    await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

    return sendSuccess(res, meme, 200, "Meme updated");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};