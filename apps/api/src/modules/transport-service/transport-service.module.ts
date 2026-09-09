import { Module } from '@nestjs/common';
import { TransportServiceController } from './transport-service.controller';
import { TransportServiceService } from './transport-service.service';

@Module({
  controllers: [TransportServiceController],
  providers: [TransportServiceService],
  exports: [TransportServiceService],
})
export class TransportServiceModule {}
