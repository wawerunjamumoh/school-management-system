import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { ExamService } from './exam.service.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';

@Controller('schools/:schoolId/exams')
export class ExamController {
  constructor(
    private readonly examService: ExamService,
  ) {}

  // ---------------------------------------
  // CREATE
  // ---------------------------------------

  @Post()
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
  // ---------------------------------------

  @Patch(':examId')
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
  // ---------------------------------------

  @Delete(':examId')
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