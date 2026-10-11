import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ClassTeacherAssignmentService } from './class-teacher-assignment.service.js';
import { CreateClassTeacherAssignmentDto } from './dto/create-class-teacher-assignment.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/class-teacher-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassTeacherAssignmentController {
  constructor(
    private readonly classTeacherAssignmentService: ClassTeacherAssignmentService,
  ) {}

  // ==========================================
  // ASSIGN TEACHER AS CLASS TEACHER
  // ==========================================

  // POST /schools/:schoolId/class-teacher-assignments
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateClassTeacherAssignmentDto,
  ) {
    return this.classTeacherAssignmentService.create(schoolId, dto);
  }

  // ==========================================
  // GET ALL ASSIGNMENTS
  // ==========================================

  // GET /schools/:schoolId/class-teacher-assignments
  @Get()
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findAll(@Param('schoolId') schoolId: string) {
    return this.classTeacherAssignmentService.findAll(schoolId);
  }

  // ==========================================
  // GET ASSIGNMENTS FOR TEACHER
  // ==========================================

  // GET /schools/:schoolId/class-teacher-assignments/teacher/:teacherId
  @Get('teacher/:teacherId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findByTeacher(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.classTeacherAssignmentService.findByTeacher(
      schoolId,
      teacherId,
    );
  }

  // ==========================================
  // GET CLASS TEACHER FOR CLASS
  // ==========================================

  // GET /schools/:schoolId/class-teacher-assignments/class/:classId
  @Get('class/:classId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findByClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.classTeacherAssignmentService.findByClass(schoolId, classId);
  }

  // ==========================================
  // GET ASSIGNMENTS FOR ACADEMIC YEAR
  // ==========================================

  // GET /schools/:schoolId/class-teacher-assignments/academic-year/:academicYearId
  @Get('academic-year/:academicYearId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.classTeacherAssignmentService.findByAcademicYear(
      schoolId,
      academicYearId,
    );
  }

  // ==========================================
  // GET ONE ASSIGNMENT
  // ==========================================

  // GET /schools/:schoolId/class-teacher-assignments/:assignmentId
  @Get(':assignmentId')
  @Roles(UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.classTeacherAssignmentService.findOne(schoolId, assignmentId);
  }

  // ==========================================
  // REMOVE CLASS-TEACHER ASSIGNMENT
  // ==========================================

  // DELETE /schools/:schoolId/class-teacher-assignments/:assignmentId
  @Delete(':assignmentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.classTeacherAssignmentService.remove(schoolId, assignmentId);
  }
}

// Permission map
// Endpoint	Access
// POST /class-teacher-assignments	SUPER_ADMIN, HEAD_TEACHER
// GET /class-teacher-assignments	Authenticated school member
// GET /teacher/:teacherId	Authenticated school member
// GET /class/:classId	Authenticated school member
// GET /academic-year/:academicYearId	Authenticated school member
// GET /:assignmentId	Authenticated school member
// DELETE /:assignmentId	SUPER_ADMIN, HEAD_TEACHER
