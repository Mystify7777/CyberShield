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

export const sendError = (res, statusCode, message, errors, code) => {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  if (code) {
    payload.code = code;
  }

  return res.status(statusCode).json(payload);
};
