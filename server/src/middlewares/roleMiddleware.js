import { sendError } from "../utils/response.js";

export const adminOnly = (req, res, next) => {
  if (req.user && ["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    return next();
  }

  return sendError(
    res,
    403,
    "Admin access only",
    undefined,
    "ADMIN_REQUIRED"
  );
};

export const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "SUPER_ADMIN") {
    return next();
  }

  return sendError(
    res,
    403,
    "Super admin access only",
    undefined,
    "SUPER_ADMIN_REQUIRED"
  );
};
