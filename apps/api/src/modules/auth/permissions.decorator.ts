import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from './permissions';

export const PERMISSION_KEY = 'requiredPermission';

/**
 * Declares the permission the caller's role must hold. Enforced globally by
 * `PermissionsGuard`.
 */
export const RequirePermission = (code: PermissionCode) =>
  SetMetadata(PERMISSION_KEY, code);
