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

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

const lastNameSchema = z
  .string()
  .trim()
  .max(100, "Last name must be at most 100 characters");

export const registerInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  lastName: lastNameSchema.optional(),
  roleId: z.uuid("A valid role id is required"),
});

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  name: nameSchema.optional(),
  lastName: lastNameSchema.nullish(),
  roleId: z.uuid("A valid role id is required").optional(),
});

export const updateUserFormSchema = updateUserSchema.extend({
  password: z.union([z.literal(""), passwordSchema]).optional(),
});

export const userSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  name: z.string(),
  lastName: z.string().nullish(),
  roleId: z.uuid(),
});

export const userWithRoleSchema = userSchema.extend({
  role: z.object({ name: z.string() }),
});

export const sessionUserSchema = userSchema.extend({
  role: z.object({ name: z.string() }),
  permissions: z.array(z.string()),
});

export const loginOutputSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  token: z.string(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserFormSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type User = z.infer<typeof userSchema>;
export type UserWithRole = z.infer<typeof userWithRoleSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type LoginOutput = z.infer<typeof loginOutputSchema>;
