import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { ExamService } from './exam.service.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamController {
  constructor(
    private readonly examService: ExamService,
  ) {}

  // ---------------------------------------
  // CREATE
  // SUPER_ADMIN / HEAD_TEACHER / TEACHER
  // ---------------------------------------

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateExamDto,
  ) {
    return this.examService.create(
      schoolId,
      dto,
    );
  }

  // ---------------------------------------
  // READ - ALL SCHOOL EXAMS
  // Any authenticated school member
  // ---------------------------------------

  @Get()
  async findBySchool(
    @Param('schoolId') schoolId: string,
  ) {
    return this.examService.findBySchool(
      schoolId,
    );
  }

  // ---------------------------------------
  // READ - ACADEMIC YEAR
  // Any authenticated school member
  // ---------------------------------------

  @Get('academic-year/:academicYearId')
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.examService.findByAcademicYear(
      schoolId,
      academicYearId,
    );
  }

  // ---------------------------------------
  // READ - ACADEMIC YEAR + TERM
  // Any authenticated school member
  // ---------------------------------------

  @Get(
    'academic-year/:academicYearId/term/:termId',
  )
  async findByAcademicYearAndTerm(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
    @Param('termId') termId: string,
  ) {
    return this.examService.findByAcademicYearAndTerm(
      schoolId,
      academicYearId,
      termId,
    );
  }

  // ---------------------------------------
  // READ - ONE
  // Any authenticated school member
  // ---------------------------------------

  @Get(':examId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('examId') examId: string,
  ) {
    return this.examService.findOne(
      schoolId,
      examId,
    );
  }

  // ---------------------------------------
  // UPDATE
  // SUPER_ADMIN / HEAD_TEACHER / TEACHER
  // ---------------------------------------

  @Patch(':examId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  async update(
    @Param('schoolId') schoolId: string,
    @Param('examId') examId: string,
    @Body() dto: UpdateExamDto,
  ) {
    return this.examService.update(
      schoolId,
      examId,
      dto,
    );
  }

  // ---------------------------------------
  // DELETE
  // SUPER_ADMIN / HEAD_TEACHER
  // ---------------------------------------

  @Delete(':examId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('examId') examId: string,
  ) {
    return this.examService.remove(
      schoolId,
      examId,
    );
  }
}

