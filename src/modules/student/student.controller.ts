import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { StudentService } from './student.service.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

import { RolesGuard } from '../auth/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // =========================================================
  // GET ONE STUDENT
  // =========================================================
  //
  // GET /schools/:schoolId/students/:studentId
  //
  // HEAD_TEACHER:
  //     Can view students in their school.
  //
  // TEACHER:
  //     Can view students in their school.
  //
  // GUARDIAN / STUDENT:
  //     Should NOT use this generic endpoint.
  //     They should have dedicated "my children" / "me"
  //     endpoints that prevent accessing arbitrary student IDs.
  //

  @Get(':studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findOneStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentService.findOne(schoolId, studentId);
  }

  // =========================================================
  // UPDATE STUDENT
  // =========================================================
  //
  // PATCH /schools/:schoolId/students/:studentId
  //
  // Only SuperAdmin and HEAD_TEACHER should normally
  // modify student records.
  //

  @Patch(':studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async update(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(schoolId, studentId, dto);
  }

  // =========================================================
  // DELETE STUDENT
  // =========================================================
  //
  // DELETE /schools/:schoolId/students/:studentId
  //
  // Student deletion is a destructive operation.
  //
  // I would restrict it to SuperAdmin and HEAD_TEACHER.
  //

  @Delete(':studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async removeStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentService.remove(schoolId, studentId);
  }

  // =========================================================
  // GET STUDENTS IN CLASS
  // =========================================================
  //
  // GET /schools/:schoolId/students/class/:classId
  //
  // Teachers need this for teaching.
  // Head teachers need it for administration.
  //

  @Get('class/:classId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER)
  async findAllStudentsInClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.studentService.findByClass(schoolId, classId);
  }

  // =========================================================
  // GET ALL STUDENTS IN SCHOOL
  // =========================================================
  //
  // GET /schools/:schoolId/students
  //
  // This exposes the entire student population, so I would
  // NOT give this to teachers by default.
  //

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async findAllStudentsInSchool(@Param('schoolId') schoolId: string) {
    return this.studentService.findBySchool(schoolId);
  }
}
