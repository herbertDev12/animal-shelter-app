import { Injectable } from '@nestjs/common';
import { ClinicRepository } from './clinic.repository';
import { CreateClinic, SearchClinicsFilters } from '@repo/schemas';

@Injectable()
export class ClinicService {
  constructor(private clinicsRepository: ClinicRepository) {}

  async findAll() {
    return this.clinicsRepository.findAll();
  }

  async findById(id: number) {
    return this.clinicsRepository.findById(id);
  }

  async search(filters: SearchClinicsFilters) {
    return this.clinicsRepository.search(filters);
  }

  async create(data: CreateClinic) {
    return this.clinicsRepository.createClinic(data);
  }

  async update(id: number, data: Partial<CreateClinic>) {
    return this.clinicsRepository.updateClinic(id, data);
  }

  async delete(id: number) {
    return this.clinicsRepository.deleteClinic(id);
  }
}
