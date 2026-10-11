import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { GuardianService } from './guardian.service.js';
import { CreateGuardianDto } from './dto/create-guardian.dto.js';
import { UpdateGuardianDto } from './dto/update-guardian.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/guardians')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  // ---------------------------------------
  // CREATE GUARDIAN ACCOUNT
  // SUPER_ADMIN / HEAD_TEACHER / TEACHER
  // ---------------------------------------

  @Post()
  async create(
    @Param('schoolId') schoolId: string,
    @Body() createGuardianDto: CreateGuardianDto,
  ) {
    return this.guardianService.create(schoolId, createGuardianDto);
  }

  // ---------------------------------------
  // GET ALL GUARDIANS IN SCHOOL
  // Authenticated school members
  // ---------------------------------------

  @Get()
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findAll(@Param('schoolId') schoolId: string) {
    return this.guardianService.findBySchool(schoolId);
  }

  // ---------------------------------------
  // GET ONE GUARDIAN
  // Authenticated school members
  // ---------------------------------------

  @Get(':guardianId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
  ) {
    return this.guardianService.findOne(schoolId, guardianId);
  }

  // ---------------------------------------
  // UPDATE GUARDIAN
  // SUPER_ADMIN / HEAD_TEACHER
  // ---------------------------------------

  @Patch(':guardianId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async update(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
    @Body() updateGuardianDto: UpdateGuardianDto,
  ) {
    return this.guardianService.update(schoolId, guardianId, updateGuardianDto);
  }

  // ---------------------------------------
  // DELETE GUARDIAN
  // SUPER_ADMIN / HEAD_TEACHER
  // ---------------------------------------

  @Delete(':guardianId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
  ) {
    return this.guardianService.remove(schoolId, guardianId);
  }
}
