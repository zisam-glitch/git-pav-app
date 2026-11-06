import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/features/auth/password-rules";

// ─── Personal Info Schema ──────────────────────────────────────────────────
export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name is too long"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  addressLine1: z.string().trim().min(1, "Address line 1 is required").max(255, "Address is too long"),
  addressLine2: z.string().trim().max(255, "Address line 2 is too long").optional(),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  postcode: z
    .string()
    .trim()
    .min(1, "Postcode is required")
    .regex(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i, "Invalid UK postcode format"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^\+?[\d\s-]+$/, "Invalid phone number format"),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

// ─── Medical History Schema ────────────────────────────────────────────────
export const medicalHistorySchema = z.object({
  hasAllergies: z.boolean(),
  allergies: z.array(z.string()),
  allergyDetails: z.string(),
  isTakingMedications: z.boolean(),
  medications: z.array(z.string()),
  medicationDetails: z.string(),
  conditions: z.array(z.string()),
  gpSurgery: z.string().trim().min(1, "GP surgery name is required"),
  gpDoctorName: z.string().trim().optional(),
  gpPhone: z.string().trim().optional(),
  notes: z.string(),
});

export type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;

// ─── Emergency Contact Schema ──────────────────────────────────────────────
export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required").max(100, "Name is too long"),
  relationship: z.enum([
    "Spouse / Partner",
    "Parent / Guardian",
    "Sibling",
    "Child",
    "Friend",
    "Other",
  ]),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^\+?[\d\s-]+$/, "Invalid phone number format"),
  alternativePhone: z
    .string()
    .trim()
    .max(20, "Alternative phone is too long")
    .optional()
    .or(z.literal("")),
});

export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;

// ─── Password Change Schema ────────────────────────────────────────────────
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      .max(MAX_PASSWORD_LENGTH, `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer`),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

