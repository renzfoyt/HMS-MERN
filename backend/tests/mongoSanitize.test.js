import mongoSanitize from "express-mongo-sanitize";

const runMiddleware = (req) =>
  new Promise((resolve) => {
    mongoSanitize()(req, {}, () => resolve(req));
  });

describe("mongoSanitize middleware", () => {
  it("strips $-prefixed operator keys from req.body", async () => {
    const req = {
      body: { username: { $gt: "" }, password: "whatever" },
      query: {},
      params: {},
    };

    const sanitized = await runMiddleware(req);

    expect(sanitized.body.username).toEqual({});
    expect(sanitized.body.password).toBe("whatever");
  });

  it("strips dotted keys that could reach into nested fields", async () => {
    const req = {
      body: { "profile.isAdmin": true, name: "Jane" },
      query: {},
      params: {},
    };

    const sanitized = await runMiddleware(req);

    expect(sanitized.body["profile.isAdmin"]).toBeUndefined();
    expect(sanitized.body.name).toBe("Jane");
  });

  it("leaves an already-clean payload untouched", async () => {
    const req = {
      body: { username: "admin", password: "hunter2" },
      query: {},
      params: {},
    };

    const sanitized = await runMiddleware(req);

    expect(sanitized.body).toEqual({ username: "admin", password: "hunter2" });
  });
});