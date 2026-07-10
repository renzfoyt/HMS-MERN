/**
 * Wraps an async route handler so any thrown/rejected error is forwarded
 * to Express's error-handling middleware (errorHandler.js) instead of
 * requiring a try/catch block in every controller function.
 *
 * Usage: export const getDoctors = asyncHandler(async (req, res) => { ... });
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;