import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/response.js";

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Clean trust boundary semantics: fetch, validate, THEN assign to request
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, 401, "Not authorized", undefined, "AUTH_REQUIRED");
    }

    if (user.isSuspended) {
      console.warn("[AUTH_MIDDLEWARE] Suspended user access attempt", {
        userId: String(user._id),
      });
      return sendError(res, 403, "Account suspended", undefined, "ACCOUNT_SUSPENDED");
    }

    // Only mutate the request object once validation is fully complete
    req.user = user;
    return next();

  } catch (error) {
    console.warn("[AUTH_MIDDLEWARE] Invalid token", {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      if (user.isSuspended) {
        console.warn("[AUTH_MIDDLEWARE] Suspended optional auth attempt", {
          userId: String(user._id),
        });
        return next();
      }

      req.user = user;
    }
  } catch (error) {
    // Closes the observability blind spot while keeping the endpoint public
    console.warn("[AUTH_MIDDLEWARE] Optional auth token invalid", {
      message: error.message,
    });
  }

  return next();
};
