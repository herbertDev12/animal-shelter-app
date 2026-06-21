import { Injectable } from '@nestjs/common';
import { ActivityRepository } from './activity.repository';
import {
  CreateActivity,
  UpdateActivity,
  SearchActivityFilters,
} from '@repo/schemas';

@Injectable()
export class ActivityService {
  constructor(private activityRepository: ActivityRepository) {}

  async findAll() {
    return this.activityRepository.findAll();
  }

  async findById(id: number) {
    return this.activityRepository.findById(id);
  }

  async search(filters: SearchActivityFilters) {
    return this.activityRepository.search(filters);
  }

  async create(data: CreateActivity) {
    return this.activityRepository.createActivity(data);
  }

  async update(id: number, data: UpdateActivity) {
    return this.activityRepository.updateActivity(id, data);
  }

  async delete(id: number) {
    return this.activityRepository.deleteActivity(id);
  }
}
