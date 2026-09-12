import type { JwtSignOptions } from '@nestjs/jwt';

export const DEFAULT_JWT_EXPIRES_IN = '7d';

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Add it to the root .env file before starting the API.',
    );
  }

  return secret;
}

export function jwtExpiresIn(): JwtSignOptions['expiresIn'] {
  return (process.env.JWT_EXPIRES_IN ??
    DEFAULT_JWT_EXPIRES_IN) as JwtSignOptions['expiresIn'];
}
