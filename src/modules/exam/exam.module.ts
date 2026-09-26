import {TypeOrmModule} from '@nestjs/typeorm'
import { Module } from '@nestjs/common';
import { ExamService } from './exam.service.js';
import { ExamController } from './exam.controller.js';

import { Exam } from './entities/exam.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { ExamResult } from '../exam-result/entities/exam-result.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, School, AcademicYear, Term, ExamResult]),
  ],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
