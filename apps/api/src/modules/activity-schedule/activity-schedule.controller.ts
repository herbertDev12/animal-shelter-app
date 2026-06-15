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
import { ActivityScheduleService } from './activity-schedule.service';
import {
  CreateActivityScheduleDto,
  UpdateActivityScheduleDto,
  SearchActivityScheduleFiltersDto,
} from '@repo/schemas';

@Controller('activity-schedules')
export class ActivityScheduleController {
  constructor(private activityScheduleService: ActivityScheduleService) {}

  @Get()
  async findAll() {
    return this.activityScheduleService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchActivityScheduleFiltersDto) {
    return this.activityScheduleService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.activityScheduleService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateActivityScheduleDto) {
    return this.activityScheduleService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateActivityScheduleDto,
  ) {
    return this.activityScheduleService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.activityScheduleService.delete(id);
  }
}
