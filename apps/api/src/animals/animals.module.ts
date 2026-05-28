import { Module } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { AnimalsController } from './animals.controller';
import { AnimalsRepository } from '../database/repositories/animals.repository';

@Module({
  controllers: [AnimalsController],
  providers: [AnimalsService, AnimalsRepository],
  exports: [AnimalsService],
})
export class AnimalsModule {}
