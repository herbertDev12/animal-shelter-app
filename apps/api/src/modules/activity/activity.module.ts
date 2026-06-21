import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './activity.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository],
  exports: [ActivityService],
})
export class ActivityModule {}
