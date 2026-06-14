import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from './contract.repository';
import {
  Contract,
  CreateContract,
  UpdateContract,
  SearchContractsFilters,
} from '@repo/schemas';

@Injectable()
export class ContractService {
  constructor(private readonly contractRepository: ContractRepository) {}

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.findAll();
  }

  async findById(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }
    return contract;
  }

  async search(filters: SearchContractsFilters): Promise<Contract[]> {
    return this.contractRepository.search(filters);
  }

  async create(data: CreateContract): Promise<Contract> {
    return this.contractRepository.createContract(data);
  }

  async update(id: number, data: UpdateContract): Promise<Contract> {
    await this.findById(id); // Check if exists
    return this.contractRepository.updateContract(id, data);
  }

  async remove(id: number): Promise<boolean> {
    await this.findById(id); // Check if exists
    return this.contractRepository.deleteContract(id);
  }
}
