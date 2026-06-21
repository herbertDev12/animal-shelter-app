import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import {
  CreateActivityDto,
  UpdateActivityDto,
  SearchActivityFiltersDto,
} from '@repo/schemas';

@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  async findAll() {
    return this.activityService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchActivityFiltersDto) {
    return this.activityService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateActivityDto) {
    return this.activityService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateActivityDto,
  ) {
    return this.activityService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.delete(id);
  }
}
