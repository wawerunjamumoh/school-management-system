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

import { EnrollmentService } from './enrollment.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // ==========================================
  // CREATE
  // ==========================================

  // POST /schools/:schoolId/enrollments
  // Super Admin, Head Teacher and Teacher can enroll students
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollmentService.create(schoolId, dto);
  }

  // ==========================================
  // GET ALL
  // ==========================================

  // GET /schools/:schoolId/enrollments
  @Get()
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findAll(@Param('schoolId') schoolId: string) {
    return this.enrollmentService.findBySchool(schoolId);
  }

  // ==========================================
  // BY ACADEMIC YEAR
  // ==========================================

  // GET /schools/:schoolId/enrollments/academic-year/:academicYearId
  @Get('academic-year/:academicYearId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.enrollmentService.findByAcademicYear(schoolId, academicYearId);
  }

  // ==========================================
  // BY STUDENT
  // ==========================================

  // GET /schools/:schoolId/enrollments/student/:studentId
  @Get('student/:studentId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER, UserRole.STUDENT)
  async findByStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.enrollmentService.findByStudent(schoolId, studentId);
  }

  // ==========================================
  // BY CLASS
  // ==========================================

  // GET /schools/:schoolId/enrollments/class/:classId
  @Get('class/:classId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findByClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.enrollmentService.findByClass(schoolId, classId);
  }

  // ==========================================
  // GET ONE
  // ==========================================

  // GET /schools/:schoolId/enrollments/:enrollmentId
  @Get(':enrollmentId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.enrollmentService.findOne(schoolId, enrollmentId);
  }

  // ==========================================
  // UPDATE
  // ==========================================

  // PATCH /schools/:schoolId/enrollments/:enrollmentId
  // Super Admin, Head Teacher and Teacher can update
  @Patch(':enrollmentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async update(
    @Param('schoolId') schoolId: string,
    @Param('enrollmentId') enrollmentId: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(schoolId, enrollmentId, dto);
  }

  // ==========================================
  // DELETE
  // ==========================================

  // DELETE /schools/:schoolId/enrollments/:enrollmentId
  // Deletion remains administrative
  @Delete(':enrollmentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.enrollmentService.remove(schoolId, enrollmentId);
  }
}

