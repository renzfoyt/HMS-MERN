/**
 * Generic request-body validator. Pass it a zod schema and it becomes
 * Express middleware: on success it replaces req.body with the parsed
 * (and type-coerced/trimmed) data; on failure it responds 400 with a
 * field-by-field error list instead of letting bad data reach Mongoose.
 *
 * Usage: router.post("/booking", validate(bookingFormSchema), bookForm);
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "(root)",
      message: issue.message,
    }));

    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body = result.data;
  next();
};

export default validate;