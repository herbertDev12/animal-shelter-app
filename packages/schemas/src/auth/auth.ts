import { z } from "zod";

// Normalised before validation so that "  Ada@Example.COM " and
// "ada@example.com" are the same account: the `email` column is UNIQUE, and a
// case-sensitive comparison would let the same address register twice.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(100, "Email must be at most 100 characters")
  .pipe(z.email("A valid email is required"));

export const registerInputSchema = z.object({
  email: emailSchema,
  // bcrypt silently ignores everything past 72 bytes, so a longer password
  // would only be partly checked at login. Reject it instead.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  lastName: z
    .string()
    .trim()
    .max(100, "Last name must be at most 100 characters")
    .optional(),
});

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const userSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  name: z.string(),
  lastName: z.string().nullish(),
});

export const loginOutputSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  token: z.string(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginOutput = z.infer<typeof loginOutputSchema>;
