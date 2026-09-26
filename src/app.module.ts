import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AppController } from './app.controller.js';

// Modules
import { AppService } from './app.service.js';
import { StudentModule } from './modules/student/student.module.js';
import { TeacherModule } from './modules/teacher/teacher.module.js';
import { EventModule } from './modules/event/event.module.js';
import { TeachingAssignmentModule } from './modules/teaching-assignment/teaching-assignment.module.js';
import { ExamModule } from './modules/exam/exam.module.js';
import { ExamResultModule } from './modules/exam-result/exam-result.module.js';
import { TermModule } from './modules/term/term.module.js';
import { GuardianModule } from './modules/guardian/guardian.module.js';
import { GuardianStudentModule } from './modules/guardian-student/guardian-student.module.js';
import { AcademicYearModule } from './modules/academic-year/academic-year.module.js';
import { EnrollmentModule } from './modules/enrollment/enrollment.module.js';
import { NoticeBoardModule } from './modules/notice-board/notice-board.module.js';
import { ClassModule } from './modules/class/class.module.js';
import { ClassTeacherAssignmentModule } from './modules/class-teacher-assignment/class-teacher-assignment.module.js';
import { SubjectModule } from './modules/subject/subject.module.js';
import { HeadTeacherAssignmentModule } from './modules/head-teacher-assignment/head-teacher-assignment.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SchoolMembershipModule } from './modules/school-membership/school-membership.module.js';
import {SchoolModule} from './modules/school/school.module.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      // host: configService.get('HOST'),
      host: process.env.HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10), // Fixed: Converts string to a base-10 number,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'school-management-system',
    }),
    StudentModule,
    TeacherModule,
    SchoolModule,
    EventModule,
    TeachingAssignmentModule,
    ExamModule,
    ExamResultModule,
    TermModule,
    GuardianModule,
    GuardianStudentModule,
    AcademicYearModule,
    EnrollmentModule,
    NoticeBoardModule,
    ClassModule,
    ClassTeacherAssignmentModule,
    SubjectModule,
    HeadTeacherAssignmentModule,
    AuthModule,
    SchoolMembershipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
