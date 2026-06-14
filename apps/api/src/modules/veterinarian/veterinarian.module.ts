import { Module } from '@nestjs/common';
import { VeterinarianController } from './veterinarian.controller';
import { VeterinarianService } from './veterinarian.service';
import { VeterinarianRepository } from './veterinarian.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VeterinarianController],
  providers: [VeterinarianService, VeterinarianRepository],
  exports: [VeterinarianService],
})
export class VeterinarianModule {}
