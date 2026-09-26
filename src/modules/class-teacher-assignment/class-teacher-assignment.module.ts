
import { Module } from '@nestjs/common';
import { ClassTeacherAssignmentService } from './class-teacher-assignment.service.js';
import { ClassTeacherAssignment } from './entities/class-teacher-assignment.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
// import {TeachingAssignment} from '../teaching-assignment/entities/teaching-assignment.entity.js';
import { Teacher } from '../teacher/entities/teacher.entity.js';
import { Subject } from '../subject/entities/subject.entity.js'
import {Class} from '../class/entities/class.entity.js'
import {AcademicYear} from '../academic-year/entities/academic-year.entity.js';
import {School} from '../school/entities/school.entity.js';
import { ClassTeacherAssignmentController } from './class-teacher-assignment.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassTeacherAssignment,
      Teacher,
      Subject,
      Class,
      AcademicYear,
      School,
    ]),
  ],
  controllers: [ClassTeacherAssignmentController],
  providers: [ClassTeacherAssignmentService],
})
export class ClassTeacherAssignmentModule {}
