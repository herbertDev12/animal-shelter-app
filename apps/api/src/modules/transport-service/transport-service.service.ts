import { Injectable } from '@nestjs/common';
import { TransportServiceRepository } from './transport-service.repository';
import {
  CreateTransportService,
  UpdateTransportService,
  SearchTransportServicesFilters,
} from '@repo/schemas';

@Injectable()
export class TransportServiceService {
  constructor(private transportServiceRepository: TransportServiceRepository) {}

  async findAll() {
    return this.transportServiceRepository.findAll();
  }

  async findById(id: number) {
    return this.transportServiceRepository.findById(id);
  }

  async search(filters: SearchTransportServicesFilters) {
    return this.transportServiceRepository.search(filters);
  }

  async create(data: CreateTransportService) {
    return this.transportServiceRepository.createTransportService(data);
  }

  async update(id: number, data: UpdateTransportService) {
    return this.transportServiceRepository.updateTransportService(id, data);
  }

  async delete(id: number) {
    return this.transportServiceRepository.deleteTransportService(id);
  }
}
