import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { ClassTeacherAssignmentService } from './class-teacher-assignment.service.js';
import { CreateClassTeacherAssignmentDto } from './dto/create-class-teacher-assignment.dto.js';

@Controller('schools/:schoolId/class-teacher-assignments')
export class ClassTeacherAssignmentController {
  constructor(
    private readonly classTeacherAssignmentService: ClassTeacherAssignmentService,
  ) {}

  // Assign a teacher as class teacher
  @Post()
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateClassTeacherAssignmentDto,
  ) {
    return this.classTeacherAssignmentService.create(schoolId, dto);
  }

  // Get all class-teacher assignments in a school
  @Get()
  async findAll(@Param('schoolId') schoolId: string) {
    return this.classTeacherAssignmentService.findAll(schoolId);
  }

  // Get assignments for a specific teacher
  @Get('teacher/:teacherId')
  async findByTeacher(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.classTeacherAssignmentService.findByTeacher(
      schoolId,
      teacherId,
    );
  }

  // Get the class teacher for a specific class
  @Get('class/:classId')
  async findByClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.classTeacherAssignmentService.findByClass(schoolId, classId);
  }

  // Get all class-teacher assignments for an academic year
  @Get('academic-year/:academicYearId')
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.classTeacherAssignmentService.findByAcademicYear(
      schoolId,
      academicYearId,
    );
  }

  // Get one assignment
  @Get(':assignmentId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.classTeacherAssignmentService.findOne(schoolId, assignmentId);
  }

  // Remove a class-teacher assignment
  @Delete(':assignmentId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.classTeacherAssignmentService.remove(schoolId, assignmentId);
  }
}
