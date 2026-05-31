import { Injectable } from '@nestjs/common';
import { AnimalRepository } from './animal.repository';
import { CreateAnimal, SearchAnimalsFilters } from '@repo/schemas';

@Injectable()
export class AnimalService {
  constructor(private animalsRepository: AnimalRepository) {}

  async findAll() {
    return this.animalsRepository.findAll();
  }

  async findById(id: string) {
    return this.animalsRepository.findById(id);
  }

  async search(filters: SearchAnimalsFilters) {
    return this.animalsRepository.search(filters);
  }

  async create(data: CreateAnimal) {
    return this.animalsRepository.create(data);
  }

  async update(id: string, data: Partial<CreateAnimal>) {
    return this.animalsRepository.update(id, data);
  }

  async delete(id: string) {
    return this.animalsRepository.delete(id);
  }

  async getStats() {
    return this.animalsRepository.getAdoptionStats();
  }
}
