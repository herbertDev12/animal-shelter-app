import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { ContractRepository } from './contract.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ContractController],
  providers: [ContractService, ContractRepository],
  exports: [ContractService],
})
export class ContractModule {}
