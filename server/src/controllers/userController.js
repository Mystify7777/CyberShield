import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import Report from "../models/Report.js";
import Article from "../models/Article.js";
import ForumPost from "../models/ForumPost.js";
import { sendError, sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const [reports, articles, posts] = await Promise.all([
    Report.countDocuments({ user: req.user._id }),
    Article.countDocuments({ createdBy: req.user._id }),
    ForumPost.countDocuments({ user: req.user._id })
  ]);

  const recentReports = await Report.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(6)
    .select("title category status createdAt");

  return sendSuccess(res, {
    user: {
      _id: user._id,
      name: user.name,
      alias: user.alias,
      email: user.email,
      bio: user.bio,
      coins: user.coins,
      dailyCoins: user.dailyCoins,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges
    },
    stats: {
      reports,
      articles,
      posts
    },
    recentReports
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const { alias, bio } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  if (typeof alias === "string") {
    const nextAlias = alias.trim();

    if (nextAlias) {
      const aliasOwner = await User.findOne({
        alias: nextAlias,
        _id: { $ne: user._id }
      });

      if (aliasOwner) {
        return sendError(res, 400, "Alias already in use");
      }

      user.alias = nextAlias;
    }
  }

  if (typeof bio === "string") {
    user.bio = bio.trim();
  }

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return sendSuccess(res, { user: safeUser }, 200, "Profile updated");
});

export const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return sendError(res, 400, "Incorrect current password");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return sendSuccess(res, { changed: true }, 200, "Password updated");
});

export const deleteOwnAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  await Promise.all([
    Report.deleteMany({ user: userId }),
    Article.deleteMany({ createdBy: userId }),
    ForumPost.deleteMany({ user: userId }),
    ForumPost.updateMany({}, { $pull: { replies: { user: userId } } }),
    User.findByIdAndDelete(userId)
  ]);

  return sendSuccess(res, { deleted: true }, 200, "Account deleted");
});
