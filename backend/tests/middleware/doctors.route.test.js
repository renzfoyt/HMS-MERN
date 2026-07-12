// Rate limiter normally calls out to Upstash — replace with a no-op
// passthrough so route tests don't need a real Redis connection.
jest.mock("../../src/middleware/rateLimiter.js", () => {
  const passthrough = (req, res, next) => next();
  passthrough.authRateLimiter = (req, res, next) => next();
  return {
    __esModule: true,
    default: passthrough,
    authRateLimiter: (req, res, next) => next(),
  };
});

jest.mock("../../models/Doctor.js", () => {
  const DoctorMock = jest.fn();
  DoctorMock.findById = jest.fn();
  DoctorMock.find = jest.fn();
  return { Doctor: DoctorMock };
});

import request from "supertest";
import { createApp } from "../../src/app.js";
import { Doctor } from "../../models/Doctor.js";

const app = createApp();

describe("GET /api/doctors", () => {
  it("returns the active doctor list", async () => {
    const sortMock = jest.fn().mockResolvedValue([
      { _id: "doc1", firstName: "Jane", lastName: "Cruz", status: "active" },
    ]);
    Doctor.find.mockReturnValue({ sort: sortMock });

    const res = await request(app).get("/api/doctors");

    expect(res.status).toBe(200);
    expect(Doctor.find).toHaveBeenCalledWith({ status: "active" });
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/doctors/:id", () => {
  it("returns 404 for an id that doesn't exist", async () => {
    Doctor.findById.mockResolvedValue(null);

    const res = await request(app).get("/api/doctors/000000000000000000000000");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Doctor not found");
  });
});

describe("unmatched routes", () => {
  it("falls through to the 404 handler", async () => {
    const res = await request(app).get("/api/not-a-real-route");

    expect(res.status).toBe(404);
  });
});