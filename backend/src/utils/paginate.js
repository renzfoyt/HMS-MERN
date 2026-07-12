/**
 * Shared pagination helper — replaces the identical page/limit/skip/
 * X-Total-Count block that was duplicated across the doctors, bookings,
 * and contacts admin-list controllers.
 *
 * @param {import("mongoose").Model} Model - Mongoose model to query
 * @param {Object} options
 * @param {Object} [options.query={}] - Mongoose filter, e.g. { status: "active" }
 * @param {Object} [options.sort={}] - Mongoose sort, e.g. { lastName: 1 }
 * @param {import("express").Request} options.req - used to read page/limit from req.query
 * @returns {Promise<{ items: any[], total: number, page: number, limit: number }>}
 */
export const paginate = async (Model, { query = {}, sort = {}, req }) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 1000, 1),
    1000,
  );

  const [items, total] = await Promise.all([
    Model.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Model.countDocuments(query),
  ]);

  return { items, total, page, limit };
};

export default paginate;