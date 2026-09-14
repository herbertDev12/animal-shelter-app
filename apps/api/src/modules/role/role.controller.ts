import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from '@repo/schemas';
import { RequirePermission } from '../auth/permissions.decorator';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePermission('role.read')
  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @RequirePermission('role.read')
  @Get('select')
  async findForSelect() {
    return this.roleService.findForSelect();
  }

  @RequirePermission('role.read')
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findById(id);
  }

  @RequirePermission('role.create')
  @Post()
  async create(@Body() data: CreateRoleDto) {
    return this.roleService.create(data);
  }

  @RequirePermission('role.edit')
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateRoleDto,
  ) {
    return this.roleService.update(id, data);
  }

  @RequirePermission('role.edit')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.remove(id);
  }

  @RequirePermission('role.edit')
  @Put(':id/users/:userId')
  async assignToUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.roleService.assignToUser(id, userId);
  }
}
