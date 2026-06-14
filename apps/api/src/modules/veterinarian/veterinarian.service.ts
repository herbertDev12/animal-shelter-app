import { Injectable } from '@nestjs/common';
import { VeterinarianRepository } from './veterinarian.repository';
import {
  CreateVeterinarian,
  UpdateVeterinarian,
  SearchVeterinariansFilters,
} from '@repo/schemas';

@Injectable()
export class VeterinarianService {
  constructor(private veterinarianRepository: VeterinarianRepository) {}

  async findAll() {
    return this.veterinarianRepository.findAll();
  }

  async findById(id: number) {
    return this.veterinarianRepository.findById(id);
  }

  async search(filters: SearchVeterinariansFilters) {
    return this.veterinarianRepository.search(filters);
  }

  async create(data: CreateVeterinarian) {
    return this.veterinarianRepository.createVeterinarian(data);
  }

  async update(id: number, data: UpdateVeterinarian) {
    return this.veterinarianRepository.updateVeterinarian(id, data);
  }

  async delete(id: number) {
    return this.veterinarianRepository.deleteVeterinarian(id);
  }
}
