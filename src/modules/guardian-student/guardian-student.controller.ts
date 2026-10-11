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

import { GuardianStudentService } from './guardian-student.service.js';
import { CreateGuardianStudentDto } from './dto/create-guardian-student.dto.js';
import { UpdateGuardianStudentDto } from './dto/update-guardian-student.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/guardian-students') // 👈 Scoped under school context
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardianStudentController {
  constructor(
    private readonly guardianStudentService: GuardianStudentService,
  ) {}

  // =========================================
  // CREATE RELATIONSHIP
  // =========================================

  @Post()
  @Roles(UserRole.TEACHER, UserRole.HEAD_TEACHER) // 🔒 Restricted to management
  create(
    @Param('schoolId') schoolId: string,
    @Body() createGuardianStudentDto: CreateGuardianStudentDto,
  ) {
    return this.guardianStudentService.create(schoolId, createGuardianStudentDto);
  }

  // =========================================
  // ALL RELATIONSHIPS
  // =========================================

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER) // 🔒 Management audit tool
  findAll(@Param('schoolId') schoolId: string) {
    return this.guardianStudentService.findAll(schoolId);
  }

  // =========================================
  // GUARDIAN → STUDENTS
  // =========================================

  @Get('guardian/:guardianId/students')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.GUARDIAN) // 🔓 Guardians can view their own links
  findStudentsByGuardian(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
  ) {
    return this.guardianStudentService.findStudentsByGuardian(schoolId, guardianId);
  }

  // =========================================
  // STUDENT → GUARDIANS
  // =========================================

  @Get('student/:studentId/guardians')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.STUDENT, UserRole.GUARDIAN) // 🔓 Students/Guardians can view family ties
  findGuardiansByStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.guardianStudentService.findGuardiansByStudent(schoolId, studentId);
  }

  // =========================================
  // GUARDIAN & STUDENT → RESULTS
  // =========================================

  @Get(':guardianId/students/:studentId/results')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.STUDENT, UserRole.GUARDIAN) // 🔓 Students/Guardians view academic records
  async getStudentResults(
    @Param('schoolId') schoolId: string,
    @Param('guardianId') guardianId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.guardianStudentService.getStudentResults(schoolId, guardianId, studentId);
  }

  // =========================================
  // ONE RELATIONSHIP
  // =========================================

  @Get(':relationshipId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.GUARDIAN)
  findOne(
    @Param('schoolId') schoolId: string,
    @Param('relationshipId') relationshipId: string,
  ) {
    return this.guardianStudentService.findOne(schoolId, relationshipId);
  }

  // =========================================
  // UPDATE
  // =========================================

  @Patch(':relationshipId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER) // 🔒 Restricted to management
  update(
    @Param('schoolId') schoolId: string,
    @Param('relationshipId') relationshipId: string,
    @Body() updateGuardianStudentDto: UpdateGuardianStudentDto,
  ) {
    return this.guardianStudentService.update(
      schoolId,
      relationshipId,
      updateGuardianStudentDto,
    );
  }

  // =========================================
  // DELETE
  // =========================================

  @Delete(':relationshipId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER) // 🔒 Restricted to management
  remove(
    @Param('schoolId') schoolId: string,
    @Param('relationshipId') relationshipId: string,
  ) {
    return this.guardianStudentService.remove(schoolId, relationshipId);
  }
}
