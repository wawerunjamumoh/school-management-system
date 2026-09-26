import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { GuardianService } from './guardian.service.js';
import { CreateGuardianDto } from './dto/create-guardian.dto.js';
import { UpdateGuardianDto } from './dto/update-guardian.dto.js';

@Controller('schools/:schoolId/guardians')
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  // ---------------------------------------
  // CREATE
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
  // ---------------------------------------

  @Get()
  async findAll(@Param('schoolId') schoolId: string) {
    return this.guardianService.findBySchool(schoolId);
  }

  // ---------------------------------------
  // GET ONE GUARDIAN
  // ---------------------------------------

  @Get(':guardianId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
  ) {
    return this.guardianService.findOne(schoolId, guardianId);
  }

  // ---------------------------------------
  // UPDATE
  // ---------------------------------------

  @Patch(':guardianId')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
    @Body() updateGuardianDto: UpdateGuardianDto,
  ) {
    return this.guardianService.update(schoolId, guardianId, updateGuardianDto);
  }

  // ---------------------------------------
  // DELETE
  // ---------------------------------------

  @Delete(':guardianId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
  ) {
    return this.guardianService.remove(schoolId, guardianId);
  }
}
