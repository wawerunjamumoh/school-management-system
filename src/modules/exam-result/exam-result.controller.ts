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

import { ExamResultService } from './exam-result.service.js';
import { CreateExamResultDto } from './dto/create-exam-result.dto.js';
import { UpdateExamResultDto } from './dto/update-exam-result.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/exam-results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamResultController {
  constructor(
    private readonly examResultService: ExamResultService,
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
    @Body() createExamResultDto: CreateExamResultDto,
  ) {
    return this.examResultService.create(
      schoolId,
      createExamResultDto,
    );
  }

  // ---------------------------------------
  // READ - SCHOOL
  // Any authenticated school member
  // ---------------------------------------

  @Get()
  async findBySchool(
    @Param('schoolId') schoolId: string,
  ) {
    return this.examResultService.findBySchool(
      schoolId,
    );
  }

  // ---------------------------------------
  // READ - SUBJECT
  // Any authenticated school member
  // ---------------------------------------

  @Get('subject/:subjectId')
  async getSubjectResults(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.examResultService.findBySubject(
      schoolId,
      subjectId,
    );
  }

  // ---------------------------------------
  // READ - STUDENT + EXAM
  // Any authenticated school member
  // ---------------------------------------

  @Get('student/:studentId/exam/:examId')
  async getStudentExamResults(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
    @Param('examId') examId: string,
  ) {
    return this.examResultService.findByStudentAndExam(
      schoolId,
      studentId,
      examId,
    );
  }

  // ---------------------------------------
  // READ - CLASS + EXAM
  // Any authenticated school member
  // ---------------------------------------

  @Get('class/:classId/exam/:examId')
  async getClassResults(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
    @Param('examId') examId: string,
  ) {
    return this.examResultService.findByClassAndExam(
      schoolId,
      classId,
      examId,
    );
  }

  // ---------------------------------------
  // READ - CLASS + SUBJECT
  // Any authenticated school member
  // ---------------------------------------

  @Get('class/:classId/subject/:subjectId')
  async getClassSubjectResults(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.examResultService.findByClassAndSubject(
      schoolId,
      classId,
      subjectId,
    );
  }

  // ---------------------------------------
  // READ - STUDENT + TERM
  // Any authenticated school member
  // ---------------------------------------

  @Get('student/:studentId/term/:termId')
  async getStudentTermResults(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
    @Param('termId') termId: string,
  ) {
    return this.examResultService.findByStudentAndTerm(
      schoolId,
      studentId,
      termId,
    );
  }

  // ---------------------------------------
  // READ - ONE RESULT
  // Any authenticated school member
  // ---------------------------------------

  @Get(':examResultId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('examResultId') examResultId: string,
  ) {
    return this.examResultService.findOne(
      schoolId,
      examResultId,
    );
  }

  // ---------------------------------------
  // UPDATE
  // SUPER_ADMIN / HEAD_TEACHER / TEACHER
  // ---------------------------------------

  @Patch(':examResultId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  async update(
    @Param('schoolId') schoolId: string,
    @Param('examResultId') examResultId: string,
    @Body() updateExamResultDto: UpdateExamResultDto,
  ) {
    return this.examResultService.update(
      schoolId,
      examResultId,
      updateExamResultDto,
    );
  }

  // ---------------------------------------
  // DELETE
  // SUPER_ADMIN / HEAD_TEACHER
  // ---------------------------------------

  @Delete(':examResultId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('examResultId') examResultId: string,
  ) {
    return this.examResultService.remove(
      schoolId,
      examResultId,
    );
  }
}

