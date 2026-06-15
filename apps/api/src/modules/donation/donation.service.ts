import { Injectable } from '@nestjs/common';
import { DonationRepository } from './donation.repository';
import { CreateDonation, SearchDonationsFilters } from '@repo/schemas';

@Injectable()
export class DonationService {
  constructor(private donationRepository: DonationRepository) {}

  async findAll() {
    return this.donationRepository.findAll();
  }

  async findById(id: number) {
    return this.donationRepository.findById(id);
  }

  async search(filters: SearchDonationsFilters) {
    return this.donationRepository.search(filters);
  }

  async create(data: CreateDonation) {
    return this.donationRepository.createDonation(data);
  }

  async update(id: number, data: Partial<CreateDonation>) {
    return this.donationRepository.updateDonation(id, data);
  }

  async delete(id: number) {
    return this.donationRepository.deleteDonation(id);
  }
}
