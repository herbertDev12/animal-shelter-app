import { Module } from '@nestjs/common';
import { ContractModule } from '../contract/contract.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  // The active-veterinarians report filters on the stored contract status, so
  // it needs ContractService to settle overdue contracts first.
  imports: [ContractModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
