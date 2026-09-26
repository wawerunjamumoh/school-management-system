import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { GuardianStudentService } from './guardian-student.service.js';
import { CreateGuardianStudentDto } from './dto/create-guardian-student.dto.js';
import { UpdateGuardianStudentDto } from './dto/update-guardian-student.dto.js';

@Controller('guardian-students')
export class GuardianStudentController {
  constructor(
    private readonly guardianStudentService: GuardianStudentService,
  ) {}

  // =========================================
  // CREATE RELATIONSHIP
  // =========================================

  @Post()
  create(@Body() createGuardianStudentDto: CreateGuardianStudentDto) {
    return this.guardianStudentService.create(createGuardianStudentDto);
  }

  // =========================================
  // ALL RELATIONSHIPS
  // =========================================

  @Get()
  findAll() {
    return this.guardianStudentService.findAll();
  }

  // =========================================
  // GUARDIAN → STUDENTS
  // =========================================

  @Get('guardian/:guardianId/students')
  findStudentsByGuardian(@Param('guardianId') guardianId: string) {
    return this.guardianStudentService.findStudentsByGuardian(guardianId);
  }

  // =========================================
  // STUDENT → GUARDIANS
  // =========================================

  @Get('student/:studentId/guardians')
  findGuardiansByStudent(@Param('studentId') studentId: string) {
    return this.guardianStudentService.findGuardiansByStudent(studentId);
  }

  @Get(':guardianId/students/:studentId/results')
  async getStudentResults(
    @Param('guardianId') guardianId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.guardianStudentService.getStudentResults(
      guardianId,
      studentId,
    );
  }

  // =========================================
  // ONE RELATIONSHIP
  // =========================================

  @Get(':relationshipId')
  findOne(@Param('relationshipId') relationshipId: string) {
    return this.guardianStudentService.findOne(relationshipId);
  }

  // =========================================
  // UPDATE
  // =========================================

  @Patch(':relationshipId')
  update(
    @Param('relationshipId') relationshipId: string,
    @Body() updateGuardianStudentDto: UpdateGuardianStudentDto,
  ) {
    return this.guardianStudentService.update(
      relationshipId,
      updateGuardianStudentDto,
    );
  }

  // =========================================
  // DELETE
  // =========================================

  @Delete(':relationshipId')
  remove(@Param('relationshipId') relationshipId: string) {
    return this.guardianStudentService.remove(relationshipId);
  }


}
