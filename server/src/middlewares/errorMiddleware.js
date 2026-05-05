import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  // Log all errors server-side for debugging
  console.error("ERROR HANDLER:", err);

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    const maxUploadMb = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB) || 50;
    return res.status(413).json({
      success: false,
      message: `File too large. Maximum allowed size is ${maxUploadMb}MB.`
    });
  }

  if (err?.code === "INVALID_FILE_TYPE") {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Invalid file type"
    });
  }

  const statusCode = res.statusCode || 500;
  // Mask 5xx errors to prevent info leakage; clients never see raw error messages
  const clientMessage = statusCode >= 500 
    ? "An internal server error occurred. Please try again later." 
    : err.message || "An error occurred";

  res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
};
