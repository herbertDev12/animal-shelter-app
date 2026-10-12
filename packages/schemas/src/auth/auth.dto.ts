import { createZodDto } from "nestjs-zod";
import {
  registerInputSchema,
  updateUserSchema,
  loginInputSchema,
  userSchema,
  userWithRoleSchema,
  sessionUserSchema,
  loginOutputSchema,
} from "./auth";

export class RegisterInputDto extends createZodDto(registerInputSchema) {}

export class UpdateUserDto extends createZodDto(updateUserSchema) {}

export class LoginInputDto extends createZodDto(loginInputSchema) {}

export class UserDto extends createZodDto(userSchema) {}

export class UserWithRoleDto extends createZodDto(userWithRoleSchema) {}

export class SessionUserDto extends createZodDto(sessionUserSchema) {}

export class LoginOutputDto extends createZodDto(loginOutputSchema) {}

export type {
  RegisterInput,
  UpdateUser,
  LoginInput,
  User,
  UserWithRole,
  SessionUser,
  LoginOutput,
} from "./auth";
