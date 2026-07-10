import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Admin } from "../../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @typedef {Object} LoginRequestBody
 * @property {string} username
 * @property {string} password
 */

/**
 * Admin login — checks credentials, returns a JWT if valid.
 * username/password presence is already guaranteed by the loginSchema
 * validation middleware, so this only handles the "do they match" logic.
 * @param {import("express").Request<{}, {}, LoginRequestBody>} req
 * @param {import("express").Response} res
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: admin._id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "2 h" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
  });
});