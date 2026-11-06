import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, PASSWORD_TOO_LONG, PASSWORD_TOO_SHORT } from "../lib/password-policy";

const email = z.string().trim().toLowerCase().email().max(254);

// Password policy: length is the rule (see lib/password-policy.ts). Common,
// personal and breached passwords are refused by the routes, which can look
// things up; this schema only checks the length.
const password = z.string()
  .min(MIN_PASSWORD_LENGTH, PASSWORD_TOO_SHORT)
  .max(MAX_PASSWORD_LENGTH, PASSWORD_TOO_LONG);

const name = z.string().trim().min(1).max(100);

// Phone normalization: UK format (+44 followed by 10 digits)
const phone = z.string()
  .trim()
  .min(7)
  .max(32)
  .transform((val) => {
    // Remove all non-digit characters except leading +
    const cleaned = val.replace(/[^\d+]/g, '');
    // If starts with country code format, normalize
    if (val.startsWith('+') && cleaned.length === 11 && cleaned.startsWith('44')) {
      return `+${cleaned}`;
    }
    // If UK mobile without country code (10 digits starting with 7)
    if (cleaned.length === 10 && cleaned.startsWith('7')) {
      return `+44${cleaned}`;
    }
    return val;
  });

export const registerSchema = z.object({
  email,
  password,
  firstName: name,
  lastName: name,
  phone: phone.optional(),
  /** Another patient's refer-a-friend code (D-03). */
  referralCode: z.string().trim().min(4).max(20).optional(),
}).strict();

export const checkEmailSchema = z.object({ email }).strict();

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(128),
  mfaCode: z.string().trim().min(4).max(12).optional(),
}).strict();

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1, "Refresh token is required").max(1024),
}).strict();

// Runtime schema for AuthUser - matches shared types/api-types.ts and mobile AuthUser
export const authUserSchema = z.object({
  id: z.string().guid().optional(),
  sub: z.string().guid(),
  role: z.enum(['patient', 'clinician', 'operator', 'admin']),
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean().optional(),
  isMfaEnabled: z.boolean(),
  mfaEnabled: z.boolean().optional(),
  profileId: z.string().guid().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

// Runtime schema for auth response
export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
