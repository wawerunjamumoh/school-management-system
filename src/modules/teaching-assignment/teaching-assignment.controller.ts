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

import { TeachingAssignmentService } from './teaching-assignment.service.js';

import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto.js';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/teaching-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachingAssignmentController {
  constructor(
    private readonly teachingAssignmentService: TeachingAssignmentService,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
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
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  findAll(@Param('schoolId') schoolId: string) {
    return this.teachingAssignmentService.findAll(schoolId);
  }

  // =====================================================
  // FILTER BY TEACHER
  // =====================================================

  @Get('teacher/:teacherId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  findByTeacher(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teachingAssignmentService.findByTeacher(
      schoolId,
      teacherId,
    );
  }

  // =====================================================
  // FILTER BY CLASS
  // =====================================================

  @Get('class/:classId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  findByClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.teachingAssignmentService.findByClass(
      schoolId,
      classId,
    );
  }

  // =====================================================
  // FILTER BY SUBJECT
  // =====================================================

  @Get('subject/:subjectId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  findBySubject(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.teachingAssignmentService.findBySubject(
      schoolId,
      subjectId,
    );
  }

  // =====================================================
  // FILTER BY ACADEMIC YEAR
  // =====================================================

  @Get('academic-year/:academicYearId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
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
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  findOne(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.teachingAssignmentService.findOne(
      schoolId,
      assignmentId,
    );
  }

  // =====================================================
  // UPDATE
  // =====================================================

  @Patch(':assignmentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  update(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentService.update(
      schoolId,
      assignmentId,
      dto,
    );
  }

  // =====================================================
  // DELETE
  // =====================================================

  @Delete(':assignmentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  remove(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.teachingAssignmentService.remove(
      schoolId,
      assignmentId,
    );
  }
}
;
