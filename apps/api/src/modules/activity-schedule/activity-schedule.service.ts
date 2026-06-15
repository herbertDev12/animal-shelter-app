import { Injectable } from '@nestjs/common';
import { ActivityScheduleRepository } from './activity-schedule.repository';
import {
  CreateActivitySchedule,
  UpdateActivitySchedule,
  SearchActivityScheduleFilters,
} from '@repo/schemas';

@Injectable()
export class ActivityScheduleService {
  constructor(private activityScheduleRepository: ActivityScheduleRepository) {}

  async findAll() {
    return this.activityScheduleRepository.findAll();
  }

  async findById(id: number) {
    return this.activityScheduleRepository.findById(id);
  }

  async search(filters: SearchActivityScheduleFilters) {
    return this.activityScheduleRepository.search(filters);
  }

  async create(data: CreateActivitySchedule) {
    return this.activityScheduleRepository.createActivitySchedule(data);
  }

  async update(id: number, data: UpdateActivitySchedule) {
    return this.activityScheduleRepository.updateActivitySchedule(id, data);
  }

  async delete(id: number) {
    return this.activityScheduleRepository.deleteActivitySchedule(id);
  }
}
