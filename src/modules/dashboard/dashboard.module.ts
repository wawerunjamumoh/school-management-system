import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';
import { ExamResult } from '../exam-result/entities/exam-result.entity.js';
import { Exam } from '../exam/entities/exam.entity.js';
import { GuardianStudent } from '../guardian-student/entities/guardian-student.entity.js';
import { Guardian } from '../guardian/entities/guardian.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Student, Enrollment, Exam, ExamResult, Guardian, GuardianStudent])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
