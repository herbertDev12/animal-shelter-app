import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { PERMISSION_KEY } from './permissions.decorator';
import type { PermissionCode } from './permissions';
import type { AuthenticatedRequest } from './auth.types';

/**
 * Runs after `JwtAuthGuard`. Checks that the role carried in the JWT is active
 * and holds the permission declared with `@RequirePermission`.
 *
 * Grants are read from the database on every request rather than baked into the
 * token, so revoking a permission or deactivating a role takes effect at once.
 * Routes without `@RequirePermission` only require a valid token.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const code = this.reflector.getAllAndOverride<PermissionCode>(
      PERMISSION_KEY,
      targets,
    );

    if (!code) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!user?.roleId) {
      throw new ForbiddenException();
    }

    const grant = await this.prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: { code },
        role: { isActive: true, isDeleted: false },
      },
      select: { roleId: true },
    });

    if (!grant) {
      throw new ForbiddenException(`Missing permission: ${code}`);
    }

    return true;
  }
}
