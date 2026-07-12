import {
  contactFormSchema,
  bookingFormSchema,
  updateStatusSchema,
} from "../../src/schemas/formSchema.js";

describe("contactFormSchema", () => {
  const validContact = {
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    mobileNum: "09171234567",
    message: "Hello, I have a question.",
  };

  it("accepts a valid contact submission", () => {
    expect(contactFormSchema.safeParse(validContact).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a mobile number that isn't a valid PH format", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      mobileNum: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = contactFormSchema.safeParse({ ...validContact, message: "" });

    expect(result.success).toBe(false);
  });
});

describe("bookingFormSchema", () => {
  const validBooking = {
    department: "Cardiology",
    service: "Consultation",
    preferredDate: "2026-08-01",
    preferredTime: "10:00 AM",
    firstName: "Juan",
    lastName: "Dela Cruz",
    mobileNum: "09171234567",
    email: "juan@example.com",
  };

  it("accepts a valid booking without the optional message", () => {
    expect(bookingFormSchema.safeParse(validBooking).success).toBe(true);
  });

  it("accepts a valid booking with an optional message", () => {
    const result = bookingFormSchema.safeParse({
      ...validBooking,
      message: "First time visiting.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid preferredDate", () => {
    const result = bookingFormSchema.safeParse({
      ...validBooking,
      preferredDate: "not-a-date",
    });

    expect(result.success).toBe(false);
  });

  it("rejects when a required field is missing", () => {
    const { department, ...rest } = validBooking;

    expect(bookingFormSchema.safeParse(rest).success).toBe(false);
  });
});

describe("updateStatusSchema", () => {
  it("accepts 'pending' and 'handled'", () => {
    expect(updateStatusSchema.safeParse({ status: "pending" }).success).toBe(true);
    expect(updateStatusSchema.safeParse({ status: "handled" }).success).toBe(true);
  });

  it("rejects any other status value", () => {
    expect(updateStatusSchema.safeParse({ status: "archived" }).success).toBe(false);
  });
});