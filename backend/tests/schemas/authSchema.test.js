import { loginSchema } from "../../src/schemas/authSchema.js";

describe("loginSchema", () => {
  it("accepts a valid username/password pair", () => {
    const result = loginSchema.safeParse({
      username: "admin",
      password: "hunter2",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing username", () => {
    const result = loginSchema.safeParse({ password: "hunter2" });

    expect(result.success).toBe(false);
  });

  it("rejects an empty-string username", () => {
    const result = loginSchema.safeParse({ username: "  ", password: "hunter2" });

    // username is trimmed, so whitespace-only fails the min(1) check
    expect(result.success).toBe(false);
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({ username: "admin" });

    expect(result.success).toBe(false);
  });
});