import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import { validationResult } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { sendEmail } from "../utils/sendEmail.js";
import { addXP } from "../utils/gamification.js";
import { addCoins } from "../utils/economy.js";
import { clearRefreshTokenCookie, getRefreshTokenFromRequest, setRefreshTokenCookie } from "../utils/authCookies.js";
import { logError, logInfo, logWarn, maskEmail } from "../utils/logger.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const getOtpHashSecret = () => {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret) {
    throw new Error("OTP_HASH_SECRET missing");
  }

  return secret;
};
const hashOtp = (otp) => crypto.createHmac("sha256", getOtpHashSecret()).update(String(otp)).digest("hex");

const buildClientUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isSuspended: user.isSuspended,
  xp: user.xp,
  level: user.level,
  streak: user.streak,
  coins: user.coins,
  dailyCoins: user.dailyCoins,
  badges: user.badges,
  alias: user.alias,
  bio: user.bio
});

const issueSession = async (res, user, message = "Login successful") => {
  const sessionUser = await User.findById(user._id);

  if (!sessionUser) {
    return sendError(res, 404, "User not found");
  }

  sessionUser.refreshTokenVersion = Number(sessionUser.refreshTokenVersion || 0) + 1;
  await sessionUser.save();

  const accessToken = generateToken(sessionUser._id);
  const refreshToken = generateRefreshToken(sessionUser._id, sessionUser.refreshTokenVersion);

  setRefreshTokenCookie(res, refreshToken);

  return sendSuccess(res, {
    user: buildClientUser(sessionUser),
    accessToken
  }, 200, message);
};

const clearSessionCookie = (res) => {
  clearRefreshTokenCookie(res);
};

const rotateRefreshToken = async (user) => {
  user.refreshTokenVersion = Number(user.refreshTokenVersion || 0) + 1;
  await user.save();

  return generateRefreshToken(user._id, user.refreshTokenVersion);
};
// Register
export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (!existingUser.isVerified) {
        await existingUser.deleteOne();
      } else {
        return sendError(res, 400, "User already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      verificationOTPHash: hashedOtp,
      otpExpires: otpExpiry,
      failedOtpAttempts: 0
    });

    await sendEmail(
      normalizedEmail,
      "Verify your account",
      `Your OTP is: ${otp}. It expires in 10 minutes.`
    );

    logInfo("AUTH", "Registration OTP dispatched", {
      email: maskEmail(normalizedEmail),
      userId: String(user._id)
    });

    return sendSuccess(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }, 201);
  } catch (error) {
    logError("AUTH", "registerUser error", error?.message || error);
    return sendError(res, 500, error.message);
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.isVerified) {
      return sendError(res, 400, "Account already verified");
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.verificationOTPHash = hashOtp(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.failedOtpAttempts = 0;
    await user.save();

    await sendEmail(normalizedEmail, "Resend OTP", `Your OTP is: ${otp}. It expires in 10 minutes.`);

    logInfo("AUTH", "OTP resent", {
      email: maskEmail(normalizedEmail),
      userId: String(user._id)
    });

    return sendSuccess(res, { resent: true }, 200, "OTP resent");
  } catch (error) {
    logError("AUTH", "resendOTP error", error?.message || error);
    return sendError(res, 500, error.message);
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    const maxAttempts = 5;
    const submittedOtpHash = hashOtp(otp);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.failedOtpAttempts >= maxAttempts) {
      return sendError(
        res,
        403,
        "Too many attempts. Please request a new OTP",
        [{ attemptsRemaining: 0 }]
      );
    }

    const isOtpValid = Boolean(user.verificationOTPHash) && user.verificationOTPHash === submittedOtpHash;
    const isOtpExpired = !user.otpExpires || user.otpExpires < Date.now();

    if (!isOtpValid || isOtpExpired) {
      user.failedOtpAttempts += 1;
      await user.save();

      const attemptsRemaining = Math.max(0, maxAttempts - user.failedOtpAttempts);

      logWarn("AUTH", "OTP verification failed", {
        email: maskEmail(normalizedEmail),
        attemptsRemaining,
        expired: isOtpExpired
      });

      if (user.failedOtpAttempts >= maxAttempts) {
        return sendError(
          res,
          403,
          "Too many attempts. Please request a new OTP",
          [{ attemptsRemaining }]
        );
      }

      return sendError(res, 400, "Invalid or expired OTP", [{ attemptsRemaining }]);
    }

    user.isVerified = true;
    user.verificationOTPHash = null;
    user.otpExpires = null;
    user.failedOtpAttempts = 0;
    await user.save();

    logInfo("AUTH", "OTP verified", {
      email: maskEmail(normalizedEmail),
      userId: String(user._id)
    });

    return sendSuccess(res, { verified: true, attemptsRemaining: maxAttempts }, 200, "Account verified");
  } catch (error) {
    logError("AUTH", "verifyOTP error", error?.message || error);
    return sendError(res, 500, error.message);
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) {
        return sendError(res, 403, "Please verify your email first");
      }

      if (user.isSuspended) {
        return sendError(res, 403, "Account suspended");
      }

      const now = new Date();
      const today = now.toDateString();
      const lastDate = user.lastActive ? new Date(user.lastActive) : null;
      const lastDay = lastDate ? lastDate.toDateString() : null;
      user.streak = Number(user.streak || 0);

      if (today !== lastDay) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDay === yesterday.toDateString()) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }

        user.lastActive = now;
        await user.save();
        await addXP(user._id, "DAILY_LOGIN");
        await addCoins(user._id, "DAILY_LOGIN");
      }

      if (!user.lastActive) {
        user.lastActive = now;
        await user.save();
      }

      return issueSession(res, user, "Login successful");
    } else {
      return sendError(res, 401, "Invalid credentials");
    }
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const refreshSession = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      return sendError(res, 401, "No refresh token provided");
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      clearSessionCookie(res);
      return sendError(res, 401, "Not authorized");
    }

    if (user.isSuspended) {
      clearSessionCookie(res);
      return sendError(res, 403, "Account suspended");
    }

    if (Number(decoded.version) !== Number(user.refreshTokenVersion || 0)) {
      clearSessionCookie(res);
      return sendError(res, 401, "Not authorized");
    }

    const nextRefreshToken = await rotateRefreshToken(user);
    const accessToken = generateToken(user._id);

    setRefreshTokenCookie(res, nextRefreshToken);

    return sendSuccess(res, {
      user: buildClientUser(user),
      accessToken
    }, 200, "Session refreshed");
  } catch (error) {
    clearSessionCookie(res);
    return sendError(res, 401, "Not authorized");
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (user && Number(decoded.version) === Number(user.refreshTokenVersion || 0)) {
          user.refreshTokenVersion = Number(user.refreshTokenVersion || 0) + 1;
          await user.save();
        }
      } catch {
        // Logout should still succeed even if the refresh token is expired or malformed.
      }
    }

    clearSessionCookie(res);
    return sendSuccess(res, { loggedOut: true }, 200, "Logged out");
  } catch (error) {
    clearSessionCookie(res);
    return sendError(res, 500, error.message);
  }
};

