import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateRole, UpdateRole } from '@repo/schemas';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../auth/auth.service';
import { ADMIN_ROLE } from '../auth/permissions';

const roleInclude = {
  permissions: {
    select: { permission: { select: { id: true, name: true, code: true } } },
    orderBy: { permission: { code: 'asc' } },
  },
} as const;

type RoleRow = {
  id: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  permissions: { permission: { id: string; name: string; code: string } }[];
};

const toRole = ({ permissions, ...role }: RoleRow) => ({
  ...role,
  permissions: permissions.map((p) => p.permission),
});

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      where: { isDeleted: false },
      include: roleInclude,
      orderBy: { name: 'asc' },
    });
    return roles.map(toRole);
  }

  async findById(id: string) {
    return toRole(await this.findRowOrThrow(id));
  }

  async create(dto: CreateRole) {
    await this.assertPermissionsExist(dto.permissionIds);

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        isActive: dto.isActive ?? true,
        permissions: {
          create: dto.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: roleInclude,
    });
    return toRole(role);
  }

  async update(id: string, dto: UpdateRole) {
    const existing = await this.findRowOrThrow(id);

    if (existing.name === ADMIN_ROLE) {
      const renames = dto.name !== undefined && dto.name !== ADMIN_ROLE;
      const deactivates = dto.isActive === false;
      if (renames || deactivates || dto.permissionIds !== undefined) {
        throw new ConflictException(`The ${ADMIN_ROLE} role cannot be changed`);
      }
    }

    const { permissionIds } = dto;
    if (permissionIds) {
      await this.assertPermissionsExist(permissionIds);
    }

    const role = await this.prisma.$transaction(async (tx) => {
      if (permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }

      return tx.role.update({
        where: { id },
        data: { name: dto.name, isActive: dto.isActive },
        include: roleInclude,
      });
    });
    return toRole(role);
  }

  async remove(id: string) {
    const existing = await this.findRowOrThrow(id);

    if (existing.name === ADMIN_ROLE) {
      throw new ConflictException(`The ${ADMIN_ROLE} role cannot be deleted`);
    }

    const assignedUsers = await this.prisma.user.count({
      where: { roleId: id },
    });
    if (assignedUsers > 0) {
      throw new ConflictException(
        'The role is still assigned to users; reassign them first',
      );
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
      include: roleInclude,
    });
    return toRole(role);
  }

  async assignToUser(roleId: string, userId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, isActive: true, isDeleted: false },
      select: { id: true },
    });
    if (!role) {
      throw new BadRequestException('Role not found or inactive');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: publicUserSelect,
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: { code: 'asc' } });
  }

  private async findRowOrThrow(id: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, isDeleted: false },
      include: roleInclude,
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private async assertPermissionsExist(ids: string[]) {
    const found = await this.prisma.permission.count({
      where: { id: { in: ids } },
    });
    if (found !== ids.length) {
      throw new BadRequestException('One or more permissions do not exist');
    }
  }
}
