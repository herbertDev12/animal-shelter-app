import { z } from "zod";

const roleNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

const permissionIdsSchema = z
  .array(z.uuid("Permission ids must be UUIDs"))
  // Duplicates would violate the role_permissions composite key.
  .transform((ids) => [...new Set(ids)]);

export const createRoleSchema = z.object({
  name: roleNameSchema,
  isActive: z.boolean().optional(),
  permissionIds: permissionIdsSchema,
});

export const updateRoleSchema = z.object({
  name: roleNameSchema.optional(),
  isActive: z.boolean().optional(),
  permissionIds: permissionIdsSchema.optional(),
});

export const permissionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
});

export const roleSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  permissions: z.array(permissionSchema),
});

export type CreateRole = z.infer<typeof createRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type Role = z.infer<typeof roleSchema>;
