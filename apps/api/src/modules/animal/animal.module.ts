import { Module } from '@nestjs/common';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { AnimalRepository } from './animal.repository';

@Module({
  controllers: [AnimalController],
  providers: [AnimalService, AnimalRepository],
  exports: [AnimalService],
})
export class AnimalsModule {}
