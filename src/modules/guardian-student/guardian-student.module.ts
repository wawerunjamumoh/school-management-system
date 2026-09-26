import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GuardianStudentController } from './guardian-student.controller.js';
import { GuardianStudentService } from './guardian-student.service.js';

import { GuardianStudent } from './entities/guardian-student.entity.js';
import { Guardian } from '../guardian/entities/guardian.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { ExamResult } from '../exam-result/entities/exam-result.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([GuardianStudent, Guardian, Student, ExamResult]),
  ],
  controllers: [GuardianStudentController],
  providers: [GuardianStudentService],
})
export class GuardianStudentModule {}
