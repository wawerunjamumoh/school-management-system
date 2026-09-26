import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { EnrollmentService } from './enrollment.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';

@Controller('schools/:schoolId/enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // ==========================================
  // CREATE
  // ==========================================

  // POST /schools/:schoolId/enrollments
  @Post()
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
  async findAll(@Param('schoolId') schoolId: string) {
    return this.enrollmentService.findBySchool(schoolId);
  }

  // ==========================================
  // BY ACADEMIC YEAR
  // ==========================================

  // GET /schools/:schoolId/enrollments/academic-year/:academicYearId
  @Get('academic-year/:academicYearId')
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
  @Patch(':enrollmentId')
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
  @Delete(':enrollmentId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.enrollmentService.remove(schoolId, enrollmentId);
  }
}