// Forgot Password (request reset token)
export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    // Avoid account enumeration by returning success either way
    if (!user) {
      return sendSuccess(
        res,
        { requested: true },
        200,
        "If the account exists, a reset token has been sent"
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendEmail(
      normalizedEmail,
      "CyberShield Password Reset",
      `Use this reset token to set a new password: ${resetToken}. It expires in 15 minutes.`
    );

    logInfo("AUTH", "Password reset token dispatched", {
      email: maskEmail(normalizedEmail),
      userId: String(user._id)
    });

    return sendSuccess(
      res,
      { requested: true },
      200,
      "If the account exists, a reset token has been sent"
    );
  } catch (error) {
    logError("AUTH", "forgotPassword error", error?.message || error);
    return sendError(res, 500, error.message);
  }
};

// Reset Password (using token)
/**
 * SECURITY NOTE:
 * Password reset must NOT modify moderation state (for example isSuspended).
 * Moderation flags are controlled only via admin flows.
 */
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "Validation failed", errors.array());
    }

    // Defensive guard: auth flows should never accept moderation or role fields.
    ["isSuspended", "role", "isVerified", "coins", "xp"].forEach((blockedField) => {
      if (Object.prototype.hasOwnProperty.call(req.body, blockedField)) {
        delete req.body[blockedField];
      }
    });

    const { email, token, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendError(res, 400, "Invalid or expired reset token");
    }

    if (user.isSuspended) {
      logWarn("AUTH_SECURITY", "Suspended user attempted password reset", {
        email: maskEmail(normalizedEmail)
      });
    }

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== tokenHash ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < Date.now()
    ) {
      return sendError(res, 400, "Invalid or expired reset token");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.failedOtpAttempts = 0;
    await user.save();

    logInfo("AUTH", "Password reset successful", {
      email: maskEmail(normalizedEmail),
      userId: String(user._id)
    });

    return sendSuccess(res, { reset: true }, 200, "Password reset successful");
  } catch (error) {
    logError("AUTH", "resetPassword error", error?.message || error);
    return sendError(res, 500, error.message);
  }
};

export const validateToken = async (req, res) => {
  return sendSuccess(res, {
    valid: true,
    user: buildClientUser(req.user)
  });
};
