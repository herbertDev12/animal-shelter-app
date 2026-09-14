import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequirePermission } from '../auth/permissions.decorator';
import { ActivityService } from './activity.service';
import {
  CreateActivityDto,
  UpdateActivityDto,
  SearchActivityFiltersDto,
} from '@repo/schemas';

@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @RequirePermission('activity.read')
  @Get()
  async findAll() {
    return this.activityService.findAll();
  }

  @RequirePermission('activity.read')
  @Get('search')
  async search(@Query() filters: SearchActivityFiltersDto) {
    return this.activityService.search(filters);
  }

  @RequirePermission('activity.read')
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.activityService.findById(id);
  }

  @RequirePermission('activity.create')
  @Post()
  async create(@Body() data: CreateActivityDto) {
    return this.activityService.create(data);
  }

  @RequirePermission('activity.edit')
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateActivityDto,
  ) {
    return this.activityService.update(id, data);
  }

  @RequirePermission('activity.edit')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.activityService.delete(id);
  }
}
