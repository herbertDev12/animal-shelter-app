import { Injectable } from '@nestjs/common';
import { AnimalRepository } from './animal.repository';
import { CreateAnimal, SearchAnimalsFilters } from '@repo/schemas';

@Injectable()
export class AnimalService {
  constructor(private animalsRepository: AnimalRepository) {}

  async findAll() {
    return this.animalsRepository.findAll();
  }

  async findById(id: number) {
    return this.animalsRepository.findById(id);
  }

  async search(filters: SearchAnimalsFilters) {
    return this.animalsRepository.search(filters);
  }

  async create(data: CreateAnimal) {
    return this.animalsRepository.createAnimal(data);
  }

  async update(id: number, data: Partial<CreateAnimal>) {
    return this.animalsRepository.updateAnimal(id, data);
  }

  async delete(id: number) {
    return this.animalsRepository.deleteAnimal(id);
  }

  async getStats() {
    return this.animalsRepository.getAdoptionStats();
  }
}
