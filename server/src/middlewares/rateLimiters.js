import rateLimit from "express-rate-limit";

// Shared JSON response
const buildMessage = (message, code) => ({
  success: false,
  message,
  code,
});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: buildMessage(
    "Too many login attempts. Please try again later.",
    "LOGIN_RATE_LIMIT"
  ),
});

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: buildMessage(
    "Too many registration attempts.",
    "REGISTER_RATE_LIMIT"
  ),
});

// ─────────────────────────────────────────────
// PASSWORD RESET REQUEST
// ─────────────────────────────────────────────
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: buildMessage(
    "Too many password reset attempts.",
    "RESET_RATE_LIMIT"
  ),
});

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: buildMessage(
    "Too many password reset submissions.",
    "RESET_SUBMISSION_RATE_LIMIT"
  ),
});

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────
export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,

  standardHeaders: true,
  legacyHeaders: false,

  message: buildMessage(
    "Too many refresh attempts.",
    "REFRESH_RATE_LIMIT"
  ),
});

// ─────────────────────────────────────────────
// OTP RESEND
// ─────────────────────────────────────────────
export const resendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: buildMessage(
    "Too many OTP resend attempts.",
    "OTP_RATE_LIMIT"
  ),
});