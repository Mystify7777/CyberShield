export const sendSuccess = (res, data, statusCode = 200, message) => {
  const payload = {
    success: true,
    data
  };

  if (message) {
    payload.message = message;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (res, statusCode, message, errors) => {
  const payload = {
    success: false,
    // Mask internal error details for 5xx errors (never expose raw error messages to clients)
    message: statusCode >= 500 ? "An internal server error occurred. Please try again later." : message
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
