export const sendSuccess = (
  res,
  data,
  statusCode = 200,
  message,
  meta = undefined
) => {
  const payload = {
    success: true,
    data,
  };

  if (message) {
    payload.message = message;
  }

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res,
  statusCode,
  message,
  errors = undefined,
  code = undefined
) => {
  const payload = {
    success: false,
    // Mask internal error details for 5xx errors (never expose raw error messages to clients)
    message:
      statusCode >= 500
        ? "An internal server error occurred. Please try again later."
        : message,
  };

  // Semantic identity goes first
  if (code) {
    payload.code = code;
  }

  // Granular validation details go second
  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
