import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { ExamResultService } from './exam-result.service.js';
import { CreateExamResultDto } from './dto/create-exam-result.dto.js';
import { UpdateExamResultDto } from './dto/update-exam-result.dto.js';

@Controller('schools/:schoolId/exam-results')
export class ExamResultController {
  constructor(private readonly examResultService: ExamResultService) {}

  // ---------------------------------------
  // CREATE
  // ---------------------------------------

  @Post()
  async create(
    @Param('schoolId') schoolId: string,
    @Body() createExamResultDto: CreateExamResultDto,
  ) {
    return this.examResultService.create(schoolId, createExamResultDto);
  }

  // ---------------------------------------
  // READ - SCHOOL
  // ---------------------------------------

  @Get()
  async findBySchool(@Param('schoolId') schoolId: string) {
    return this.examResultService.findBySchool(schoolId);
  }

  // ---------------------------------------
  // READ - SUBJECT
  // ---------------------------------------

  @Get('subject/:subjectId')
  async getSubjectResults(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.examResultService.findBySubject(schoolId, subjectId);
  }

  // ---------------------------------------
  // READ - STUDENT + EXAM
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
  // ---------------------------------------

  @Get('class/:classId/exam/:examId')
  async getClassResults(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
    @Param('examId') examId: string,
  ) {
    return this.examResultService.findByClassAndExam(schoolId, classId, examId);
  }

  // ---------------------------------------
  // READ - CLASS + SUBJECT
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
  // ---------------------------------------

  @Get(':examResultId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('examResultId') examResultId: string,
  ) {
    return this.examResultService.findOne(schoolId, examResultId);
  }

  // ---------------------------------------
  // UPDATE
  // ---------------------------------------

  @Patch(':examResultId')
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
  // ---------------------------------------

  @Delete(':examResultId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('examResultId') examResultId: string,
  ) {
    return this.examResultService.remove(schoolId, examResultId);
  }
}
