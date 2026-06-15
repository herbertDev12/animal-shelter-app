import { Module } from '@nestjs/common';
import { ActivityScheduleController } from './activity-schedule.controller';
import { ActivityScheduleService } from './activity-schedule.service';
import { ActivityScheduleRepository } from './activity-schedule.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ActivityScheduleController],
  providers: [ActivityScheduleService, ActivityScheduleRepository],
  exports: [ActivityScheduleService],
})
export class ActivityScheduleModule {}
