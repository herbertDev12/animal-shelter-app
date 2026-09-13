import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skips JWT authentication and permission checks for a route. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
