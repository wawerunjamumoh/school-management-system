import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnrollmentController } from './enrollment.controller.js';
import { EnrollmentService } from './enrollment.service.js';

import { Enrollment } from './entities/enrollment.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Class } from '../class/entities/class.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { School } from '../school/entities/school.entity.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Student,
      Class,
      AcademicYear,
      Term,
      School,
      SchoolMembership,
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}