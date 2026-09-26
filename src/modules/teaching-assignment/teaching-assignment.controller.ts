import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { TeachingAssignmentService } from './teaching-assignment.service.js';

import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto.js';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto.js';

@Controller('schools/:schoolId/teaching-assignments')
export class TeachingAssignmentController {
  constructor(
    private readonly teachingAssignmentService: TeachingAssignmentService,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentService.create(schoolId, dto);
  }

  // =====================================================
  // GET ALL
  // =====================================================

  @Get()
  findAll(@Param('schoolId') schoolId: string) {
    return this.teachingAssignmentService.findAll(schoolId);
  }

  // =====================================================
  // FILTER BY TEACHER
  // =====================================================

  @Get('teacher/:teacherId')
  findByTeacher(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teachingAssignmentService.findByTeacher(schoolId, teacherId);
  }

  // =====================================================
  // FILTER BY CLASS
  // =====================================================

  @Get('class/:classId')
  findByClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.teachingAssignmentService.findByClass(schoolId, classId);
  }

  // =====================================================
  // FILTER BY SUBJECT
  // =====================================================

  @Get('subject/:subjectId')
  findBySubject(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.teachingAssignmentService.findBySubject(schoolId, subjectId);
  }

  // =====================================================
  // FILTER BY ACADEMIC YEAR
  // =====================================================

  @Get('academic-year/:academicYearId')
  findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.teachingAssignmentService.findByAcademicYear(
      schoolId,
      academicYearId,
    );
  }

  // =====================================================
  // GET ONE
  // =====================================================

  @Get(':assignmentId')
  findOne(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.teachingAssignmentService.findOne(schoolId, assignmentId);
  }

  // =====================================================
  // UPDATE
  // =====================================================

  @Patch(':assignmentId')
  update(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentService.update(schoolId, assignmentId, dto);
  }

  // =====================================================
  // DELETE
  // =====================================================

  @Delete(':assignmentId')
  remove(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.teachingAssignmentService.remove(schoolId, assignmentId);
  }
}
