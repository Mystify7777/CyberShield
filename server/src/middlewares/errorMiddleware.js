import multer from "multer";
import { sendError } from "../utils/response.js";
import { logError } from "../utils/logger.js";

export const globalErrorHandler = (err, req, res, next) => {
  logError("GLOBAL_ERROR", "Unhandled request error", {
    type: err.type || "UNKNOWN",
    message: err.message,
    stack:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.stack,
  });

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    const maxUploadMb = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB) || 50;
    return sendError(
      res,
      413,
      `File too large. Maximum allowed size is ${maxUploadMb}MB.`,
      undefined,
      "FILE_TOO_LARGE"
    );
  }

  if (err?.code === "INVALID_FILE_TYPE") {
    return sendError(
      res,
      err.statusCode || 400,
      err.message || "Invalid file type",
      undefined,
      "INVALID_FILE_TYPE"
    );
  }

  const status = err.status || 500;

  return sendError(
    res,
    status,
    err.message || "Internal server error",
    undefined,
    err.type || "INTERNAL_ERROR"
  );
};

export const errorHandler = globalErrorHandler;
