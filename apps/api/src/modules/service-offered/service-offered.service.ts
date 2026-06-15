import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOfferedRepository } from './service-offered.repository';
import {
  ServiceOffered,
  CreateServiceOffered,
  UpdateServiceOffered,
  SearchServiceOfferedFilters,
} from '@repo/schemas';

@Injectable()
export class ServiceOfferedService {
  constructor(
    private readonly serviceOfferedRepository: ServiceOfferedRepository,
  ) {}

  async findAll(): Promise<ServiceOffered[]> {
    return this.serviceOfferedRepository.findAll();
  }

  async findById(id: number): Promise<ServiceOffered> {
    const service = await this.serviceOfferedRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service offered with ID ${id} not found`);
    }
    return service;
  }

  async search(
    filters: SearchServiceOfferedFilters,
  ): Promise<ServiceOffered[]> {
    return this.serviceOfferedRepository.search(filters);
  }

  async create(data: CreateServiceOffered): Promise<ServiceOffered> {
    return this.serviceOfferedRepository.createServiceOffered(data);
  }

  async update(
    id: number,
    data: UpdateServiceOffered,
  ): Promise<ServiceOffered> {
    await this.findById(id);
    return this.serviceOfferedRepository.updateServiceOffered(id, data);
  }

  async remove(id: number): Promise<boolean> {
    await this.findById(id);
    return this.serviceOfferedRepository.deleteServiceOffered(id);
  }
}
