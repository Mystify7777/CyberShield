import User from "../models/User.js";

export const XP_RULES = {
  REPORT_CREATED: 20,
  ARTICLE_CREATED: 30,
  AI_USED: 5,
  FORUM_POST: 10,
  DAILY_LOGIN: 2,
  MEME_CREATED: 10,
  MEME_LIKED: 2,
  MEME_VOTED: 1,
  GAME_CORRECT: 5
};

export const calculateLevel = (xp) => Math.floor(xp / 100) + 1;

const hasBadge = (user, badgeName) =>
  Array.isArray(user.badges) && user.badges.some((badge) => badge.name === badgeName);

const checkBadges = (user) => {
  if (!Array.isArray(user.badges)) {
    user.badges = [];
  }

  const earned = [];

  if (user.xp >= 100 && !hasBadge(user, "Rookie")) {
    earned.push("Rookie");
  }

  if (user.xp >= 50 && !hasBadge(user, "Meme Starter")) {
    earned.push("Meme Starter");
  }

  if (user.xp >= 150 && !hasBadge(user, "Meme Lord")) {
    earned.push("Meme Lord");
  }

  if (Number(user.streak || 0) >= 5 && !hasBadge(user, "Consistent")) {
    earned.push("Consistent");
  }

  if (user.xp >= 300 && !hasBadge(user, "Cyber Warrior")) {
    earned.push("Cyber Warrior");
  }

  if (user.xp >= 500 && !hasBadge(user, "Elite Defender")) {
    earned.push("Elite Defender");
  }

  earned.forEach((name) => {
    user.badges.push({ name });
  });

  return earned;
};

export const addXP = async (userId, action) => {
  if (!userId) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const xpToAdd = XP_RULES[action] || 0;
  if (xpToAdd <= 0) return user;

  user.xp = Number(user.xp || 0) + xpToAdd;
  user.level = Number(user.level || 1);

  const newLevel = calculateLevel(user.xp);
  if (newLevel > user.level) {
    user.level = newLevel;
  }

  checkBadges(user);
  await user.save();

  return user;
};
