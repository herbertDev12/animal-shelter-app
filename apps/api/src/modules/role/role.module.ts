import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { PermissionController } from './permission.controller';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController, PermissionController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
