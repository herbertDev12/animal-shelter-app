import { createZodDto } from "nestjs-zod";
import {
  createRoleSchema,
  updateRoleSchema,
  permissionSchema,
  roleSchema,
} from "./role";

export class CreateRoleDto extends createZodDto(createRoleSchema) {}

export class UpdateRoleDto extends createZodDto(updateRoleSchema) {}

export class PermissionDto extends createZodDto(permissionSchema) {}

export class RoleDto extends createZodDto(roleSchema) {}

export type { CreateRole, UpdateRole, Permission, Role } from "./role";
