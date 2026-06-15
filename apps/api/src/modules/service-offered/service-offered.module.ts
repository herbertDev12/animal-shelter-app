import { Module } from '@nestjs/common';
import { ServiceOfferedController } from './service-offered.controller';
import { ServiceOfferedService } from './service-offered.service';
import { ServiceOfferedRepository } from './service-offered.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ServiceOfferedController],
  providers: [ServiceOfferedService, ServiceOfferedRepository],
  exports: [ServiceOfferedService],
})
export class ServiceOfferedModule {}
