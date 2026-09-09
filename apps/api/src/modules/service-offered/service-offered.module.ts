import { Module } from '@nestjs/common';
import { ServiceOfferedController } from './service-offered.controller';
import { ServiceOfferedService } from './service-offered.service';

@Module({
  controllers: [ServiceOfferedController],
  providers: [ServiceOfferedService],
  exports: [ServiceOfferedService],
})
export class ServiceOfferedModule {}
