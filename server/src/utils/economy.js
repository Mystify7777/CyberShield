import User from "../models/User.js";

export const COIN_RULES = {
  DAILY_LOGIN: 5,
  REPORT_CREATED: 10,
  MEME_CREATED: 5,
  MEME_LIKED: 2,
  GAME_CORRECT: 3
};

export const COST_RULES = {
  MEME_UPLOAD: 2,
  FORUM_POST: 1,
  COMMENT: 1,
  DOWNVOTE: 1
};

export const DAILY_COIN_CAP = 100;

const ACTION_COOLDOWNS_MS = {
  GAME_CORRECT: 10000,
  VOTE: 2000,
  MEME_UPLOAD: 30000
};

const ACTION_TIMESTAMP_FIELDS = {
  GAME_CORRECT: "game",
  VOTE: "vote",
  MEME_UPLOAD: "meme"
};

const resetDailyCoinsIfNeeded = (user) => {
  const now = new Date();
  const lastReset = user.lastCoinReset ? new Date(user.lastCoinReset) : null;

  const shouldReset =
    !lastReset ||
    lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
    lastReset.getUTCMonth() !== now.getUTCMonth() ||
    lastReset.getUTCDate() !== now.getUTCDate();

  if (shouldReset) {
    user.dailyCoins = 0;
    user.lastCoinReset = now;
  }
};

const applyActionCooldown = (user, action) => {
  const cooldownMs = Number(ACTION_COOLDOWNS_MS[action] || 0);
  const timestampField = ACTION_TIMESTAMP_FIELDS[action];
  if (cooldownMs <= 0 || !timestampField) return;

  user.lastActions = user.lastActions || {};
  const nowMs = Date.now();
  const lastMs = user.lastActions[timestampField]
    ? new Date(user.lastActions[timestampField]).getTime()
    : 0;

  if (nowMs - lastMs < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - (nowMs - lastMs)) / 1000);
    throw new Error(`Wait ${remainingSeconds}s before ${action.toLowerCase()}`);
  }

  user.lastActions[timestampField] = new Date(nowMs);
};

export const enforceActionCooldown = async (userId, action) => {
  if (!userId) throw new Error("User is required");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  resetDailyCoinsIfNeeded(user);
  applyActionCooldown(user, action);
  await user.save();

  return user;
};

export const addCoins = async (userId, action) => {
  if (!userId) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  resetDailyCoinsIfNeeded(user);
  applyActionCooldown(user, action);

  const toAdd = Number(COIN_RULES[action] || 0);
  if (toAdd <= 0) {
    await user.save();
    return user;
  }

  user.dailyCoins = Number(user.dailyCoins || 0);
  const remainingDaily = Math.max(0, DAILY_COIN_CAP - user.dailyCoins);

  if (remainingDaily <= 0) {
    await user.save();
    return user;
  }

  const progress = Math.min(1, user.dailyCoins / DAILY_COIN_CAP);
  const diminishingMultiplier = Math.max(0.2, 1 - progress * 0.8);
  const adjusted = Math.floor(toAdd * diminishingMultiplier);
  const finalReward = Math.min(remainingDaily, adjusted);

  if (finalReward <= 0) {
    await user.save();
    return user;
  }

  user.coins = Number(user.coins || 0) + finalReward;
  user.dailyCoins += finalReward;
  await user.save();
  return user;
};

export const spendCoins = async (userId, action) => {
  if (!userId) throw new Error("User is required");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  resetDailyCoinsIfNeeded(user);
  applyActionCooldown(user, action);

  const cost = Number(COST_RULES[action] || 0);
  if (cost <= 0) {
    await user.save();
    return user;
  }

  user.coins = Number(user.coins || 0);
  if (user.coins < cost) {
    throw new Error("Not enough coins");
  }

  user.coins -= cost;
  await user.save();
  return user;
};