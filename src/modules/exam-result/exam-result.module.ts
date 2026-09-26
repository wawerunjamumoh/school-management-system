import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExamResultController } from './exam-result.controller.js';
import { ExamResultService } from './exam-result.service.js';

import { ExamResult } from './entities/exam-result.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Subject } from '../subject/entities/subject.entity.js';
import { Exam } from '../exam/entities/exam.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { School } from '../school/entities/school.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExamResult,
      Student,
      Subject,
      Exam,
      Term,
      School,
      Enrollment,
    ]),
  ],
  controllers: [ExamResultController],
  providers: [ExamResultService],
})
export class ExamResultModule {}
