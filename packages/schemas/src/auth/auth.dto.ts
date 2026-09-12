import { createZodDto } from "nestjs-zod";
import {
  registerInputSchema,
  loginInputSchema,
  userSchema,
  loginOutputSchema,
} from "./auth";

export class RegisterInputDto extends createZodDto(registerInputSchema) {}

export class LoginInputDto extends createZodDto(loginInputSchema) {}

export class UserDto extends createZodDto(userSchema) {}

export class LoginOutputDto extends createZodDto(loginOutputSchema) {}

export type { RegisterInput, LoginInput, User, LoginOutput } from "./auth";
