import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';
import { HeadTeacherAssignmentController } from './head-teacher-assignment.controller.js';
import { HeadteacherAssignment } from './entities/head-teacher-assignment.entity.js';

import { Teacher } from '../teacher/entities/teacher.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      HeadteacherAssignment,
      SchoolMembership,
      Teacher,
      School,
      AcademicYear,
    ]),
  ],
  controllers: [HeadTeacherAssignmentController],
  providers: [HeadTeacherAssignmentService],
})
export class HeadTeacherAssignmentModule {}
