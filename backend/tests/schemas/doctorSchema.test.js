import {
  createDoctorSchema,
  updateDoctorSchema,
} from "../../src/schemas/doctorSchema.js";

const validDoctor = {
  firstName: "Jane",
  lastName: "Cruz",
  specialty: "Cardiology",
  department: "Internal Medicine",
};

describe("createDoctorSchema", () => {
  it("accepts a minimal valid doctor", () => {
    const result = createDoctorSchema.safeParse(validDoctor);

    expect(result.success).toBe(true);
  });

  it("rejects when required fields are missing", () => {
    const result = createDoctorSchema.safeParse({ firstName: "Jane" });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid photoUrl", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      photoUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });

  it("accepts an empty-string photoUrl (treated as not-yet-filled-in)", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      photoUrl: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a contactNumber that isn't an 11-digit PH mobile number", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      contactNumber: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid clinicDays entry", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      clinicDays: ["Mon", "Someday"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid status value", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      status: "on-leave",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateDoctorSchema", () => {
  it("accepts a partial update with just one field", () => {
    const result = updateDoctorSchema.safeParse({ status: "inactive" });

    expect(result.success).toBe(true);
  });

  it("accepts an empty object (no-op update)", () => {
    const result = updateDoctorSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("still enforces field-level rules when a field is present", () => {
    const result = updateDoctorSchema.safeParse({ email: "not-an-email" });

    expect(result.success).toBe(false);
  });
});