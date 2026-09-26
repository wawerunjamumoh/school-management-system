import { Module } from '@nestjs/common';
import { TeachingAssignmentService } from './teaching-assignment.service.js';
import { TeachingAssignmentController } from './teaching-assignment.controller.js';
import {TypeOrmModule} from '@nestjs/typeorm';

import { Teacher } from '../teacher/entities/teacher.entity.js';
import { Subject } from '../subject/entities/subject.entity.js';
import { Class } from '../class/entities/class.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { School } from '../school/entities/school.entity.js';
import { TeachingAssignment} from './entities/teaching-assignment.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeachingAssignment,
      Teacher,
      Subject,
      Class,
      AcademicYear,
      School,
    ]),
  ],
  controllers: [TeachingAssignmentController],
  providers: [TeachingAssignmentService],
})
export class TeachingAssignmentModule {}
