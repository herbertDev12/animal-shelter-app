import { Injectable } from '@nestjs/common';
import {
  AnimalsRepository,
  CreateAnimalDto,
  SearchAnimalsFilters,
} from '../database/repositories/animals.repository';

@Injectable()
export class AnimalsService {
  constructor(private animalsRepository: AnimalsRepository) {}

  async findAll() {
    return this.animalsRepository.findAll();
  }

  async findById(id: string) {
    return this.animalsRepository.findById(id);
  }

  async search(filters: SearchAnimalsFilters) {
    return this.animalsRepository.search(filters);
  }

  async create(data: CreateAnimalDto) {
    return this.animalsRepository.create(data);
  }

  async update(id: string, data: Partial<CreateAnimalDto>) {
    return this.animalsRepository.update(id, data);
  }

  async delete(id: string) {
    return this.animalsRepository.delete(id);
  }

  async getStats() {
    return this.animalsRepository.getAdoptionStats();
  }
}
