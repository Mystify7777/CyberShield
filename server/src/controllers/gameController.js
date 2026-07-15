import { validationResult } from "express-validator";
import User from "../models/User.js";
import { addXP } from "../utils/gamification.js";
import { addCoins } from "../utils/economy.js";
import { sendError, sendSuccess } from "../utils/response.js";

const GAME_COOLDOWN_MS = 10000;

export const rewardGame = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const { correct } = req.body;

    if (!correct) {
      return sendSuccess(res, { rewarded: false }, 200, "Answer recorded");
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
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
