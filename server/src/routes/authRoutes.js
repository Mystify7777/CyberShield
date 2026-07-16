import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  validateToken
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const parsePositiveNumber = (rawValue, fallback) => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const authRegisterWindowMs = parsePositiveNumber(process.env.AUTH_REGISTER_WINDOW_MS, 60 * 60 * 1000);
const authRegisterMax = parsePositiveNumber(process.env.AUTH_REGISTER_MAX, 5);
const authLoginWindowMs = parsePositiveNumber(process.env.AUTH_LOGIN_WINDOW_MS, 15 * 60 * 1000);
const authLoginMax = parsePositiveNumber(process.env.AUTH_LOGIN_MAX, 10);
const authResendOtpWindowMs = parsePositiveNumber(process.env.AUTH_RESEND_OTP_WINDOW_MS, 60 * 60 * 1000);
const authResendOtpMax = parsePositiveNumber(process.env.AUTH_RESEND_OTP_MAX, 3);
const authVerifyOtpWindowMs = parsePositiveNumber(process.env.AUTH_VERIFY_OTP_WINDOW_MS, 15 * 60 * 1000);
const authVerifyOtpMax = parsePositiveNumber(process.env.AUTH_VERIFY_OTP_MAX, 10);
const authForgotPasswordWindowMs = parsePositiveNumber(process.env.AUTH_FORGOT_PASSWORD_WINDOW_MS, 60 * 60 * 1000);
const authForgotPasswordMax = parsePositiveNumber(process.env.AUTH_FORGOT_PASSWORD_MAX, 5);
const authResetPasswordWindowMs = parsePositiveNumber(process.env.AUTH_RESET_PASSWORD_WINDOW_MS, 60 * 60 * 1000);
const authResetPasswordMax = parsePositiveNumber(process.env.AUTH_RESET_PASSWORD_MAX, 5);

const createAuthLimiter = (windowMs, max, actionLabel) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: `Too many ${actionLabel} attempts. Please try again later.`
  }
});

const registerLimiter = createAuthLimiter(authRegisterWindowMs, authRegisterMax, "registration");
const loginLimiter = createAuthLimiter(authLoginWindowMs, authLoginMax, "login");
const resendOtpLimiter = createAuthLimiter(authResendOtpWindowMs, authResendOtpMax, "OTP resend");
const verifyOtpLimiter = createAuthLimiter(authVerifyOtpWindowMs, authVerifyOtpMax, "OTP verification");
const forgotPasswordLimiter = createAuthLimiter(authForgotPasswordWindowMs, authForgotPasswordMax, "password reset request");
const resetPasswordLimiter = createAuthLimiter(authResetPasswordWindowMs, authResetPasswordMax, "password reset");

const emailChain = () => body("email")
  .isEmail()
  .withMessage("Valid email required")
  .customSanitizer((value) => String(value).trim().toLowerCase());

router.post(
  "/register",
  registerLimiter,
  [
    body("name").trim().escape().notEmpty().withMessage("Name is required"),
    emailChain(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  registerUser
);

router.post(
  "/login",
  loginLimiter,
  [
    emailChain(),
    body("password").notEmpty().withMessage("Password required")
  ],
  loginUser
);

router.post(
  "/verify-otp",
  verifyOtpLimiter,
  [
    emailChain(),
    body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("Valid 6-digit OTP required")
  ],
  verifyOTP
);

router.post(
  "/resend-otp",
  resendOtpLimiter,
  [
    emailChain()
  ],
  resendOTP
);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  [emailChain()],
  forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  [
    emailChain(),
    body("token")
      .trim()
      .notEmpty()
      .withMessage("Reset token required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
  ],
  resetPassword
);

router.get("/validate", protect, validateToken);

export default router;
