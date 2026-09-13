import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../auth/permissions.decorator';
import { RoleService } from './role.service';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePermission('role.read')
  @Get()
  async findAll() {
    return this.roleService.findAllPermissions();
  }
}
