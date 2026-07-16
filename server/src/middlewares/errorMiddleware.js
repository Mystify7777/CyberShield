import multer from "multer";

export const errorHandler = (err, req, res, next) => {
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

  const statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    ...(err.type ? { code: err.type } : {})
  });
};
