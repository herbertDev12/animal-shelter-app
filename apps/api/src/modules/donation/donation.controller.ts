import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { CreateDonationDto, SearchDonationsFiltersDto } from '@repo/schemas';

@Controller('donations')
export class DonationController {
  constructor(private donationService: DonationService) {}

  @Get()
  async findAll() {
    return this.donationService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchDonationsFiltersDto) {
    return this.donationService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.donationService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateDonationDto) {
    return this.donationService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateDonationDto>,
  ) {
    return this.donationService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.donationService.delete(id);
  }
}
