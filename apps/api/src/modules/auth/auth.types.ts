import type { Request } from 'express';
import type { User } from '@repo/schemas';

export type AuthUser = Pick<User, 'id' | 'email' | 'roleId'> &
  Partial<Pick<User, 'name' | 'lastName'>>;

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
}

export type AuthenticatedRequest = Request & { user: AuthUser };
