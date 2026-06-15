import { Injectable } from '@nestjs/common';
import { AdoptionRepository } from './adoption.repository';
import { CreateAdoption, SearchAdoptionsFilters } from '@repo/schemas';

@Injectable()
export class AdoptionService {
  constructor(private adoptionRepository: AdoptionRepository) {}

  async findAll() {
    return this.adoptionRepository.findAll();
  }

  async findById(id: number) {
    return this.adoptionRepository.findById(id);
  }

  async search(filters: SearchAdoptionsFilters) {
    return this.adoptionRepository.search(filters);
  }

  async create(data: CreateAdoption) {
    return this.adoptionRepository.createAdoption(data);
  }

  async update(id: number, data: Partial<CreateAdoption>) {
    return this.adoptionRepository.updateAdoption(id, data);
  }

  async delete(id: number) {
    return this.adoptionRepository.deleteAdoption(id);
  }
}
