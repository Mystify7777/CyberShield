// Wraps an async Express handler so rejected promises are forwarded to
// next(err) instead of crashing the process or hanging the request.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
