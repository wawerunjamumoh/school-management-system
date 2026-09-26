import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';
import { CreateHeadTeacherAssignmentDto } from './dto/create-head-teacher-assignment.dto.js';

@Controller('schools/:schoolId/head-teacher-assignments')
export class HeadTeacherAssignmentController {
  constructor(
    private readonly headTeacherAssignmentService: HeadTeacherAssignmentService,
  ) {}

  // Assign a headteacher to a school for an academic year
  @Post()
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateHeadTeacherAssignmentDto,
  ) {
    return this.headTeacherAssignmentService.create(schoolId, dto);
  }

  // Get all headteacher assignments for a school
  @Get()
  async findAll(@Param('schoolId') schoolId: string) {
    return this.headTeacherAssignmentService.findAll(schoolId);
  }

  // Get the headteacher for a specific academic year
  @Get('academic-year/:academicYearId')
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.headTeacherAssignmentService.findByAcademicYear(
      schoolId,
      academicYearId,
    );
  }

  // Get a specific assignment
  @Get(':assignmentId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.headTeacherAssignmentService.findOne(schoolId, assignmentId);
  }

  // Remove a headteacher assignment
  @Delete(':assignmentId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.headTeacherAssignmentService.remove(schoolId, assignmentId);
  }
}
