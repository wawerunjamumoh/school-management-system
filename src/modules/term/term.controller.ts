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

import { TermService } from './term.service.js';
import { CreateTermDto } from './dto/create-term.dto.js';
import { UpdateTermDto } from './dto/update-term.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/terms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TermController {
  constructor(private readonly termService: TermService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateTermDto,
  ) {
    return this.termService.create(schoolId, dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findAll(@Param('schoolId') schoolId: string) {
    return this.termService.findAll(schoolId);
  }

  @Get('academic-year/:academicYearId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.termService.findByAcademicYear(schoolId, academicYearId);
  }

  @Get(':termId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
  ) {
    return this.termService.findOne(schoolId, termId);
  }

  @Patch(':termId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async update(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
    @Body() dto: UpdateTermDto,
  ) {
    return this.termService.update(schoolId, termId, dto);
  }

  @Delete(':termId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
  ) {
    return this.termService.remove(schoolId, termId);
  }
}
