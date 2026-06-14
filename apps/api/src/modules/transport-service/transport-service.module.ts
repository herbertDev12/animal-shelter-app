import { Module } from '@nestjs/common';
import { TransportServiceController } from './transport-service.controller';
import { TransportServiceService } from './transport-service.service';
import { TransportServiceRepository } from './transport-service.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TransportServiceController],
  providers: [TransportServiceService, TransportServiceRepository],
  exports: [TransportServiceService],
})
export class TransportServiceModule {}
