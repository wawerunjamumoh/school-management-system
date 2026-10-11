import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { SchoolService } from './school.service.js';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolController {
  constructor(
    private readonly schoolService: SchoolService,
  ) { }

  // =========================
  // CREATE SCHOOL
  // SUPER_ADMIN ONLY
  // =========================

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async createNewSchool(
    @Body() dto: CreateSchoolDto,
  ) {
    return this.schoolService.create(dto);
  }

  // =========================
  // GET ALL SCHOOLS
  // SUPER_ADMIN ONLY
  // =========================

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  async findAllSchools() {
    return this.schoolService.findAll();
  }

  // =========================
  // GET ONE SCHOOL
  // SUPER_ADMIN / HEAD_TEACHER
  // =========================

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async findOneSchool(
    @Param('id') id: string,
  ) {
    return this.schoolService.findOne(id);
  }

  // =========================
  // UPDATE SCHOOL
  // SUPER_ADMIN ONLY
  // =========================

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async updateSchool(
    @Param('id') id: string,
    @Body() dto: UpdateSchoolDto,
  ) {
    return this.schoolService.update(
      id,
      dto,
    );
  }

  // =========================
  // DELETE SCHOOL
  // SUPER_ADMIN ONLY
  // =========================

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async removeSchool(
    @Param('id') id: string,
  ) {
    return this.schoolService.remove(id);
  }

  // =========================
  // FIND SCHOOLS BY LOCATION
  // SUPER_ADMIN ONLY
  // =========================

  @Get('location/:location')
  @Roles(UserRole.SUPER_ADMIN)
  async findSchoolsByLocation(
    @Param('location') location: string,
  ) {
    return this.schoolService.findByLocation(
      location,
    );
  }
}

