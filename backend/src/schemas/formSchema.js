import { z } from "zod";

/**
 * NOTE on mobileNum: the Mongoose models currently store this as a Number,
 * and the frontend does Number(form.mobileNum) before sending it — which
 * silently drops the leading 0 on PH mobile numbers (e.g. "09171234567"
 * becomes 9171234567). This schema validates length only (10-11 digits)
 * to match what's actually arriving today. Switching mobileNum to String
 * end-to-end (frontend + Mongoose schema) is a separate follow-up so the
 * leading zero is preserved — flagged separately, not fixed here.
 */
const mobileNum = z.coerce
  .number({ message: "Mobile number is required" })
  .int("Mobile number must not contain decimals")
  .positive("Mobile number is required")
  .refine((val) => {
    const digits = String(val).length;
    return digits === 10 || digits === 11;
  }, "Must be a valid PH mobile number (10-11 digits)");

export const contactFormSchema = z.object({
  name: z.string({ message: "Name is required" }).trim().min(1, "Name is required").max(150),
  email: z.string({ message: "Email is required" }).trim().email("Must be a valid email"),
  mobileNum,
  message: z.string({ message: "Message is required" }).trim().min(1, "Message is required").max(2000),
});

export const bookingFormSchema = z.object({
  department: z.string({ message: "Department is required" }).trim().min(1, "Department is required").max(150),
  service: z.string({ message: "Service is required" }).trim().min(1, "Service is required").max(150),
  preferredDate: z.coerce.date({ message: "A valid preferred date is required" }),
  preferredTime: z.string({ message: "Preferred time is required" }).trim().min(1, "Preferred time is required").max(50),
  firstName: z.string({ message: "First name is required" }).trim().min(1, "First name is required").max(100),
  lastName: z.string({ message: "Last name is required" }).trim().min(1, "Last name is required").max(100),
  mobileNum,
  email: z.string({ message: "Email is required" }).trim().email("Must be a valid email"),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

/** Admin edits to a booking/contact status (the only field the dashboard updates). */
export const updateStatusSchema = z.object({
  status: z.enum(["pending", "handled"]),
});