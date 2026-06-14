import { Module } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { ClinicRepository } from './clinic.repository';

@Module({
  controllers: [ClinicController],
  providers: [ClinicService, ClinicRepository],
  exports: [ClinicService],
})
export class ClinicsModule {}
