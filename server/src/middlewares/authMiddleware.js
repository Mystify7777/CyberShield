import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/response.js";
import { logWarn } from "../utils/logger.js";

const JWT_VERIFY_OPTIONS = {
  issuer: process.env.JWT_ISSUER || "cybershield",
  algorithms: ["HS256"]
};

// ─────────────────────────────────────────────
// HELPER: ROBUST TOKEN EXTRACTION
// ─────────────────────────────────────────────
const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  // Case-insensitive check handles "Bearer", "bearer", "BEARER"
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

// ─────────────────────────────────────────────
// STRICT PROTECT
// ─────────────────────────────────────────────
export const protect = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return sendError(res, 401, "No token provided", undefined, "TOKEN_MISSING");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, JWT_VERIFY_OPTIONS);

    if (decoded?.tokenType && decoded.tokenType !== "access") {
      logWarn("AUTH_MIDDLEWARE", "Unexpected token type in protected route", {
        tokenType: decoded.tokenType,
      });
      return sendError(res, 401, "Not authorized", undefined, "AUTH_REQUIRED");
    }

    // Clean trust boundary semantics: fetch, validate, THEN assign to request
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, 401, "Not authorized", undefined, "AUTH_REQUIRED");
    }

    if (user.isSuspended) {
      logWarn("AUTH_MIDDLEWARE", "Suspended user access attempt", {
        userId: String(user._id),
      });
      return sendError(res, 403, "Account suspended", undefined, "ACCOUNT_SUSPENDED");
    }

    // Only mutate the request object once validation is fully complete
    req.user = user;
    return next();

  } catch (error) {
    logWarn("AUTH_MIDDLEWARE", "Invalid token", {
      message: error.message,
    });
    return sendError(res, 401, "Not authorized", undefined, "AUTH_REQUIRED");
  }
};

// ─────────────────────────────────────────────
// OPTIONAL PROTECT
// ─────────────────────────────────────────────
export const optionalProtect = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, JWT_VERIFY_OPTIONS);

    if (decoded?.tokenType && decoded.tokenType !== "access") {
      logWarn("AUTH_MIDDLEWARE", "Unexpected token type in optional auth", {
        tokenType: decoded.tokenType,
      });
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      if (user.isSuspended) {
        logWarn("AUTH_MIDDLEWARE", "Suspended optional auth attempt", {
          userId: String(user._id),
        });
        return next();
      }

      req.user = user;
    }
  } catch (error) {
    // Closes the observability blind spot while keeping the endpoint public
    logWarn("AUTH_MIDDLEWARE", "Optional auth token invalid", {
      message: error.message,
    });
  }

  return next();
};
