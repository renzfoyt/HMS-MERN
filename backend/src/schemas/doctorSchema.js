import { z } from "zod";

const dayEnum = z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

// Matches an optional value that, if present, must be non-empty once trimmed.
// Lets the frontend send "" for "not filled in yet" without failing validation.
const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .or(z.literal(""));

export const createDoctorSchema = z.object({
  firstName: z.string({ message: "First name is required" }).trim().min(1, "First name is required").max(100),
  lastName: z.string({ message: "Last name is required" }).trim().min(1, "Last name is required").max(100),
  specialty: z.string({ message: "Specialty is required" }).trim().min(1, "Specialty is required").max(120),
  subSpecialty: optionalText(120),
  department: z.string({ message: "Department is required" }).trim().min(1, "Department is required").max(120),
  credentials: optionalText(120),
  bio: optionalText(2000),
  photoUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Must be a valid email").optional().or(z.literal("")),
  contactNumber: z
    .string()
    .trim()
    .regex(/^0\d{10}$/, "Must be an 11-digit PH mobile number starting with 0")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["Male", "Female"]).optional(),
  clinicDays: z.array(dayEnum).optional(),
  clinicHourIn: optionalText(20),
  clinicHourOut: optionalText(20),
  hmoAccepted: z.array(z.string().trim().min(1)).optional(),
  availability: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

// Admin edits can send a partial object (only the fields that changed).
export const updateDoctorSchema = createDoctorSchema.partial();