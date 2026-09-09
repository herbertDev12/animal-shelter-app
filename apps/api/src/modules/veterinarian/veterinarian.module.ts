import { Module } from '@nestjs/common';
import { VeterinarianController } from './veterinarian.controller';
import { VeterinarianService } from './veterinarian.service';

@Module({
  controllers: [VeterinarianController],
  providers: [VeterinarianService],
  exports: [VeterinarianService],
})
export class VeterinarianModule {}
