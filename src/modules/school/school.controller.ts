import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { SchoolService } from './school.service.js';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';

@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  // =========================
  // SCHOOL MANAGEMENT
  // =========================

  // POST /schools
  // Super Admin
  @Post()
  async createNewSchool(@Body() dto: CreateSchoolDto) {
    return this.schoolService.create(dto);
  }

  // GET /schools
  // Super Admin
  @Get()
  async findAllSchools() {
    return this.schoolService.findAll();
  }

  // GET /schools/:id
  @Get(':id')
  async findOneSchool(@Param('id') id: string) {
    return this.schoolService.findOne(id);
  }

  // PATCH /schools/:id
  @Patch(':id')
  async updateSchool(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolService.update(id, dto);
  }

  // DELETE /schools/:id
  @Delete(':id')
  async removeSchool(@Param('id') id: string) {
    return this.schoolService.remove(id);
  }

  // GET /schools/location/:location
  @Get('location/:location')
  async findSchoolsByLocation(@Param('location') location: string) {
    return this.schoolService.findByLocation(location);
  }
}
