import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequirePermission } from '../auth/permissions.decorator';
import { DonationService } from './donation.service';
import { CreateDonationDto, SearchDonationsFiltersDto } from '@repo/schemas';

@Controller('donations')
export class DonationController {
  constructor(private donationService: DonationService) {}

  @RequirePermission('donation.read')
  @Get()
  async findAll() {
    return this.donationService.findAll();
  }

  @RequirePermission('donation.read')
  @Get('search')
  async search(@Query() filters: SearchDonationsFiltersDto) {
    return this.donationService.search(filters);
  }

  @RequirePermission('donation.read')
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.donationService.findById(id);
  }

  @RequirePermission('donation.create')
  @Post()
  async create(@Body() data: CreateDonationDto) {
    return this.donationService.create(data);
  }

  @RequirePermission('donation.edit')
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<CreateDonationDto>,
  ) {
    return this.donationService.update(id, data);
  }

  @RequirePermission('donation.edit')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.donationService.delete(id);
  }
}
