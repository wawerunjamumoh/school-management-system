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

import { TeacherService } from './teacher.service.js';

import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { UpdateSubjectDto } from '../subject/dto/update-subject.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // =========================================================
  // TEACHER PROFILE
  // =========================================================

  // GET /schools/:schoolId/teachers
  //
  // Only school leadership should see the complete
  // teacher list.

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async findAll(@Param('schoolId') schoolId: string) {
    return this.teacherService.findAll(schoolId);
  }

  // GET /schools/:schoolId/teachers/:teacherId
  //
  // Teachers should be able to view teacher profiles
  // when necessary, but this should still be school-scoped.

  @Get(':teacherId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.findOne(schoolId, teacherId);
  }

  // PATCH /schools/:schoolId/teachers/:teacherId
  //
  // Teacher records should be managed by school leadership.
  //
  // A teacher should not be able to modify another teacher's
  // school profile through this endpoint.

  @Patch(':teacherId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async update(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(schoolId, teacherId, updateTeacherDto);
  }

  // DELETE /schools/:schoolId/teachers/:teacherId
  //
  // Removing a teacher from a school is a sensitive
  // administrative operation.

  @Delete(':teacherId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.remove(schoolId, teacherId);
  }

  // =========================================================
  // TEACHER SUBJECTS
  // =========================================================

  // GET /schools/:schoolId/teachers/:teacherId/subjects
  //
  // Teachers and school leadership can view assignments.

  @Get(':teacherId/subjects')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async getSubjects(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.getSubjects(schoolId, teacherId);
  }

  // POST /schools/:schoolId/teachers/:teacherId/subjects
  //
  // Assigning a subject to a teacher is an administrative
  // operation, so teachers should not assign themselves
  // subjects.

  @Post(':teacherId/subjects')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async addSubject(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.teacherService.addSubject(schoolId, teacherId, dto);
  }

  // DELETE /schools/:schoolId/teachers/:teacherId/subjects/:subjectId
  //
  // Removing a subject assignment is also administrative.

  @Delete(':teacherId/subjects/:subjectId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async deleteSubject(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.teacherService.deleteSubject(schoolId, teacherId, subjectId);
  }

  // =========================================================
  // TEACHER STUDENTS
  // =========================================================

  // GET /schools/:schoolId/teachers/:teacherId/classes/:classId/students
  //
  // A teacher can access students in classes they teach.
  //
  // IMPORTANT:
  // RolesGuard alone is not enough here.
  // The service/policy layer should verify that:
  //
  // teacherId belongs to the authenticated user OR
  // the requester is HEAD_TEACHER/SUPER_ADMIN,
  //
  // AND
  //
  // the teacher actually teaches this class.

  @Get(':teacherId/classes/:classId/students')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async getClassStudents(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Param('classId') classId: string,
  ) {
    return this.teacherService.getClassStudents(schoolId, teacherId, classId);
  }

  // =========================================================
  // VERIFY TEACHER
  // =========================================================

  // POST /schools/:schoolId/teachers/:teacherId/verify
  //
  // Teacher verification is a high-trust operation.
  // Only school leadership should perform it.

  @Post(':teacherId/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async verifyTeacher(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.verifyTeacher(schoolId, teacherId);
  }
}
