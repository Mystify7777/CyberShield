import multer from "multer";
import { logError } from "../utils/logger.js";

const INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error";
const INVALID_JSON_MESSAGE = "Invalid JSON payload";

const getErrorStatusCode = (err) => {
  const statusCode = Number(err?.status || err?.statusCode);

  if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600) {
    return statusCode;
  }

  return 500;
};

const getSafeErrorResponse = (err, statusCode) => {
  if (err?.type === "entity.parse.failed") {
    return {
      message: INVALID_JSON_MESSAGE,
      code: "INVALID_JSON"
    };
  }

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    const maxUploadMb = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB) || 50;

    return {
      message: `File too large. Maximum allowed size is ${maxUploadMb}MB.`,
      code: "FILE_TOO_LARGE"
    };
  }

  if (err?.code === "INVALID_FILE_TYPE") {
    return {
      message: "Invalid file type",
      code: "INVALID_FILE_TYPE"
    };
  }

  if (statusCode >= 500) {
    return {
      message: INTERNAL_SERVER_ERROR_MESSAGE,
      code: "INTERNAL_SERVER_ERROR"
    };
  }

  if (err?.expose === true && typeof err.message === "string" && err.message.trim()) {
    return {
      message: err.message,
      ...(err.type ? { code: err.type } : {})
    };
  }

  return {
    message: "Request failed",
    ...(err?.type ? { code: err.type } : {})
  };
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = getErrorStatusCode(err);
  const response = getSafeErrorResponse(err, statusCode);

  if (statusCode >= 500) {
    logError("HTTP", "Unhandled request error", {
      method: req.method,
      path: req.originalUrl,
      error: err?.message,
      stack: err?.stack
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: response.message,
    code: response.code
  });
};
