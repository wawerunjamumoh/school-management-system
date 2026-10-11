import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';
import { CreateHeadTeacherAssignmentDto } from './dto/create-head-teacher-assignment.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/head-teacher-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HeadTeacherAssignmentController {
  constructor(
    private readonly headTeacherAssignmentService: HeadTeacherAssignmentService,
  ) {}

  // =========================================
  // CREATE ASSIGNMENT
  // SUPER_ADMIN ONLY
  // =========================================

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateHeadTeacherAssignmentDto,
  ) {
    return this.headTeacherAssignmentService.create(
      schoolId,
      dto,
    );
  }

  // =========================================
  // GET ALL ASSIGNMENTS
  // SUPER_ADMIN / HEAD_TEACHER
  // =========================================

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async findAll(
    @Param('schoolId') schoolId: string,
  ) {
    return this.headTeacherAssignmentService.findAll(
      schoolId,
    );
  }

  // =========================================
  // GET BY ACADEMIC YEAR
  // SUPER_ADMIN / HEAD_TEACHER
  // =========================================

  @Get('academic-year/:academicYearId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.headTeacherAssignmentService.findByAcademicYear(
      schoolId,
      academicYearId,
    );
  }

  // =========================================
  // GET ONE ASSIGNMENT
  // SUPER_ADMIN / HEAD_TEACHER
  // =========================================

  @Get(':assignmentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.headTeacherAssignmentService.findOne(
      schoolId,
      assignmentId,
    );
  }

  // =========================================
  // DELETE ASSIGNMENT
  // SUPER_ADMIN ONLY
  // =========================================

  @Delete(':assignmentId')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.headTeacherAssignmentService.remove(
      schoolId,
      assignmentId,
    );
  }
}
