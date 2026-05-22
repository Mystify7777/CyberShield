import { validationResult } from "express-validator";
import User from "../models/User.js";
import { addXP } from "../utils/gamification.js";
import { addCoins } from "../utils/economy.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { validateAnswer, getPublicQuestions } from "../data/phishingQuestionBank.js";
import asyncHandler from "../utils/asyncHandler.js";

const GAME_COOLDOWN_MS = 10000;

export const getQuestions = asyncHandler(async (req, res) => {
  const questions = getPublicQuestions();
  return sendSuccess(res, { questions }, 200, "Questions retrieved");
});

export const rewardGame = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const { questionId, answerId } = req.body;

  // Validate that the submitted answer is correct server-side
  const validation = validateAnswer(questionId, answerId);
  if (!validation.valid) {
    return sendSuccess(res, { rewarded: false }, 200, validation.error);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const nowMs = Date.now();
  const lastPlayedMs = user.lastPlayedGame ? new Date(user.lastPlayedGame).getTime() : 0;

  if (nowMs - lastPlayedMs < GAME_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((GAME_COOLDOWN_MS - (nowMs - lastPlayedMs)) / 1000);
    return sendError(res, 400, `Wait ${waitSeconds}s before retrying`);
  }

  user.lastPlayedGame = new Date(nowMs);
  await user.save();

  await addXP(req.user._id, "GAME_CORRECT");

  try {
    await addCoins(req.user._id, "GAME_CORRECT");
  } catch (economyError) {
    // XP should still count even if coins are blocked by economy controls.
  }

  return sendSuccess(res, { rewarded: true }, 200, "Reward processed");
});
