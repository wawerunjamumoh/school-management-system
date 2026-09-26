import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';
import { HeadTeacherAssignmentController } from './head-teacher-assignment.controller.js';
import { HeadteacherAssignment } from './entities/head-teacher-assignment.entity.js';

import { Teacher } from '../teacher/entities/teacher.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([HeadteacherAssignment,Teacher,School,AcademicYear])
  ],
  controllers: [HeadTeacherAssignmentController],
  providers: [HeadTeacherAssignmentService],
})
export class HeadTeacherAssignmentModule {}
