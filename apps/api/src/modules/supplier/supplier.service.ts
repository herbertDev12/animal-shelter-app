import { Injectable } from '@nestjs/common';
import { SupplierRepository } from './supplier.repository';
import { CreateSupplier } from '@repo/schemas';
import { SearchSuppliersFilters } from 'node_modules/@repo/schemas/src/supplier/supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private supplierRepository: SupplierRepository) {}

  async findAll() {
    return this.supplierRepository.findAll();
  }

  async search(filters: SearchSuppliersFilters) {
    return this.supplierRepository.search(filters);
  }

  async findById(id: number) {
    return this.supplierRepository.findById(id);
  }

  async create(data: CreateSupplier) {
    return this.supplierRepository.createSupplier(data);
  }

  async update(id: number, data: Partial<CreateSupplier>) {
    return this.supplierRepository.updateSupplier(id, data);
  }

  async delete(id: number) {
    return this.supplierRepository.deleteSupplier(id);
  }
}
